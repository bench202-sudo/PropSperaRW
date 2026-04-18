import React, { useState, useMemo } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/data/mockData';
import { useLanguage } from '@/contexts/AuthContext';
import { 
  HeartIcon, MapPinIcon, BedIcon, BathIcon, AreaIcon, 
  XIcon, SearchIcon, ChevronDownIcon, TrashIcon, EyeIcon
} from '@/components/icons/Icons';

interface SavedPropertiesProps {
  properties: Property[];
  favoriteIds: string[];
  onSelectProperty: (property: Property) => void;
  onRemoveFavorite: (propertyId: string) => void;
  onBrowseListings: () => void;
  loading?: boolean;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

const SavedProperties: React.FC<SavedPropertiesProps> = ({
  properties,
  favoriteIds,
  onSelectProperty,
  onRemoveFavorite,
  onBrowseListings,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { t } = useLanguage();

  // Get favorited properties in order
  const savedProperties = useMemo(() => {
    let result = properties.filter(p => favoriteIds.includes(p.id));

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.neighborhood?.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.property_type.toLowerCase().includes(query)
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        // Keep the order from favoriteIds (most recently added first)
        result.sort((a, b) => {
          const aIdx = favoriteIds.indexOf(a.id);
          const bIdx = favoriteIds.indexOf(b.id);
          return aIdx - bIdx;
        });
        break;
    }

    return result;
  }, [properties, favoriteIds, searchQuery, sortBy]);

  const handleRemove = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    setRemovingId(propertyId);
    onRemoveFavorite(propertyId);
    // Reset after animation
    setTimeout(() => setRemovingId(null), 300);
  };

  // Stats
  const totalValue = savedProperties.reduce((sum, p) => sum + p.price, 0);
  const forSale = savedProperties.filter(p => p.listing_type === 'sale').length;
  const forRent = savedProperties.filter(p => p.listing_type === 'rent').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/4 translate-y-1/4" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-5">
              <HeartIcon size={18} filled className="text-pink-200" />
              <span className="text-pink-100 text-sm font-medium">{t('savedCollection')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              {t('savedProperties')}
            </h1>
            <p className="text-lg text-pink-100 mb-8 max-w-xl mx-auto">
              {t('savedPropertiesDesc')}
            </p>

            {/* Stats */}
            {favoriteIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{favoriteIds.length}</p>
                  <p className="text-xs text-pink-200">{t('savedStat')}</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{forSale}</p>
                  <p className="text-xs text-pink-200">{t('forSale')}</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{forRent}</p>
                  <p className="text-xs text-pink-200">{t('forRent')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">{t('loadingSavedProperties')}</p>
            </div>
          </div>
        ) : favoriteIds.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon size={40} className="text-pink-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('noSavedPropertiesYet')}</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {t('startExploringDesc')}
            </p>
            <button
              onClick={onBrowseListings}
              className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/25"
            >
              {t('browsePropertiesBtn')}
            </button>
          </div>
        ) : (
          <>
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchSavedPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XIcon size={16} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none w-full sm:w-48 px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent cursor-pointer"
                >
                  <option value="newest">{t('recentlySaved')}</option>
                  <option value="price-low">{t('priceAsc')}</option>
                  <option value="price-high">{t('priceDesc')}</option>
                  <option value="name">{t('nameAZ')}</option>
                </select>
                <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {searchQuery 
                  ? `${savedProperties.length} of ${favoriteIds.length} saved properties`
                  : `${savedProperties.length} saved ${savedProperties.length === 1 ? 'property' : 'properties'}`
                }
              </p>
            </div>

            {/* Property Grid */}
            {savedProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map((property) => (
                  <div
                    key={property.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group ${
                      removingId === property.id ? 'opacity-0 scale-95 transition-all duration-300' : ''
                    }`}
                    onClick={() => onSelectProperty(property)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {property.featured && (
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                            Featured
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          property.listing_type === 'sale'
                            ? 'bg-terracotta-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                        </span>
                      </div>

                      {/* Remove favorite button */}
                      <button
                        onClick={(e) => handleRemove(e, property.id)}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm group/btn"
                        title="Remove from saved"
                      >
                        <HeartIcon
                          size={18}
                          filled
                          className="text-red-500 group-hover/btn:scale-110 transition-transform"
                        />
                      </button>

                      {/* Views */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
                        <EyeIcon size={12} />
                        {property.views}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Price */}
                      <div className="mb-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(property.price)}
                        </span>
                        {property.listing_type === 'rent' && (
                          <span className="text-gray-500 text-sm">/month</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-pink-600 transition-colors">
                        {property.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                        <MapPinIcon size={14} />
                        <span>{property.neighborhood}, {property.location}</span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-4 text-gray-600 text-sm">
                          {property.bedrooms !== undefined && property.bedrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <BedIcon size={16} />
                              <span>{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms !== undefined && property.bathrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <BathIcon size={16} />
                              <span>{property.bathrooms}</span>
                            </div>
                          )}
                          {property.area_sqm && (
                            <div className="flex items-center gap-1">
                              <AreaIcon size={16} />
                              <span>{property.area_sqm} m²</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Remove button (text) */}
                        <button
                          onClick={(e) => handleRemove(e, property.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove from saved"
                        >
                          <TrashIcon size={14} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No search results */
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching properties</h3>
                <p className="text-gray-500 mb-4">
                  No saved properties match "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Browse More CTA */}
            <div className="mt-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Looking for More?
                  </h3>
                  <p className="text-pink-100 max-w-xl">
                    Discover more amazing properties in Kigali. New listings are added daily.
                  </p>
                </div>
                <button
                  onClick={onBrowseListings}
                  className="px-8 py-3.5 bg-white text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-colors shadow-lg whitespace-nowrap"
                >
                  Browse All Properties
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;
