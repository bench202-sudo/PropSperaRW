import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InquiryNotification, EmailNotificationStatus } from '@/types';
import {
  MailIcon, RefreshIcon, SearchIcon, CheckCircleIcon, XCircleIcon,
  ClockIcon, AlertCircleIcon, TrendingUpIcon, SendIcon, FilterIcon,
  ChevronLeftIcon, ChevronRightIcon, ActivityIcon, EyeIcon, DownloadIcon
} from '@/components/icons/Icons';
import EmailVolumeChart from './EmailVolumeChart';

interface AdminEmailDashboardProps {
  // No props needed - standalone component
}

interface InquiryRecord {
  id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
  email_notification_sent: boolean;
}

type StatusFilter = 'all' | EmailNotificationStatus;
type SortField = 'created_at' | 'agent_name' | 'email_status' | 'buyer_name';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const AdminEmailDashboard: React.FC<AdminEmailDashboardProps> = () => {
  const [notifications, setNotifications] = useState<InquiryNotification[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail view
  const [selectedNotification, setSelectedNotification] = useState<InquiryNotification | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [notifsResult, inquiriesResult] = await Promise.all([
        supabase
          .from('inquiry_notifications')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('inquiries')
          .select('id, status, created_at, responded_at, email_notification_sent')
          .order('created_at', { ascending: false })
      ]);

      if (notifsResult.error) {
        console.error('Error fetching notifications:', notifsResult.error);
        setError('Failed to load email notifications.');
      } else {
        setNotifications(notifsResult.data || []);
      }

      if (inquiriesResult.error) {
        console.error('Error fetching inquiries:', inquiriesResult.error);
      } else {
        setInquiries(inquiriesResult.data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stats
  const stats = useMemo(() => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.email_status === 'sent' || n.email_status === 'delivered').length;
    const failed = notifications.filter(n => n.email_status === 'failed' || n.email_status === 'bounced').length;
    const pending = notifications.filter(n => n.email_status === 'pending').length;
    const deliveryRate = total > 0 ? ((sent / total) * 100).toFixed(1) : '0.0';

    // Response rate: inquiries that were responded to / total inquiries
    const totalInquiries = inquiries.length;
    const respondedInquiries = inquiries.filter(i => i.status === 'responded' || i.status === 'closed').length;
    const responseRate = totalInquiries > 0 ? ((respondedInquiries / totalInquiries) * 100).toFixed(1) : '0.0';

    // Average response time (only for responded inquiries)
    const respondedWithTime = inquiries.filter(i => i.responded_at && i.created_at);
    let avgResponseTimeHours = 0;
    if (respondedWithTime.length > 0) {
      const totalMs = respondedWithTime.reduce((sum, i) => {
        const created = new Date(i.created_at).getTime();
        const responded = new Date(i.responded_at!).getTime();
        return sum + (responded - created);
      }, 0);
      avgResponseTimeHours = totalMs / respondedWithTime.length / (1000 * 60 * 60);
    }

    // Today's emails
    const today = new Date().toISOString().split('T')[0];
    const todayEmails = notifications.filter(n => n.created_at && new Date(n.created_at).toISOString().split('T')[0] === today).length;

    // This week's emails
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEmails = notifications.filter(n => n.created_at && new Date(n.created_at) >= weekAgo).length;

    return {
      total, sent, failed, pending, deliveryRate,
      totalInquiries, respondedInquiries, responseRate,
      avgResponseTimeHours, todayEmails, weekEmails
    };
  }, [notifications, inquiries]);

  // Filtered & sorted notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(n => n.email_status === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(n =>
        (n.agent_name && n.agent_name.toLowerCase().includes(q)) ||
        (n.agent_email && n.agent_email.toLowerCase().includes(q)) ||
        (n.buyer_name && n.buyer_name.toLowerCase().includes(q)) ||
        (n.buyer_email && n.buyer_email.toLowerCase().includes(q)) ||
        (n.property_title && n.property_title.toLowerCase().includes(q)) ||
        (n.email_subject && n.email_subject.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'created_at':
          valA = new Date(a.created_at || '').getTime();
          valB = new Date(b.created_at || '').getTime();
          break;
        case 'agent_name':
          valA = (a.agent_name || '').toLowerCase();
          valB = (b.agent_name || '').toLowerCase();
          break;
        case 'email_status':
          valA = a.email_status || '';
          valB = b.email_status || '';
          break;
        case 'buyer_name':
          valA = (a.buyer_name || '').toLowerCase();
          valB = (b.buyer_name || '').toLowerCase();
          break;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [notifications, statusFilter, searchQuery, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / PAGE_SIZE);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Resend failed notification
  const handleResend = async (notification: InquiryNotification) => {
    setResendingId(notification.id);
    setResendSuccess(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-inquiry-notification', {
        body: {
          inquiry_id: notification.inquiry_id,
          agent_id: notification.agent_id,
          property_id: notification.property_id || '',
          property_title: notification.property_title || 'Property Inquiry',
          buyer_name: notification.buyer_name,
          buyer_email: notification.buyer_email,
          buyer_phone: notification.buyer_phone || '',
          message: notification.message_preview || 'Inquiry resent by admin.',
        }
      });

      if (fnError) {
        console.error('Resend error:', fnError);
        setError(`Failed to resend: ${fnError.message}`);
      } else if (data?.email_sent) {
        setResendSuccess(notification.id);
        // Refresh data
        await fetchData();
        setTimeout(() => setResendSuccess(null), 3000);
      } else {
        setError(data?.warning || 'Email send failed. Check configuration.');
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      setError('Failed to resend notification.');
    } finally {
      setResendingId(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Agent', 'Agent Email', 'Buyer', 'Buyer Email', 'Property', 'Status', 'Subject'];
    const rows = filteredNotifications.map(n => [
      n.created_at ? new Date(n.created_at).toLocaleString() : '',
      n.agent_name || '',
      n.agent_email || '',
      n.buyer_name || '',
      n.buyer_email || '',
      n.property_title || '',
      n.email_status || '',
      n.email_subject || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `email-notifications-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircleIcon size={12} />
            {status === 'delivered' ? 'Delivered' : 'Sent'}
          </span>
        );
      case 'failed':
      case 'bounced':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircleIcon size={12} />
            {status === 'bounced' ? 'Bounced' : 'Failed'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <ClockIcon size={12} />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatResponseTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  // Detail view
  if (selectedNotification) {
    return (
      <div className="p-5 space-y-4">
        <button
          onClick={() => setSelectedNotification(null)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <ChevronLeftIcon size={16} />
          Back to Email Dashboard
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Email Notification Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedNotification.created_at ? new Date(selectedNotification.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            {getStatusBadge(selectedNotification.email_status)}
          </div>

          {/* Subject */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Subject</p>
            <p className="text-sm text-gray-900 font-medium">{selectedNotification.email_subject || 'N/A'}</p>
          </div>

          {/* Recipient & Sender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 mb-2 font-medium uppercase tracking-wide">Agent (Recipient)</p>
              <p className="text-sm font-semibold text-gray-900">{selectedNotification.agent_name || 'Unknown'}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedNotification.agent_email}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-xs text-amber-600 mb-2 font-medium uppercase tracking-wide">Buyer (Sender)</p>
              <p className="text-sm font-semibold text-gray-900">{selectedNotification.buyer_name}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedNotification.buyer_email}</p>
              {selectedNotification.buyer_phone && (
                <p className="text-xs text-gray-500">{selectedNotification.buyer_phone}</p>
              )}
            </div>
          </div>

          {/* Property */}
          {selectedNotification.property_title && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-xs text-emerald-600 mb-1 font-medium uppercase tracking-wide">Property</p>
              <p className="text-sm font-semibold text-gray-900">{selectedNotification.property_title}</p>
            </div>
          )}

          {/* Message Preview */}
          {selectedNotification.message_preview && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Message Preview</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedNotification.message_preview}
              </p>
            </div>
          )}

          {/* Dashboard Link */}
          {selectedNotification.dashboard_link && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Dashboard Link</p>
              <a
                href={selectedNotification.dashboard_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {selectedNotification.dashboard_link}
              </a>
            </div>
          )}

          {/* Error Message */}
          {selectedNotification.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs text-red-600 mb-1 font-medium uppercase tracking-wide">Error Details</p>
              <p className="text-sm text-red-700">{selectedNotification.error_message}</p>
            </div>
          )}

          {/* Provider Response */}
          {selectedNotification.email_provider_response && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Provider Response</p>
              <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap bg-white border border-gray-200 rounded p-3 max-h-40">
                {JSON.stringify(selectedNotification.email_provider_response, null, 2)}
              </pre>
            </div>
          )}

          {/* Resend button for failed */}
          {(selectedNotification.email_status === 'failed' || selectedNotification.email_status === 'bounced') && (
            <button
              onClick={() => handleResend(selectedNotification)}
              disabled={resendingId === selectedNotification.id}
              className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resendingId === selectedNotification.id ? (
                <>
                  <RefreshIcon size={16} className="animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <SendIcon size={16} />
                  Resend Notification
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <XCircleIcon size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Resend Success */}
      {resendSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon size={20} className="text-emerald-600" />
            <p className="text-sm text-emerald-700 font-medium">Notification resent successfully!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Email Notifications</h3>
          <p className="text-sm text-gray-500 mt-0.5">Monitor all inquiry email notifications across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredNotifications.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Export to CSV"
          >
            <DownloadIcon size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshIcon size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading email data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MailIcon size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Total Emails</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.todayEmails} today · {stats.weekEmails} this week</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Sent</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
              <p className="text-xs text-emerald-600 mt-1">{stats.deliveryRate}% delivery rate</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <XCircleIcon size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Failed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              <p className="text-xs text-red-600 mt-1">{stats.pending > 0 ? `${stats.pending} pending` : 'No pending'}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUpIcon size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-600 font-medium">Response Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.respondedInquiries}/{stats.totalInquiries} inquiries
              </p>
            </div>
          </div>

          {/* Aggregate Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <ClockIcon size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Avg Response Time</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {stats.avgResponseTimeHours > 0 ? formatResponseTime(stats.avgResponseTimeHours) : 'N/A'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <ActivityIcon size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Today's Volume</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.todayEmails}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <MailIcon size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Weekly Volume</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.weekEmails}</p>
            </div>
          </div>

          {/* Email Volume Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Email Volume (Last 14 Days)</h4>
              <span className="text-xs text-gray-400">Stacked by status</span>
            </div>
            <EmailVolumeChart notifications={notifications} days={14} />
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by agent, buyer, property, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FilterIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="bounced">Bounced</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {paginatedNotifications.length} of {filteredNotifications.length} notifications
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Notifications Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <button
                onClick={() => toggleSort('created_at')}
                className="col-span-2 flex items-center gap-1 hover:text-gray-700 text-left"
              >
                Date
                {sortField === 'created_at' && (
                  <span className="text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                onClick={() => toggleSort('agent_name')}
                className="col-span-3 flex items-center gap-1 hover:text-gray-700 text-left"
              >
                Recipient (Agent)
                {sortField === 'agent_name' && (
                  <span className="text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                onClick={() => toggleSort('buyer_name')}
                className="col-span-3 flex items-center gap-1 hover:text-gray-700 text-left"
              >
                Buyer
                {sortField === 'buyer_name' && (
                  <span className="text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                onClick={() => toggleSort('email_status')}
                className="col-span-2 flex items-center gap-1 hover:text-gray-700 text-left"
              >
                Status
                {sortField === 'email_status' && (
                  <span className="text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Body */}
            {paginatedNotifications.length === 0 ? (
              <div className="text-center py-12">
                <MailIcon size={40} className="text-gray-300 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900">No Notifications Found</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Email notifications will appear here when inquiries are submitted.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {paginatedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer items-center"
                    onClick={() => setSelectedNotification(notif)}
                  >
                    {/* Date */}
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-900 font-medium">
                        {notif.created_at ? formatTimeAgo(notif.created_at) : 'N/A'}
                      </p>
                      <p className="text-[10px] text-gray-400 hidden sm:block">
                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>

                    {/* Agent */}
                    <div className="sm:col-span-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notif.agent_name || 'Unknown Agent'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{notif.agent_email}</p>
                    </div>

                    {/* Buyer */}
                    <div className="sm:col-span-3">
                      <p className="text-sm font-medium text-gray-700 truncate">{notif.buyer_name}</p>
                      <p className="text-xs text-gray-400 truncate">{notif.buyer_email}</p>
                    </div>

                    {/* Status */}
                    <div className="sm:col-span-2">
                      {getStatusBadge(notif.email_status)}
                    </div>

                    {/* Actions */}
                    <div className="sm:col-span-2 flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedNotification(notif); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <EyeIcon size={14} />
                      </button>
                      {(notif.email_status === 'failed' || notif.email_status === 'bounced') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleResend(notif); }}
                          disabled={resendingId === notif.id}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Resend notification"
                        >
                          {resendingId === notif.id ? (
                            <RefreshIcon size={14} className="animate-spin" />
                          ) : (
                            <SendIcon size={14} />
                          )}
                        </button>
                      )}
                      {resendSuccess === notif.id && (
                        <CheckCircleIcon size={14} className="text-emerald-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeftIcon size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Failed Notifications Quick Actions */}
          {stats.failed > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircleIcon size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">
                    {stats.failed} Failed Notification{stats.failed !== 1 ? 's' : ''}
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Some email notifications failed to deliver. You can resend them individually from the table above, 
                    or use the bulk resend option below.
                  </p>
                  <button
                    onClick={async () => {
                      const failedNotifs = notifications.filter(n => n.email_status === 'failed' || n.email_status === 'bounced');
                      if (failedNotifs.length === 0) return;
                      if (!confirm(`Resend ${failedNotifs.length} failed notification(s)?`)) return;
                      
                      for (const notif of failedNotifs) {
                        await handleResend(notif);
                      }
                    }}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                  >
                    <SendIcon size={14} />
                    Resend All Failed ({stats.failed})
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminEmailDashboard;
