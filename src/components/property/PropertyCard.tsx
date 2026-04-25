import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '@/types';
import { formatPrice } from '@/data/mockData';
import { HeartIcon, MapPinIcon, BedIcon, BathIcon, AreaIcon, PlotSizeIcon, CheckCircleIcon, ClockIcon, EyeIcon, ColumnsIcon, StarIcon } from '@/components/icons/Icons';
import { PropertyRating } from '@/hooks/useReviews';
import { useLanguage } from '@/contexts/AuthContext';
import { generatePropertySlug } from '@/utils/seo';
 
// Currency-aware price formatter
export const formatPropertyPrice = (price: number, currency?: string): string => {
  const cur = currency || 'RWF';
  if (cur === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  }
  return `${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(price)} RWF`;
};
 
 
interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: boolean;
  showStatus?: boolean;
  onCompare?: (propertyId: string) => void;
  isInCompare?: boolean;
  compareCount?: number;
  rating?: PropertyRating | null;
}
 
const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, onSelect, onFavorite, isFavorite = false,
  showStatus = false, onCompare, isInCompare = false, compareCount = 0, rating = null,
}) => {
  const { t } = useLanguage();
  const furnished = (property as any).furnished as string | undefined;
  const builtArea = (property as any).built_area as number | undefined;
 
  const handleFavoriteClick = (e: React.MouseEvent) => { e.stopPropagation(); if (onFavorite) onFavorite(property.id); };
  const handleCompareClick = (e: React.MouseEvent) => { e.stopPropagation(); if (onCompare) onCompare(property.id); };
 
  const getStatusBadge = () => {
    switch (property.status) {
      case 'approved': return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"><CheckCircleIcon size={12} />{t('approvedStatus')}</span>;
      case 'pending': return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium"><ClockIcon size={12} />{t('pendingStatus')}</span>;
      case 'rejected': return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">{t('rejectedStatus')}</span>;
      default: return null;
    }
  };
 
  const compareDisabled = !isInCompare && compareCount >= 3;
  const slug = generatePropertySlug(property);

  return (
    <Link
      to={`/property/${slug}`}
      onClick={(e) => {
        // Let middle-click and ctrl/cmd+click open in new tab naturally.
        // Regular left-clicks: call onSelect (opens modal) and stay on page.
        if (!e.ctrlKey && !e.metaKey && e.button === 0) {
          e.preventDefault();
          onSelect(property);
        }
      }}
      className={`bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group block ${isInCompare ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {property.featured && <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold">{t('featured')}</span>}
          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${property.listing_type === 'sale' ? 'bg-terracotta-600 text-white' : 'bg-emerald-600 text-white'}`}>
            {property.listing_type === 'sale' ? t('forSaleFilter') : t('forRentFilter')}
          </span>
          {property.listing_type === 'rent' && furnished && (
            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${furnished === 'furnished' ? 'bg-violet-600 text-white' : 'bg-gray-600 text-white'}`}>
              {furnished === 'furnished' ? t('furnished') : t('unfurnished')}
            </span>
          )}
          {showStatus && getStatusBadge()}
        </div>
        {(property as any).video_url && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/70 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">▶ Video</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {onFavorite && (
            <button onClick={handleFavoriteClick} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <HeartIcon size={18} filled={isFavorite} className={isFavorite ? 'text-red-500' : 'text-gray-600'} />
            </button>
          )}
          {onCompare && (
            <button onClick={handleCompareClick} disabled={compareDisabled}
              className={`w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm ${isInCompare ? 'bg-indigo-500 text-white hover:bg-indigo-600' : compareDisabled ? 'bg-white/60 text-gray-300 cursor-not-allowed' : 'bg-white/90 text-gray-600 hover:bg-white hover:text-indigo-600'}`}
              title={isInCompare ? t('comparing') : compareDisabled ? t('maxCompare') : t('addComparison')}>
              <ColumnsIcon size={16} />
            </button>
          )}
        </div>
        {isInCompare && (
          <div className="absolute bottom-3 right-3 bg-indigo-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
            <ColumnsIcon size={12} />{t('comparing')}
          </div>
        )}
        {property.agent?.verification_status === 'approved' && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full pl-1 pr-3 py-1">
            <img src={property.agent.user?.avatar_url} alt={property.agent.user?.full_name} className="w-6 h-6 rounded-full object-cover" />
            <span className="text-xs font-medium text-gray-800 flex items-center gap-1">
              {(property.agent as any).company_name || property.agent.user?.full_name?.split(' ')[0]}
              <CheckCircleIcon size={12} className="text-blue-600" />
            </span>
          </div>
        )}
        {!isInCompare && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
            <EyeIcon size={12} />{property.views}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xl font-bold text-gray-900">{formatPropertyPrice(property.price, property.currency)}</span>
            {property.listing_type === 'rent' && <span className="text-gray-500 text-sm">{t('perMonth')}</span>}
          </div>
          {rating && rating.review_count > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
              <StarIcon size={12} filled className="text-amber-400" />
              <span className="text-xs font-bold text-amber-700">{rating.avg_rating}</span>
              <span className="text-[10px] text-amber-500">({rating.review_count})</span>
            </div>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPinIcon size={14} /><span>{property.neighborhood}, {property.location}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-sm border-t border-gray-100 pt-3">
          {property.bedrooms !== undefined && property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <BedIcon size={16} /><span>{property.bedrooms} {property.bedrooms === 1 ? t('bed') : t('beds')}</span>
            </div>
          )}
          {property.bathrooms !== undefined && property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <BathIcon size={16} /><span>{property.bathrooms} {property.bathrooms === 1 ? t('bath') : t('baths')}</span>
            </div>
          )}
          {property.area_sqm && (
            <div className="flex items-center gap-1">
              <PlotSizeIcon size={16} /><span>{property.area_sqm} {t('sqm')} {t('plot')}</span>
            </div>
          )}
          {builtArea && (
            <div className="flex items-center gap-1">
              <AreaIcon size={16} /><span>{builtArea} {t('sqm')} {t('builtLabel')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
 
export default PropertyCard;

