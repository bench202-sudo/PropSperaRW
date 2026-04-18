import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '@/contexts/AuthContext';
import {
  useNotificationPreferences,
  useSavedSearches,
  sendTestNotification,
  NotificationPreferences as NotifPrefs,
  SavedSearch,
} from '@/hooks/useNotifications';
import {
  XIcon,
  BellIcon,
  MailIcon,
  SearchIcon,
  TrashIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '@/components/icons/Icons';

interface NotificationPreferencesProps {
  onClose: () => void;
}

// ─── Toggle Switch ──────────────────────────────────────────────────────────

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}> = ({ enabled, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// ─── Notification Type Card ─────────────────────────────────────────────────

const NotificationTypeCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (val: boolean) => void;
  color: string;
  disabled?: boolean;
}> = ({ icon, title, description, enabled, onChange, color, disabled }) => (
  <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
    enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
  }`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h4 className={`font-semibold text-sm ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h4>
        <ToggleSwitch enabled={enabled} onChange={onChange} disabled={disabled} />
      </div>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
);

// ─── Saved Search Item ──────────────────────────────────────────────────────

const SavedSearchItem: React.FC<{
  search: SavedSearch;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}> = ({ search, onToggle, onDelete }) => {
  const filters = search.filters || {};
  const filterLabels: string[] = [];

  if (filters.property_type && filters.property_type !== 'all') filterLabels.push(filters.property_type);
  if (filters.listing_type && filters.listing_type !== 'all') filterLabels.push(filters.listing_type === 'sale' ? 'For Sale' : 'For Rent');
  if (filters.neighborhood) filterLabels.push(filters.neighborhood);
  if (filters.bedrooms && filters.bedrooms !== 'any') filterLabels.push(`${filters.bedrooms}+ beds`);
  if (filters.min_price) filterLabels.push(`Min ${Number(filters.min_price).toLocaleString()} RWF`);
  if (filters.max_price) filterLabels.push(`Max ${Number(filters.max_price).toLocaleString()} RWF`);
  if (filters.query) filterLabels.push(`"${filters.query}"`);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h5 className="font-medium text-sm text-gray-900 truncate">{search.name}</h5>
          {search.is_active && (
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">ACTIVE</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {filterLabels.length > 0 ? filterLabels.map((label, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] rounded-full">{label}</span>
          )) : (
            <span className="text-xs text-gray-400">All properties</span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Created {new Date(search.created_at).toLocaleDateString()}
          {search.match_count > 0 && ` · ${search.match_count} matches`}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ToggleSwitch
          enabled={search.is_active}
          onChange={(val) => onToggle(search.id, val)}
        />
        <button
          onClick={() => onDelete(search.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete saved search"
        >
          <TrashIcon size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onClose }) => {
  const { appUser } = useAuth();
  const userId = appUser?.id || null;
  const userEmail = appUser?.email || null;

  const {
    preferences,
    loading: prefsLoading,
    saving,
    savePreferences,
  } = useNotificationPreferences(userId, userEmail);

  const {
    searches,
    loading: searchesLoading,
    deleteSearch,
    toggleSearchActive,
  } = useSavedSearches(userId);

  // Local state for editing
  const [localPrefs, setLocalPrefs] = useState<NotifPrefs | null>(null);
  const [email, setEmail] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'preferences' | 'saved_searches' | 'history'>('preferences');
  const { t } = useLanguage();

  // Sync preferences to local state
  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
      setEmail(preferences.email || appUser?.email || '');
    }
  }, [preferences, appUser]);

  const handleToggle = (key: keyof NotifPrefs, value: boolean) => {
    if (!localPrefs) return;
    setLocalPrefs({ ...localPrefs, [key]: value });
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!localPrefs || !userId) return;
    setSaveSuccess(false);
    setSaveError(null);

    const result = await savePreferences({ ...localPrefs, email });
    if (result.error) {
      setSaveError(result.error);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSendTest = async () => {
    if (!userId || !email || !appUser) return;
    setTestSending(true);
    setTestResult(null);

    const result = await sendTestNotification(userId, email, appUser.full_name);
    setTestResult({
      success: result.success,
      message: result.success
        ? 'Test notification sent successfully! Check your inbox.'
        : result.error || 'Failed to send test notification.',
    });
    setTestSending(false);
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleDeleteSearch = async (searchId: string) => {
    await deleteSearch(searchId);
  };

  const handleToggleSearch = async (searchId: string, isActive: boolean) => {
    await toggleSearchActive(searchId, isActive);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-8 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BellIcon size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t('notificationSettings')}</h2>
              <p className="text-xs text-gray-500">{t('manageAlertsDesc')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XIcon size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {[
            { id: 'preferences' as const, label: t('emailPreferencesTab'), icon: <MailIcon size={14} /> },
            { id: 'saved_searches' as const, label: t('savedSearchesTab'), icon: <SearchIcon size={14} />, count: searches.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('notificationEmailLabel')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MailIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSendTest}
                    disabled={testSending || !email}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {testSending ? t('sending') : t('sendTest')}
                  </button>
                </div>
                {testResult && (
                  <div className={`flex items-center gap-2 mt-2 text-xs ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.success ? <CheckCircleIcon size={14} /> : <AlertCircleIcon size={14} />}
                    {testResult.message}
                  </div>
                )}
              </div>

              {/* Property Alerts */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">{t('propertyAlertsSection')}</h3>
                <div className="space-y-3">
                  <NotificationTypeCard
                    icon={<SearchIcon size={18} className="text-blue-600" />}
                    title={t('newPropertyMatchesTitle')}
                    description={t('newPropertyMatchesDesc')}
                    enabled={localPrefs?.new_property_match ?? true}
                    onChange={(val) => handleToggle('new_property_match', val)}
                    color="bg-blue-100"
                    disabled={prefsLoading}
                  />
                  <NotificationTypeCard
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                    }
                    title={t('priceDropAlertsTitle')}
                    description={t('priceDropAlertsDesc')}
                    enabled={localPrefs?.price_drop ?? true}
                    onChange={(val) => handleToggle('price_drop', val)}
                    color="bg-emerald-100"
                    disabled={prefsLoading}
                  />
                  <NotificationTypeCard
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    }
                    title={t('favoriteUpdatesTitle')}
                    description={t('favoriteUpdatesDesc')}
                    enabled={localPrefs?.favorite_status_change ?? true}
                    onChange={(val) => handleToggle('favorite_status_change', val)}
                    color="bg-amber-100"
                    disabled={prefsLoading}
                  />
                </div>
              </div>

              {/* Communication Alerts */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">{t('communicationSection')}</h3>
                <div className="space-y-3">
                  <NotificationTypeCard
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    }
                    title={t('agentInquiryResponsesTitle')}
                    description={t('agentInquiryResponsesDesc')}
                    enabled={localPrefs?.inquiry_response ?? true}
                    onChange={(val) => handleToggle('inquiry_response', val)}
                    color="bg-purple-100"
                    disabled={prefsLoading}
                  />
                </div>
              </div>

              {/* Digest & Marketing */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">{t('digestMarketingSection')}</h3>
                <div className="space-y-3">
                  <NotificationTypeCard
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    }
                    title={t('weeklyDigestTitle')}
                    description={t('weeklyDigestDesc')}
                    enabled={localPrefs?.weekly_digest ?? false}
                    onChange={(val) => handleToggle('weekly_digest', val)}
                    color="bg-indigo-100"
                    disabled={prefsLoading}
                  />
                  <NotificationTypeCard
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                    }
                    title={t('marketingPromoTitle')}
                    description={t('marketingPromoDesc')}
                    enabled={localPrefs?.marketing_emails ?? false}
                    onChange={(val) => handleToggle('marketing_emails', val)}
                    color="bg-pink-100"
                    disabled={prefsLoading}
                  />
                </div>
              </div>

              {/* Save Status Messages */}
              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                  <CheckCircleIcon size={16} />
                  {t('preferencesSaved')}
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircleIcon size={16} />
                  {saveError}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved_searches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{t('yourSavedSearches')}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('savedSearchesDesc')}
                  </p>
                </div>
              </div>

              {searchesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searches.length > 0 ? (
                <div className="space-y-2">
                  {searches.map(search => (
                    <SavedSearchItem
                      key={search.id}
                      search={search}
                      onToggle={handleToggleSearch}
                      onDelete={handleDeleteSearch}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon size={24} className="text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('noSavedSearchesYet')}</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {t('noSavedSearchesDesc')}
                  </p>
                </div>
              )}

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BellIcon size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">How saved searches work</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      When you save a search, PropSpera monitors new listings that match your criteria. 
                      You'll receive an email notification whenever a matching property is listed. 
                      Toggle searches on/off to control which alerts you receive.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'preferences' && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || prefsLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferences;
