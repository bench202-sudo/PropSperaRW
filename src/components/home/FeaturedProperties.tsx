import React from 'react';
import { Property } from '@/types';
import PropertyCard from '@/components/property/PropertyCard';
import { ChevronRightIcon } from '@/components/icons/Icons';
import { PropertyRating } from '@/hooks/useReviews';
import { useLanguage } from '@/contexts/AuthContext';
 
interface FeaturedPropertiesProps {
  properties: Property[];
  favorites: string[];
  onSelectProperty: (property: Property) => void;
  onToggleFavorite: (propertyId: string) => void;
  onViewAll: () => void;
  onCompare?: (propertyId: string) => void;
  compareIds?: string[];
  ratings?: Record<string, PropertyRating>;
}
 
const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  favorites,
  onSelectProperty,
  onToggleFavorite,
  onViewAll,
  onCompare,
  compareIds = [],
  ratings = {},
}) => {
  const { t } = useLanguage();
 
  const featuredProperties = properties.filter(p => p.featured && p.status === 'approved');
  const approvedProperties = properties.filter(p => p.status === 'approved');
  const displayProperties = featuredProperties.length > 0
    ? featuredProperties
    : approvedProperties.slice(0, 6);
 
  // Show loading skeleton instead of silently rendering nothing
  if (displayProperties.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">{t('loadingProperties')}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {featuredProperties.length > 0 ? t('featuredProperties') : t('latestProperties')}
            </h2>
            <p className="text-gray-500">
              {featuredProperties.length > 0 ? t('featuredPropertiesSubtitle') : t('latestPropertiesSubtitle')}
            </p>
          </div>
          <button onClick={onViewAll}
            className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            {t('viewAll')}
            <ChevronRightIcon size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProperties.slice(0, 6).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
              onFavorite={onToggleFavorite}
              isFavorite={favorites.includes(property.id)}
              onCompare={onCompare}
              isInCompare={compareIds.includes(property.id)}
              compareCount={compareIds.length}
              rating={ratings[property.id] || null}
            />
          ))}
        </div>

        <button onClick={onViewAll}
          className="sm:hidden w-full mt-6 py-3 bg-white border border-gray-200 rounded-xl text-blue-600 font-semibold hover:bg-gray-50 transition-colors">
          {t('viewAllProperties')}
        </button>
      </div>
    </section>
  );
};
 
export default FeaturedProperties;
