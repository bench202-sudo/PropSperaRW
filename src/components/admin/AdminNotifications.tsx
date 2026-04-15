import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminNotification } from '@/types';
import { formatDate } from '@/data/mockData';
import { 
  BellIcon, UserPlusIcon, CheckCircleIcon, XCircleIcon, 
  ClockIcon, RefreshIcon, MailIcon, PhoneIcon
} from '@/components/icons/Icons';

interface AdminNotificationsProps {
  onApproveAgent: (agentId: string, feedback?: string) => Promise<void>;
  onRejectAgent: (agentId: string, feedback?: string) => Promise<void>;
  actionLoading: string | null;
}

const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  onApproveAgent,
  onRejectAgent,
  actionLoading
}) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ agentId: string; action: 'approve' | 'reject' } | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select(`
          *,
          agent:agents(
            id,
            full_name,
            email,
            phone,
            company_name,
            avatar_url,
            verification_status,
            license_number,
            years_experience,
            specializations
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('admin_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      await supabase
        .from('admin_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', unreadIds);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleActionWithFeedback = (agentId: string, action: 'approve' | 'reject') => {
    setPendingAction({ agentId, action });
    setFeedbackMessage('');
    setShowFeedbackModal(true);
  };

  const submitActionWithFeedback = async () => {
    if (!pendingAction) return;

    const { agentId, action } = pendingAction;
    
    if (action === 'approve') {
      await onApproveAgent(agentId, feedbackMessage || undefined);
    } else {
      await onRejectAgent(agentId, feedbackMessage || undefined);
    }

    setShowFeedbackModal(false);
    setPendingAction(null);
    setFeedbackMessage('');
    fetchNotifications();
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellIcon size={20} className="text-blue-600" />
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
              Mark all read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshIcon size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <BellIcon size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">No Notifications</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'unread' ? 'All notifications have been read.' : 'No notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white border rounded-xl p-4 transition-all ${
                !notification.is_read ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.type === 'agent_signup' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <UserPlusIcon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                      {notification.message && (
                        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {getTimeAgo(notification.created_at)}
                    </span>
                  </div>

                  {notification.agent && notification.type === 'agent_signup' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        {notification.agent.avatar_url ? (
                          <img 
                            src={notification.agent.avatar_url}
                            alt={notification.agent.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {notification.agent.full_name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{notification.agent.full_name}</p>
                          <p className="text-xs text-gray-500">{notification.agent.company_name}</p>
                        </div>
                        {notification.agent.verification_status === 'pending' ? (
                          <span className="ml-auto flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                            <ClockIcon size={12} />
                            Pending
                          </span>
                        ) : notification.agent.verification_status === 'approved' ? (
                          <span className="ml-auto flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            <CheckCircleIcon size={12} />
                            Approved
                          </span>
                        ) : (
                          <span className="ml-auto bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                            Rejected
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MailIcon size={12} />
                          <span className="truncate">{notification.agent.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PhoneIcon size={12} />
                          <span>{notification.agent.phone}</span>
                        </div>
                      </div>

                      {notification.agent.verification_status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleActionWithFeedback(notification.agent!.id, 'approve')}
                            disabled={actionLoading === notification.agent.id}
                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <CheckCircleIcon size={16} />
                            {actionLoading === notification.agent.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleActionWithFeedback(notification.agent!.id, 'reject')}
                            disabled={actionLoading === notification.agent.id}
                            className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <XCircleIcon size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && pendingAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-scale-up">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold">
                {pendingAction.action === 'approve' ? 'Approve Agent' : 'Reject Agent'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Add an optional feedback message for the agent.
              </p>
            </div>

            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Message (Optional)
              </label>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder={
                  pendingAction.action === 'approve'
                    ? "Welcome message or any notes for the agent..."
                    : "Reason for rejection or what needs to be corrected..."
                }
                rows={4}
                className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setPendingAction(null);
                  setFeedbackMessage('');
                }}
                className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitActionWithFeedback}
                disabled={actionLoading === pendingAction.agentId}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                  pendingAction.action === 'approve'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {actionLoading === pendingAction.agentId 
                  ? 'Processing...' 
                  : pendingAction.action === 'approve' ? 'Approve Agent' : 'Reject Agent'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
