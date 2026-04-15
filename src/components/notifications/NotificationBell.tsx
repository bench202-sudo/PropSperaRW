import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserNotifications, UserNotification } from '@/hooks/useNotifications';
import { BellIcon, XIcon, CheckCircleIcon, SearchIcon, MailIcon } from '@/components/icons/Icons';

interface NotificationBellProps {
  onOpenPreferences: () => void;
  onLoginRequired: () => void;
}

// ─── Notification Type Icons ────────────────────────────────────────────────

const NotificationTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'new_property_match':
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <SearchIcon size={14} className="text-blue-600" />
        </div>
      );
    case 'inquiry_response':
      return (
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      );
    case 'price_drop':
      return (
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
      );
    case 'favorite_status_change':
      return (
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BellIcon size={14} className="text-gray-600" />
        </div>
      );
  }
};

// ─── Notification Item ──────────────────────────────────────────────────────

const NotificationItem: React.FC<{
  notification: UserNotification;
  onMarkRead: (id: string) => void;
}> = ({ notification, onMarkRead }) => {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
        !notification.is_read ? 'bg-blue-50/50' : ''
      }`}
      onClick={() => !notification.is_read && onMarkRead(notification.id)}
    >
      <NotificationTypeIcon type={notification.type} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message.substring(0, 100)}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-gray-400">{timeAgo(notification.created_at)}</span>
          {notification.email_sent && (
            <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
              <MailIcon size={10} /> Emailed
            </span>
          )}
        </div>
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
};

// ─── Main Bell Component ────────────────────────────────────────────────────

const NotificationBell: React.FC<NotificationBellProps> = ({ onOpenPreferences, onLoginRequired }) => {
  const { appUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useUserNotifications(appUser?.id || null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleBellClick = () => {
    if (!appUser) {
      onLoginRequired();
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        title="Notifications"
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPreferences();
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Notification Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="p-2 space-y-1">
                {notifications.slice(0, 20).map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkRead={markAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BellIcon size={24} className="text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">No notifications yet</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  You'll receive notifications about property matches, price drops, and agent responses here.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenPreferences();
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage Preferences
            </button>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
