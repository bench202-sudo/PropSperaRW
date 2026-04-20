import React, { useState, useEffect } from 'react';
import { Property } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/data/mockData';
import { formatPropertyPrice } from '@/components/property/PropertyCard';
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, MapPinIcon, BedIcon, BathIcon, AreaIcon, PlotSizeIcon, CheckCircleIcon, XIcon, PhoneIcon, MessageIcon, StarIcon, CalendarIcon } from '@/components/icons/Icons';
import MortgageCalculator from '@/components/mortgage/MortgageCalculator';
import { useLanguage } from '@/contexts/AuthContext';
 
interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
  onContact: (property: Property) => void;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: boolean;
}
 
const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onClose, onContact, onFavorite, isFavorite = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useLanguage();
 
  const [localViews, setLocalViews] = useState(property.views || 0);
 
  useEffect(() => {
    const incrementViews = async () => {
      const { error } = await supabase.rpc('increment_property_views', { property_id: property.id });
      if (!error) {
        setLocalViews(prev => prev + 1);
      } else {
        // Fallback: direct update if RPC doesn't exist
        await supabase.from('properties')
          .update({ views: (property.views || 0) + 1 })
          .eq('id', property.id);
        setLocalViews((property.views || 0) + 1);
      }
    };
    incrementViews();
  }, [property.id]);
 
  // ── SEO: Dynamic title + meta for this property listing ──────────────────
  useEffect(() => {
    const beds = property.bedrooms && property.bedrooms > 0 ? `${property.bedrooms} Bedroom ` : '';
    const typeLabel = property.property_type
      ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)
      : 'Property';
    const listingLabel = property.listing_type === 'rent' ? 'for Rent' : 'for Sale';
    const loc = property.neighborhood || 'Kigali';
    const titleStr = `${beds}${typeLabel} ${listingLabel} in ${loc} | PropSpera`;
    document.title = titleStr;
 
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    const priceStr = property.currency === 'USD'
      ? `$${property.price.toLocaleString()}`
      : `${property.price.toLocaleString()} RWF`;
    meta.content = `${beds}${typeLabel.toLowerCase()} ${listingLabel} in ${loc}, Kigali — ${priceStr}${property.listing_type === 'rent' ? '/month' : ''}. Browse verified listings and contact agents on PropSpera.`;
 
    const setOG = (prop: string, val: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      el.content = val;
    };
    setOG('og:title', titleStr);
    setOG('og:description', meta.content);
    setOG('og:type', 'website');
    if (property.images[0]) setOG('og:image', property.images[0]);
  }, [property]);
 
  const nextImage = () => setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1);
 
  const showMortgageCalculator = property.listing_type === 'sale' && property.price > 0;
  const builtArea = (property as any).built_area;
  const furnished = (property as any).furnished as string | undefined;
 
  const getWhatsAppNumber = (phone?: string | null): string => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('250') && digits.length >= 12) return digits;
    if (digits.length >= 12) return digits;
    return '250' + digits;
  };
 
  const getWhatsAppMessage = (): string => {
    const listingType = property.listing_type === 'rent' ? 'for rent' : 'for sale';
    const price = property.currency === 'USD'
      ? `$${property.price.toLocaleString()}`
      : `${property.price.toLocaleString()} RWF`;
    const priceLabel = property.listing_type === 'rent' ? `${price}/month` : price;
    const beds = property.bedrooms && property.bedrooms > 0 ? `${property.bedrooms} bedroom(s), ` : '';
    const baths = property.bathrooms && property.bathrooms > 0 ? `${property.bathrooms} bathroom(s), ` : '';
    const area = property.area_sqm ? `${property.area_sqm} sqm, ` : '';
    const location = property.address || `${property.neighborhood}, ${property.location}`;
 
    return [
      `Hello, I found your listing on PropSpera and I'm interested in the following property:`,
      ``,
      `🏠 *${property.title}*`,
      `📍 Location: ${location}`,
      `💰 Price: ${priceLabel}`,
      `🛏 ${`${beds}${baths}${area}`.replace(/,\s*$/, '')}`,
      `📋 Listing type: ${listingType}`,
      ``,
      `Could you please provide more details and arrange a visit?`,
      ``,
      `Thank you!`,
    ].join('\n');
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-slide-up">
        <div className="relative aspect-[16/10] bg-gray-100">
          <img
            src={property.images[currentImageIndex]}
            alt={`${property.bedrooms ? property.bedrooms + ' bedroom ' : ''}${property.property_type} in ${property.neighborhood || 'Kigali'} — photo ${currentImageIndex + 1} of ${property.images.length}`}
            className="w-full h-full object-cover"
          />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <XIcon size={20} />
          </button>
          {property.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"><ChevronLeftIcon size={20} /></button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"><ChevronRightIcon size={20} /></button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {property.images.map((_, index) => (
              <button key={index} onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'}`} />
            ))}
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            {property.featured && <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold">{t('featured')}</span>}
            <span className={`px-3 py-1 rounded-md text-sm font-semibold ${property.listing_type === 'sale' ? 'bg-terracotta-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {property.listing_type === 'sale' ? t('forSaleFilter') : t('forRentFilter')}
            </span>
            {property.listing_type === 'rent' && furnished && (
              <span className={`px-3 py-1 rounded-md text-sm font-semibold ${furnished === 'furnished' ? 'bg-violet-600 text-white' : 'bg-gray-600 text-white'}`}>
                {furnished === 'furnished' ? t('furnished') : t('unfurnished')}
              </span>
            )}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-gray-900">{formatPropertyPrice(property.price, property.currency)}</span>
              {property.listing_type === 'rent' && <span className="text-gray-500">{t('perMonth')}</span>}
            </div>
            <div className="flex items-center gap-2">
              {onFavorite && (
                <button onClick={() => onFavorite(property.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <HeartIcon size={20} filled={isFavorite} />
                </button>
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h2>
          <div className="flex items-center gap-1 text-gray-500 mb-4">
            <MapPinIcon size={16} /><span>{property.address || `${property.neighborhood}, ${property.location}`}</span>
          </div>
          <div className="flex items-center gap-6 py-4 border-y border-gray-100 mb-4 flex-wrap">
            {property.property_type !== 'land' && property.bedrooms !== undefined && property.bedrooms > 0 && (
              <div className="flex flex-col items-center"><BedIcon size={24} className="text-blue-600 mb-1" /><span className="text-sm font-medium">{property.bedrooms} {property.bedrooms === 1 ? t('bed') : t('beds')}</span></div>
            )}
            {property.property_type !== 'land' && property.bathrooms !== undefined && property.bathrooms > 0 && (
              <div className="flex flex-col items-center"><BathIcon size={24} className="text-blue-600 mb-1" /><span className="text-sm font-medium">{property.bathrooms} {property.bathrooms === 1 ? t('bath') : t('baths')}</span></div>
            )}
            {property.area_sqm && (
              <div className="flex flex-col items-center"><PlotSizeIcon size={24} className="text-blue-600 mb-1" /><span className="text-sm font-medium">{property.area_sqm} {t('sqm')}</span><span className="text-xs text-gray-400">{t('plot')}</span></div>
            )}
            {property.property_type !== 'land' && builtArea && (
              <div className="flex flex-col items-center"><AreaIcon size={24} className="text-blue-600 mb-1" /><span className="text-sm font-medium">{builtArea} {t('sqm')}</span><span className="text-xs text-gray-400">{t('builtLabel')}</span></div>
            )}
            <div className="flex flex-col items-center"><CalendarIcon size={24} className="text-blue-600 mb-1" /><span className="text-sm font-medium">{formatDate(property.created_at)}</span></div>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{t('description')}</h3>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>
          {showMortgageCalculator && <MortgageCalculator propertyId={property.id} propertyPrice={property.price} propertyTitle={property.title} currency={property.currency || 'RWF'} />}
          {property.property_type !== 'land' && property.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t('amenities')}</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">{amenity}</span>)}
              </div>
            </div>
          )}
          {property.agent && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t('listedBy')}</h3>
              <div className="flex items-center gap-3">
                <img src={property.agent.avatar_url} alt={property.agent.full_name} className="w-14 h-14 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{property.agent.company_name || property.agent.user?.full_name}</span>
                    {property.agent.verification_status === 'approved' && <CheckCircleIcon size={16} className="text-blue-600" />}
                  </div>
                  <p className="text-sm text-gray-500">{property.agent.user?.full_name}</p>
                  {property.agent.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <StarIcon size={14} filled className="text-amber-400" />
                      <span className="text-sm font-medium">{property.agent.rating}</span>
                      <span className="text-sm text-gray-500">· {property.agent.total_listings} {t('listingsLabel')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4 pb-1 border-t border-gray-100">
            <button onClick={() => onContact(property)}
              className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              <MessageIcon size={20} />{t('sendMessageBtn')}
            </button>
            {property.agent?.user?.phone ? (
              <a
                href={`https://wa.me/${getWhatsAppNumber(property.agent.user.phone)}?text=${encodeURIComponent(getWhatsAppMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            ) : (
              <div
                className="w-14 h-14 bg-gray-200 text-gray-400 rounded-xl flex items-center justify-center cursor-not-allowed"
                title="No WhatsApp number available"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default PropertyDetail;