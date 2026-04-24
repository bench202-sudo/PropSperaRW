import React, { useState } from 'react';
import { SearchFilters as SearchFiltersType } from '@/types';
import { neighborhoods } from '@/data/mockData';
import { SearchIcon, FilterIcon, XIcon, ChevronDownIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';
 
interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
  resultCount: number;
}
 
const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({ 
  filters, 
  onFilterChange,
  resultCount 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);
  const { t } = useLanguage();
 
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, query: e.target.value };
    onFilterChange(newFilters);
  };
 
  const handleLocalFilterChange = (key: keyof SearchFiltersType, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };
 
  const applyFilters = () => {
    onFilterChange(localFilters);
    setShowFilters(false);
  };
 
  const clearFilters = () => {
    const clearedFilters: SearchFiltersType = {
      query: '',
      property_type: 'all',
      listing_type: 'all',
      bedrooms: 'any',
      neighborhood: '',
      verified_only: false
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setShowFilters(false);
  };
 
  const activeFilterCount = [
    filters.property_type && filters.property_type !== 'all',
    filters.listing_type && filters.listing_type !== 'all',
    filters.bedrooms && filters.bedrooms !== 'any',
    filters.neighborhood,
    filters.min_price,
    filters.max_price,
    filters.verified_only
  ].filter(Boolean).length;
 
  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.query || ''}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <button 
          onClick={() => setShowFilters(true)}
          className={`relative px-4 py-3.5 rounded-xl flex items-center gap-2 font-medium transition-colors ${
            activeFilterCount > 0 
              ? 'bg-blue-600 text-white' 
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FilterIcon size={20} />
          <span className="hidden sm:inline">{t('filtersBtn')}</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
 
      {/* Quick Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => onFilterChange({ ...filters, listing_type: filters.listing_type === 'sale' ? 'all' : 'sale' })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filters.listing_type === 'sale' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('forSaleChip')}
        </button>
        <button 
          onClick={() => onFilterChange({ ...filters, listing_type: filters.listing_type === 'rent' ? 'all' : 'rent' })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filters.listing_type === 'rent' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('forRentChip')}
        </button>
        <button 
          onClick={() => onFilterChange({ ...filters, property_type: filters.property_type === 'house' ? 'all' : 'house' })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filters.property_type === 'house' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('housesChip')}
        </button>
        <button 
          onClick={() => onFilterChange({ ...filters, property_type: filters.property_type === 'apartment' ? 'all' : 'apartment' })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filters.property_type === 'apartment' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('apartmentsChip')}
        </button>
        <button 
          onClick={() => onFilterChange({ ...filters, property_type: filters.property_type === 'villa' ? 'all' : 'villa' })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filters.property_type === 'villa' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('villasChip')}
        </button>
        <button 
          onClick={() => onFilterChange({ ...filters, property_type: filters.property_type === 'commercial' ? 'all' : 'commercial' })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filters.property_type === 'commercial' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('commercialChip')}
        </button>
        <button 
          onClick={() => onFilterChange({ ...filters, property_type: filters.property_type === 'land' ? 'all' : 'land' })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filters.property_type === 'land' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('landChip')}
        </button>
        <button 
          onClick={() => onFilterChange({ ...filters, verified_only: !filters.verified_only })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filters.verified_only ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('verifiedOnlyChip')}
        </button>
      </div>
 
      {/* Results count */}
      <p className="text-sm text-gray-500 mt-3">
        {resultCount} {resultCount === 1 ? t('propertyFound') : t('propertiesFoundCount')}
      </p>
 
      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold">{t('filtersTitle')}</h2>
              <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <XIcon size={20} />
              </button>
            </div>
 
            <div className="p-4 space-y-6">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">{t('propertyTypeLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'house', 'apartment', 'villa', 'commercial', 'land'].map((type) => (
                    <button key={type}
                      onClick={() => handleLocalFilterChange('property_type', type as any)}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                        localFilters.property_type === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'all' ? t('allTypes') : t(type as any)}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Listing Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">{t('listingTypeLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'all', label: t('allLabel') },
                    { value: 'sale', label: t('forSaleLabel') },
                    { value: 'rent', label: t('forRentLabel') },
                  ].map(({ value, label }) => (
                    <button key={value}
                      onClick={() => handleLocalFilterChange('listing_type', value as any)}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                        localFilters.listing_type === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">{t('bedroomsLabel')}</label>
                <div className="grid grid-cols-5 gap-2">
                  {['any', 1, 2, 3, 4].map((num) => (
                    <button key={num}
                      onClick={() => handleLocalFilterChange('bedrooms', num as any)}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                        localFilters.bedrooms === num ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {num === 'any' ? t('anyLabel') : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Neighborhood */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">{t('neighborhoodLabel')}</label>
                <div className="relative">
                  <select
                    value={localFilters.neighborhood || ''}
                    onChange={(e) => handleLocalFilterChange('neighborhood', e.target.value)}
                    className="w-full py-3 px-4 bg-gray-100 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('allNeighborhoods')}</option>
                    {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDownIcon size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
 
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">{t('priceRangeLabel')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder={t('minPrice')}
                    value={localFilters.min_price || ''}
                    onChange={(e) => handleLocalFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
                    className="py-3 px-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input type="number" placeholder={t('maxPrice')}
                    value={localFilters.max_price || ''}
                    onChange={(e) => handleLocalFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
                    className="py-3 px-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
 
              {/* Verified Only */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{t('verifiedAgentsOnly')}</p>
                  <p className="text-sm text-gray-500">{t('verifiedAgentsOnlyDesc')}</p>
                </div>
                <button
                  onClick={() => handleLocalFilterChange('verified_only', !localFilters.verified_only)}
                  className={`w-12 h-7 rounded-full transition-colors ${localFilters.verified_only ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${localFilters.verified_only ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
 
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={clearFilters}
                className="flex-1 py-3.5 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                {t('clearAll')}
              </button>
              <button onClick={applyFilters}
                className="flex-1 py-3.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                {t('applyFilters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default SearchFiltersComponent;
