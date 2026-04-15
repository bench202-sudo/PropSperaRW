import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedSearches } from '@/hooks/useNotifications';
import { XIcon, SearchIcon, CheckCircleIcon, AlertCircleIcon, BellIcon } from '@/components/icons/Icons';
import { SearchFilters } from '@/types';

interface SavedSearchModalProps {
  filters: SearchFilters;
  onClose: () => void;
  onSuccess?: () => void;
}

const SavedSearchModal: React.FC<SavedSearchModalProps> = ({ filters, onClose, onSuccess }) => {
  const { appUser } = useAuth();
  const { saveSearch } = useSavedSearches(appUser?.id || null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Build a summary of the current filters
  const filterSummary: string[] = [];
  if (filters.property_type && filters.property_type !== 'all') filterSummary.push(`Type: ${filters.property_type}`);
  if (filters.listing_type && filters.listing_type !== 'all') filterSummary.push(filters.listing_type === 'sale' ? 'For Sale' : 'For Rent');
  if (filters.neighborhood) filterSummary.push(`In: ${filters.neighborhood}`);
  if (filters.bedrooms && filters.bedrooms !== 'any') filterSummary.push(`${filters.bedrooms}+ bedrooms`);
  if (filters.min_price) filterSummary.push(`Min: ${Number(filters.min_price).toLocaleString()} RWF`);
  if (filters.max_price) filterSummary.push(`Max: ${Number(filters.max_price).toLocaleString()} RWF`);
  if (filters.query) filterSummary.push(`Search: "${filters.query}"`);
  if (filters.verified_only) filterSummary.push('Verified agents only');

  // Generate a default name from filters
  const defaultName = filterSummary.length > 0
    ? filterSummary.slice(0, 3).join(', ')
    : 'All Properties';

  const handleSave = async () => {
    if (!appUser) return;
    setSaving(true);
    setError(null);

    const searchName = name.trim() || defaultName;
    const result = await saveSearch(searchName, filters as Record<string, any>);

    if (result.error) {
      setError(result.error);
      setSaving(false);
    } else {
      setSuccess(true);
      setSaving(false);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <BellIcon size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Save Search & Get Alerts</h3>
              <p className="text-[11px] text-gray-500">Get notified when matching properties are listed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <XIcon size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon size={28} className="text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Search Saved!</h4>
              <p className="text-sm text-gray-500">
                You'll receive email notifications when matching properties are listed.
              </p>
            </div>
          ) : (
            <>
              {/* Current Filters Preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Current Search Criteria
                </label>
                <div className="bg-gray-50 rounded-xl p-3">
                  {filterSummary.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {filterSummary.map((label, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-lg font-medium">
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">All properties (no filters applied)</p>
                  )}
                </div>
              </div>

              {/* Search Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Name this search (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={defaultName}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  maxLength={100}
                />
              </div>

              {/* Info */}
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 rounded-xl">
                <SearchIcon size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  PropSpera will monitor new listings and send you an email when a property matching these criteria is added. 
                  You can manage your saved searches in Notification Settings.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <AlertCircleIcon size={14} />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <BellIcon size={14} />
                  Save & Get Alerts
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearchModal;
