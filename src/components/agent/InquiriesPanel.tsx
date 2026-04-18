import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Inquiry, InquiryStatus } from '@/types';
import { useLanguage } from '@/contexts/AuthContext';
import { 
  XIcon, 
  MessageIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  PhoneIcon,
  MailIcon,
  BuildingIcon,
  RefreshIcon,
  ChevronRightIcon
} from '@/components/icons/Icons';

interface InquiryNotification {
  id: string;
  inquiry_id: string;
  email_status: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';
  agent_email: string;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
}

interface InquiriesPanelProps {
  agentId: string;
  onClose: () => void;
}

const InquiriesPanel: React.FC<InquiriesPanelProps> = ({ agentId, onClose }) => {
  const { t } = useLanguage();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | 'all'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notificationMap, setNotificationMap] = useState<Record<string, InquiryNotification>>({});

  useEffect(() => {
    fetchInquiries();
  }, [agentId]);

  // Fetch notification status when an inquiry is selected
  useEffect(() => {
    if (selectedInquiry?.id && !notificationMap[selectedInquiry.id]) {
      fetchNotificationStatus(selectedInquiry.id);
    }
  }, [selectedInquiry?.id]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries:', error);
        return;
      }

      setInquiries(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStatus = async (inquiryId: string) => {
    try {
      const { data, error } = await supabase
        .from('inquiry_notifications')
        .select('id, inquiry_id, email_status, agent_email, sent_at, created_at, error_message')
        .eq('inquiry_id', inquiryId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching notification status:', error);
        return;
      }

      if (data) {
        setNotificationMap(prev => ({ ...prev, [inquiryId]: data }));
      }
    } catch (err) {
      console.warn('Error fetching notification:', err);
    }
  };

  const handleUpdateStatus = async (inquiryId: string, newStatus: InquiryStatus) => {
    setActionLoading(inquiryId);
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'responded') {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', inquiryId);

      if (error) throw error;

      // Update local state
      setInquiries(prev => prev.map(inq => 
        inq.id === inquiryId ? { ...inq, ...updateData } : inq
      ));

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(prev => prev ? { ...prev, ...updateData } : null);
      }

    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInquiries = filterStatus === 'all' 
    ? inquiries 
    : inquiries.filter(inq => inq.status === filterStatus);

  const newCount = inquiries.filter(i => i.status === 'pending').length;
  const respondedCount = inquiries.filter(i => i.status === 'responded').length;
  const closedCount = inquiries.filter(i => i.status === 'closed').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return t('justNow');
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: InquiryStatus) => {
    const styles: Record<InquiryStatus, { bg: string; text: string; label: string }> = {
      new: { bg: 'bg-blue-100', text: 'text-blue-700', label: t('statusNew') },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: t('pendingLabel') },
      responded: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: t('statusResponded') },
      closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: t('statusClosed') }
    };
    return styles[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  const getEmailStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return { bg: 'bg-green-100', text: 'text-green-700', label: status === 'delivered' ? t('emailDelivered') : t('emailStatusSent'), icon: 'check' };
      case 'failed':
      case 'bounced':
        return { bg: 'bg-red-100', text: 'text-red-700', label: status === 'bounced' ? t('emailBounced') : t('emailFailed'), icon: 'x' };
      case 'pending':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: t('pendingLabel'), icon: 'clock' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: t('emailUnknown'), icon: 'info' };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] flex items-center justify-center">
      <div className="bg-white w-full h-full lg:w-[90vw] lg:h-[90vh] lg:max-w-5xl lg:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">{t('propertyInquiries')}</h1>
              <p className="text-emerald-100 text-sm">{t('manageBuyerMessages')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchInquiries}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshIcon size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{newCount}</p>
              <p className="text-emerald-100 text-xs">New</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{respondedCount}</p>
              <p className="text-emerald-100 text-xs">Responded</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{closedCount}</p>
              <p className="text-emerald-100 text-xs">Closed</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
          {(['all', 'pending', 'responded', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' && ` (${inquiries.length})`}
              {status === 'pending' && ` (${newCount})`}
              {status === 'responded' && ` (${respondedCount})`}
              {status === 'closed' && ` (${closedCount})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Inquiries List */}
          <div className={`${selectedInquiry ? 'hidden lg:block lg:w-2/5' : 'w-full'} border-r border-gray-100 overflow-y-auto`}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading inquiries...</p>
                </div>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageIcon size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No inquiries yet</h3>
                <p className="text-gray-500 text-sm">
                  {filterStatus === 'all' 
                    ? 'When buyers contact you about your properties, their messages will appear here.'
                    : `No ${filterStatus} inquiries at the moment.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredInquiries.map((inquiry) => {
                  const statusStyle = getStatusBadge(inquiry.status as InquiryStatus);
                  const notification = notificationMap[inquiry.id];
                  return (
                    <button
                      key={inquiry.id}
                      onClick={() => setSelectedInquiry(inquiry)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedInquiry?.id === inquiry.id ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{inquiry.buyer_name}</span>
                            {inquiry.status === 'pending' && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1 mb-1">
                            {inquiry.property_title || 'Property Inquiry'}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">{inquiry.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-400">{formatDate(inquiry.created_at)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                          </span>
                          {/* Email notification indicator */}
                          {notification && (
                            <div className="flex items-center gap-1">
                              {notification.email_status === 'sent' || notification.email_status === 'delivered' ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                  <polyline points="22,6 12,13 2,6" />
                                </svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                  <polyline points="22,6 12,13 2,6" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inquiry Detail */}
          {selectedInquiry && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Detail Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRightIcon size={20} className="rotate-180 text-gray-500" />
                </button>
                <h3 className="font-semibold text-gray-900">Inquiry Details</h3>
                <div className="flex items-center gap-2">
                  {selectedInquiry.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedInquiry.id, 'responded')}
                      disabled={actionLoading === selectedInquiry.id}
                      className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === selectedInquiry.id ? 'Updating...' : 'Mark Responded'}
                    </button>
                  )}
                  {selectedInquiry.status === 'responded' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedInquiry.id, 'closed')}
                      disabled={actionLoading === selectedInquiry.id}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === selectedInquiry.id ? 'Updating...' : 'Mark Closed'}
                    </button>
                  )}
                  {selectedInquiry.status === 'closed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedInquiry.id, 'pending')}
                      disabled={actionLoading === selectedInquiry.id}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === selectedInquiry.id ? 'Updating...' : 'Reopen'}
                    </button>
                  )}
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Email Notification Status Banner */}
                {notificationMap[selectedInquiry.id] && (
                  <div className={`rounded-xl p-3 flex items-center gap-3 ${
                    notificationMap[selectedInquiry.id].email_status === 'sent' || notificationMap[selectedInquiry.id].email_status === 'delivered'
                      ? 'bg-green-50 border border-green-200'
                      : notificationMap[selectedInquiry.id].email_status === 'failed' || notificationMap[selectedInquiry.id].email_status === 'bounced'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-amber-50 border border-amber-200'
                  }`}>
                    {(notificationMap[selectedInquiry.id].email_status === 'sent' || notificationMap[selectedInquiry.id].email_status === 'delivered') ? (
                      <>
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircleIcon size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">Email notification sent</p>
                          <p className="text-xs text-green-600">
                            Sent to {notificationMap[selectedInquiry.id].agent_email}
                            {notificationMap[selectedInquiry.id].sent_at && (
                              <> on {new Date(notificationMap[selectedInquiry.id].sent_at!).toLocaleString()}</>
                            )}
                          </p>
                        </div>
                      </>
                    ) : (notificationMap[selectedInquiry.id].email_status === 'failed' || notificationMap[selectedInquiry.id].email_status === 'bounced') ? (
                      <>
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800">Email notification failed</p>
                          <p className="text-xs text-red-600">
                            {notificationMap[selectedInquiry.id].error_message || 'The email could not be delivered. Please respond manually.'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ClockIcon size={16} className="text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800">Email notification pending</p>
                          <p className="text-xs text-amber-600">The notification is being processed...</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Buyer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Buyer Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-semibold">
                          {selectedInquiry.buyer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedInquiry.buyer_name}</p>
                        <p className="text-sm text-gray-500">Potential Buyer</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <MailIcon size={16} className="text-gray-400" />
                      <a 
                        href={`mailto:${selectedInquiry.buyer_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedInquiry.buyer_email}
                      </a>
                    </div>
                    
                    {selectedInquiry.buyer_phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <PhoneIcon size={16} className="text-gray-400" />
                        <a 
                          href={`tel:${selectedInquiry.buyer_phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedInquiry.buyer_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Info */}
                {selectedInquiry.property_title && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Property</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BuildingIcon size={20} className="text-blue-600" />
                      </div>
                      <p className="text-gray-700">{selectedInquiry.property_title}</p>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Received on {new Date(selectedInquiry.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${selectedInquiry.buyer_email}?subject=Re: ${selectedInquiry.property_title || 'Property Inquiry'}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <MailIcon size={18} />
                      Reply via Email
                    </a>
                    {selectedInquiry.buyer_phone && (
                      <a
                        href={`tel:${selectedInquiry.buyer_phone}`}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                      >
                        <PhoneIcon size={18} />
                        Call Buyer
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Status History</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Inquiry Received</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedInquiry.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Email notification event in timeline */}
                    {notificationMap[selectedInquiry.id] && (
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          notificationMap[selectedInquiry.id].email_status === 'sent' || notificationMap[selectedInquiry.id].email_status === 'delivered'
                            ? 'bg-green-500'
                            : notificationMap[selectedInquiry.id].email_status === 'failed' || notificationMap[selectedInquiry.id].email_status === 'bounced'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Email Notification {
                              notificationMap[selectedInquiry.id].email_status === 'sent' || notificationMap[selectedInquiry.id].email_status === 'delivered'
                                ? 'Sent'
                                : notificationMap[selectedInquiry.id].email_status === 'failed' || notificationMap[selectedInquiry.id].email_status === 'bounced'
                                ? 'Failed'
                                : 'Pending'
                            }
                          </p>
                          <p className="text-xs text-gray-500">
                            {notificationMap[selectedInquiry.id].sent_at
                              ? new Date(notificationMap[selectedInquiry.id].sent_at!).toLocaleString()
                              : new Date(notificationMap[selectedInquiry.id].created_at).toLocaleString()
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedInquiry.responded_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Marked as Responded</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedInquiry.responded_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedInquiry.status === 'closed' && selectedInquiry.updated_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Inquiry Closed</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedInquiry.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state for detail panel on desktop */}
          {!selectedInquiry && filteredInquiries.length > 0 && (
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageIcon size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500">Select an inquiry to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiriesPanel;
