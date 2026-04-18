import React, { useState } from 'react';
import { SearchIcon, FilterIcon, XIcon, StarIcon, ChevronDownIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';

export interface AgentFilterState {
  searchQuery: string;
  specialization: string;
  minExperience: number;
  maxExperience: number;
  minRating: number;
  location: string;
  sortBy: 'rating' | 'experience' | 'listings' | 'name';
}

export const defaultAgentFilters: AgentFilterState = {
  searchQuery: '',
  specialization: 'all',
  minExperience: 0,
  maxExperience: 30,
  minRating: 0,
  location: 'all',
  sortBy: 'rating',
};

interface AgentSearchFiltersProps {
  filters: AgentFilterState;
  onFilterChange: (filters: AgentFilterState) => void;
  resultCount: number;
  totalCount: number;
  availableSpecializations: string[];
  availableLocations: string[];
}

const AgentSearchFilters: React.FC<AgentSearchFiltersProps> = ({
  filters,
  onFilterChange,
  resultCount,
  totalCount,
  availableSpecializations,
  availableLocations,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { t } = useLanguage();

  const experienceRanges = [
    { label: t('anyExperience'), min: 0, max: 30 },
    { label: t('oneToThreeYears'), min: 1, max: 3 },
    { label: t('threeToFiveYears'), min: 3, max: 5 },
    { label: t('fiveToTenYears'), min: 5, max: 10 },
    { label: t('tenPlusYears'), min: 10, max: 30 },
  ];

  const sortOptions = [
    { label: t('highestRated'), value: 'rating' as const },
    { label: t('mostExperienced'), value: 'experience' as const },
    { label: t('mostListingsSort'), value: 'listings' as const },
    { label: t('nameAZ'), value: 'name' as const },
  ];

  const updateFilter = <K extends keyof AgentFilterState>(key: K, value: AgentFilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({ ...defaultAgentFilters });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.specialization !== 'all' ||
    filters.minExperience > 0 ||
    filters.maxExperience < 30 ||
    filters.minRating > 0 ||
    filters.location !== 'all';

  const ratingOptions = [
    { label: t('anyRating'), value: 0 },
    { label: '3.0+', value: 3 },
    { label: '3.5+', value: 3.5 },
    { label: '4.0+', value: 4 },
    { label: '4.5+', value: 4.5 },
    { label: '4.8+', value: 4.8 },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t('searchAgentsPlaceholder')}
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-base"
        />
        {filters.searchQuery && (
          <button
            onClick={() => updateFilter('searchQuery', '')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon size={18} />
          </button>
        )}
      </div>

      {/* Quick Filter Pills + Toggle Advanced */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Specialization Quick Pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => updateFilter('specialization', 'all')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              filters.specialization === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {t('allSpecializations')}
          </button>
          {availableSpecializations.slice(0, 5).map((spec) => (
            <button
              key={spec}
              onClick={() =>
                updateFilter(
                  'specialization',
                  filters.specialization === spec ? 'all' : spec
                )
              }
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.specialization === spec
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {spec}
            </button>
          ))}
          {availableSpecializations.length > 5 && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white text-gray-500 border border-gray-200 hover:border-gray-300 transition-all"
            >
              +{availableSpecializations.length - 5} more
            </button>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showAdvancedFilters
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <FilterIcon size={16} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Specialization Dropdown (full list) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('specLabel')}
              </label>
              <div className="relative">
                <select
                  value={filters.specialization}
                  onChange={(e) => updateFilter('specialization', e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer"
                >
                  <option value="all">{t('allSpecializations')}</option>
                  {availableSpecializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDownIcon size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Experience Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('yearsOfExpLabel')}
              </label>
              <div className="relative">
                <select
                  value={`${filters.minExperience}-${filters.maxExperience}`}
                  onChange={(e) => {
                    const range = experienceRanges.find(
                      (r) => `${r.min}-${r.max}` === e.target.value
                    );
                    if (range) {
                      onFilterChange({
                        ...filters,
                        minExperience: range.min,
                        maxExperience: range.max,
                      });
                    }
                  }}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer"
                >
                  {experienceRanges.map((range) => (
                    <option key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDownIcon size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('minimumRating')}
              </label>
              <div className="relative">
                <select
                  value={filters.minRating}
                  onChange={(e) => updateFilter('minRating', parseFloat(e.target.value))}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer"
                >
                  {ratingOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value > 0 ? `${opt.label}` : opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDownIcon size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('location')}
              </label>
              <div className="relative">
                <select
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer"
                >
                  <option value="all">{t('allLocations')}</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDownIcon size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Sort + Rating Stars Visual */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 pt-4 border-t border-gray-100 gap-4">
            {/* Rating Stars Visual Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">{t('quickRating')}:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      const newRating = filters.minRating === star ? 0 : star;
                      updateFilter('minRating', newRating);
                    }}
                    className="p-0.5 transition-transform hover:scale-110"
                    title={`${star}+ stars`}
                  >
                    <StarIcon
                      size={22}
                      filled={star <= filters.minRating}
                      className={
                        star <= filters.minRating
                          ? 'text-amber-400'
                          : 'text-gray-300 hover:text-amber-300'
                      }
                    />
                  </button>
                ))}
                {filters.minRating > 0 && (
                  <span className="text-sm text-gray-500 ml-1">{filters.minRating}+</span>
                )}
              </div>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">{t('sortByLabel')}:</span>
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <ChevronDownIcon size={14} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600">
            {t('showingLabel')}{' '}
            <span className="font-semibold text-gray-900">{resultCount}</span>{' '}
            {t('ofLabel')}{' '}
            <span className="font-semibold text-gray-900">{totalCount}</span>{' '}
            {t('agents')}
          </p>
          {hasActiveFilters && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
              <FilterIcon size={12} />
              {t('filteredLabel')}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
          >
            <XIcon size={14} />
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
              Search: "{filters.searchQuery}"
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="hover:text-blue-900 transition-colors"
              >
                <XIcon size={12} />
              </button>
            </span>
          )}
          {filters.specialization !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
              {filters.specialization}
              <button
                onClick={() => updateFilter('specialization', 'all')}
                className="hover:text-emerald-900 transition-colors"
              >
                <XIcon size={12} />
              </button>
            </span>
          )}
          {(filters.minExperience > 0 || filters.maxExperience < 30) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
              {filters.minExperience}-{filters.maxExperience === 30 ? '30+' : filters.maxExperience} yrs exp
              <button
                onClick={() =>
                  onFilterChange({ ...filters, minExperience: 0, maxExperience: 30 })
                }
                className="hover:text-purple-900 transition-colors"
              >
                <XIcon size={12} />
              </button>
            </span>
          )}
          {filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
              <StarIcon size={12} filled className="text-amber-500" />
              {filters.minRating}+ rating
              <button
                onClick={() => updateFilter('minRating', 0)}
                className="hover:text-amber-900 transition-colors"
              >
                <XIcon size={12} />
              </button>
            </span>
          )}
          {filters.location !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium">
              {filters.location}
              <button
                onClick={() => updateFilter('location', 'all')}
                className="hover:text-rose-900 transition-colors"
              >
                <XIcon size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentSearchFilters;
