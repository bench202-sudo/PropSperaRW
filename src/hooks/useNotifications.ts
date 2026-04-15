import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  email: string;
  new_property_match: boolean;
  inquiry_response: boolean;
  price_drop: boolean;
  favorite_status_change: boolean;
  weekly_digest: boolean;
  marketing_emails: boolean;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, any>;
  is_active: boolean;
  last_matched_at: string | null;
  match_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  type: 'new_property_match' | 'inquiry_response' | 'price_drop' | 'favorite_status_change' | 'system';
  title: string;
  message: string | null;
  data: Record<string, any>;
  is_read: boolean;
  email_sent: boolean;
  created_at: string;
}

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'user_id' | 'email'> = {
  new_property_match: true,
  inquiry_response: true,
  price_drop: true,
  favorite_status_change: true,
  weekly_digest: false,
  marketing_emails: false,
};

// ─── Notification Preferences Hook ──────────────────────────────────────────

export function useNotificationPreferences(userId: string | null, userEmail: string | null) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      setPreferences(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchErr) {
        console.warn('Error fetching notification preferences:', fetchErr.message);
        setPreferences(null);
        return;
      }

      if (data) {
        setPreferences(data as NotificationPreferences);
      } else {
        // Create default preferences
        const defaultPrefs: NotificationPreferences = {
          user_id: userId,
          email: userEmail || '',
          ...DEFAULT_PREFERENCES,
        };
        setPreferences(defaultPrefs);
      }
    } catch (err: any) {
      console.warn('Error fetching preferences:', err);
      setError(err?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = useCallback(async (prefs: NotificationPreferences): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Not authenticated' };
    setSaving(true);
    setError(null);
    try {
      const payload = {
        user_id: userId,
        email: prefs.email || userEmail || '',
        new_property_match: prefs.new_property_match,
        inquiry_response: prefs.inquiry_response,
        price_drop: prefs.price_drop,
        favorite_status_change: prefs.favorite_status_change,
        weekly_digest: prefs.weekly_digest,
        marketing_emails: prefs.marketing_emails,
        updated_at: new Date().toISOString(),
      };

      if (prefs.id) {
        // Update existing
        const { error: updateErr } = await supabase
          .from('notification_preferences')
          .update(payload)
          .eq('id', prefs.id);

        if (updateErr) throw updateErr;
      } else {
        // Insert new
        const { data, error: insertErr } = await supabase
          .from('notification_preferences')
          .insert(payload)
          .select()
          .single();

        if (insertErr) throw insertErr;
        if (data) {
          setPreferences(data as NotificationPreferences);
          return { error: null };
        }
      }

      setPreferences(prev => prev ? { ...prev, ...payload } : null);
      return { error: null };
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      const msg = err?.message || 'Failed to save preferences';
      setError(msg);
      return { error: msg };
    } finally {
      setSaving(false);
    }
  }, [userId, userEmail]);

  return { preferences, loading, saving, error, savePreferences, refetch: fetchPreferences };
}

// ─── Saved Searches Hook ────────────────────────────────────────────────────

export function useSavedSearches(userId: string | null) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearches = useCallback(async () => {
    if (!userId) {
      setSearches([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchErr) {
        console.warn('Error fetching saved searches:', fetchErr.message);
        setSearches([]);
        return;
      }
      setSearches((data as SavedSearch[]) || []);
    } catch (err: any) {
      console.warn('Error fetching saved searches:', err);
      setError(err?.message || 'Failed to load saved searches');
      setSearches([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  const saveSearch = useCallback(async (
    name: string,
    filters: Record<string, any>
  ): Promise<{ data: SavedSearch | null; error: string | null }> => {
    if (!userId) return { data: null, error: 'Not authenticated' };
    try {
      const { data, error: insertErr } = await supabase
        .from('saved_searches')
        .insert({
          user_id: userId,
          name,
          filters,
          is_active: true,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      const saved = data as SavedSearch;
      setSearches(prev => [saved, ...prev]);
      return { data: saved, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Failed to save search' };
    }
  }, [userId]);

  const deleteSearch = useCallback(async (searchId: string): Promise<{ error: string | null }> => {
    try {
      const { error: deleteErr } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (deleteErr) throw deleteErr;
      setSearches(prev => prev.filter(s => s.id !== searchId));
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to delete search' };
    }
  }, []);

  const toggleSearchActive = useCallback(async (searchId: string, isActive: boolean): Promise<{ error: string | null }> => {
    try {
      const { error: updateErr } = await supabase
        .from('saved_searches')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', searchId);

      if (updateErr) throw updateErr;
      setSearches(prev => prev.map(s => s.id === searchId ? { ...s, is_active: isActive } : s));
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to update search' };
    }
  }, []);

  return { searches, loading, error, saveSearch, deleteSearch, toggleSearchActive, refetch: fetchSearches };
}

// ─── User Notifications Hook ────────────────────────────────────────────────

export function useUserNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error fetching notifications:', error.message);
        setNotifications([]);
        return;
      }
      const notifs = (data as UserNotification[]) || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (err) {
      console.warn('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Error marking all as read:', err);
    }
  }, [userId]);

  const clearAll = useCallback(async () => {
    if (!userId) return;
    try {
      await supabase
        .from('user_notifications')
        .delete()
        .eq('user_id', userId);

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.warn('Error clearing notifications:', err);
    }
  }, [userId]);

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, clearAll, refetch: fetchNotifications };
}

// ─── Send Notification Helper ───────────────────────────────────────────────

export async function sendEmailNotification(
  type: string,
  userId: string,
  userEmail: string,
  userName: string,
  data: Record<string, any>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-email-notification', {
      body: { type, userId, userEmail, userName, data },
    });

    if (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message || 'Failed to send notification' };
    }

    return { success: result?.success || true, error: null };
  } catch (err: any) {
    console.error('Error invoking notification function:', err);
    return { success: false, error: err?.message || 'Failed to send notification' };
  }
}

// ─── Test Notification Helper ───────────────────────────────────────────────

export async function sendTestNotification(
  userId: string,
  userEmail: string,
  userName: string
): Promise<{ success: boolean; error: string | null }> {
  return sendEmailNotification('test', userId, userEmail, userName, {});
}
