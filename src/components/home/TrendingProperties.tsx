import React from 'react';
import { Property } from '@/types';
import { MapPinIcon, EyeIcon } from '@/components/icons/Icons';
import { formatPropertyPrice } from '@/components/property/PropertyCard';
import { useLanguage } from '@/contexts/AuthContext';

interface TrendingPropertyItem {
  property: Property;
  weeklyViews: number;
}

interface TrendingPropertiesProps {
  properties: TrendingPropertyItem[];
  onSelectProperty: (property: Property) => void;
}

const TrendingProperties: React.FC<TrendingPropertiesProps> = ({ properties, onSelectProperty }) => {
  const { t } = useLanguage();

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            {t('trendingLabel')}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('trendingPropertiesThisWeek')}</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">{t('trendingPropertiesSubtitle')}</p>
        </div>

        <div className="md:hidden flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {properties.map(({ property, weeklyViews }) => (
            <button
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="snap-start shrink-0 w-[300px] bg-white border border-gray-200 rounded-xl overflow-hidden text-left hover:shadow-md transition-shadow"
            >
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-36 object-cover"
              />
              <div className="p-3">
                <p className="text-base font-semibold text-gray-900 line-clamp-1">{property.title}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {formatPropertyPrice(property.price, property.currency)}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 line-clamp-1">
                  <MapPinIcon size={14} />
                  {property.neighborhood || property.location}
                </p>
                <p className="text-xs font-medium text-gray-600 flex items-center gap-1 mt-2">
                  <EyeIcon size={13} />
                  {t('trendingViewsThisWeek').replace('{count}', weeklyViews.toLocaleString())}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="hidden md:grid grid-cols-2 xl:grid-cols-4 gap-5">
          {properties.map(({ property, weeklyViews }) => (
            <button
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden text-left hover:shadow-md transition-shadow"
            >
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-3.5">
                <p className="text-base font-semibold text-gray-900 line-clamp-1">{property.title}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {formatPropertyPrice(property.price, property.currency)}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 line-clamp-1">
                  <MapPinIcon size={14} />
                  {property.neighborhood || property.location}
                </p>
                <p className="text-xs font-medium text-gray-600 flex items-center gap-1 mt-2">
                  <EyeIcon size={13} />
                  {t('trendingViewsThisWeek').replace('{count}', weeklyViews.toLocaleString())}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProperties;
