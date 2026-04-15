import React, { useMemo } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/data/mockData';
import { useLanguage } from '@/contexts/AuthContext';
import {
  XIcon, MapPinIcon, BedIcon, BathIcon, AreaIcon, CheckCircleIcon,
  ArrowLeftIcon, PlusIcon, ColumnsIcon, StarIcon,
} from '@/components/icons/Icons';
 
interface PropertyComparisonProps {
  properties: Property[]; allProperties: Property[];
  onRemove: (propertyId: string) => void; onClose: () => void;
  onAddMore: () => void; onSelectProperty: (property: Property) => void;
}
 
const MAX_COMPARE = 3;
 
const PropertyComparison: React.FC<PropertyComparisonProps> = ({
  properties, allProperties, onRemove, onClose, onAddMore, onSelectProperty,
}) => {
  const { t } = useLanguage();
 
  const allAmenities = useMemo(() => {
    const amenitySet = new Set<string>();
    properties.forEach((p) => p.amenities.forEach((a) => amenitySet.add(a)));
    return Array.from(amenitySet).sort();
  }, [properties]);
 
  const getDiffClass = (values: (string | number | undefined | null)[]) => {
    const defined = values.filter((v) => v !== undefined && v !== null);
    if (defined.length < 2) return '';
    const allSame = defined.every((v) => String(v) === String(defined[0]));
    return allSame ? '' : 'bg-amber-50';
  };
 
  const getBestValueClass = (values: (number | undefined)[], type: 'highest' | 'lowest', index: number) => {
    const defined = values.filter((v): v is number => v !== undefined && v !== null);
    if (defined.length < 2) return '';
    const best = type === 'highest' ? Math.max(...defined) : Math.min(...defined);
    if (values[index] === best) return 'text-emerald-700 font-bold';
    return '';
  };
 
  const prices = properties.map((p) => p.price);
  const bedrooms = properties.map((p) => p.bedrooms);
  const bathrooms = properties.map((p) => p.bathrooms);
  const areas = properties.map((p) => p.area_sqm);
  const emptySlots = MAX_COMPARE - properties.length;
 
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 relative">
          <button onClick={onClose} className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-4">
            <ArrowLeftIcon size={18} />
            <span className="text-sm font-medium">{t('backToListings')}</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ColumnsIcon size={22} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('compareProperties')}</h1>
          </div>
          <p className="text-blue-100 max-w-xl">{t('compareUpTo').replace('{max}', String(MAX_COMPARE))}</p>
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto px-4 py-8">
        {properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ColumnsIcon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noPropertiesToCompare')}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{t('noPropertiesCompareHint')}</p>
            <button onClick={onClose} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              {t('browsePropertiesBtn')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-48 min-w-[180px] p-3 text-left text-sm font-semibold text-gray-500 align-top bg-gray-50 rounded-tl-xl border-b border-gray-200">
                    {t('property')}
                  </th>
                  {properties.map((property) => (
                    <th key={property.id} className="min-w-[240px] p-3 align-top border-b border-gray-200 bg-white">
                      <div className="relative group">
                        <button onClick={() => onRemove(property.id)}
                          className="absolute -top-1 -right-1 z-10 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100">
                          <XIcon size={14} />
                        </button>
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer mb-3" onClick={() => onSelectProperty(property)}>
                          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${property.listing_type === 'sale' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}`}>
                              {property.listing_type === 'sale' ? t('forSaleBadge') : t('forRentBadge')}
                            </span>
                            {property.featured && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs font-semibold">{t('featured')}</span>}
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm text-left line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => onSelectProperty(property)}>
                          {property.title}
                        </h3>
                      </div>
                    </th>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => (
                    <th key={`empty-${i}`} className="min-w-[240px] p-3 align-top border-b border-gray-200 bg-gray-50/50">
                      <button onClick={onAddMore} className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all group cursor-pointer mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <PlusIcon size={20} className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-blue-500 font-medium">{t('addProperty')}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr className={getDiffClass(prices.map(String))}>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      {t('price')}
                    </div>
                  </td>
                  {properties.map((p, i) => (
                    <td key={p.id} className={`p-3 border-b border-gray-100 ${getBestValueClass(prices, 'lowest', i)}`}>
                      <div className="text-lg font-bold text-gray-900">{formatPrice(p.price)}</div>
                      {p.listing_type === 'rent' && <span className="text-xs text-gray-500">{t('perMonth')}</span>}
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-price-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-6 w-24 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Type */}
                <tr className={getDiffClass(properties.map((p) => p.property_type))}>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/></svg>{t('type')}</div>
                  </td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 border-b border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">{p.property_type}</span>
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-type-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-6 w-20 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Listing */}
                <tr className={getDiffClass(properties.map((p) => p.listing_type))}>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{t('listingTypeLabel')}</div>
                  </td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 border-b border-gray-100">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${p.listing_type === 'sale' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {p.listing_type === 'sale' ? t('forSaleBadge') : t('forRentBadge')}
                      </span>
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-listing-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-6 w-16 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Location */}
                <tr className={getDiffClass(properties.map((p) => p.neighborhood))}>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2"><MapPinIcon size={16} className="text-gray-400"/>{t('location')}</div>
                  </td>
                  {properties.map((p) => (<td key={p.id} className="p-3 border-b border-gray-100"><div className="font-medium text-gray-900">{p.neighborhood}</div><div className="text-xs text-gray-500">{p.location}</div></td>))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-loc-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-5 w-28 bg-gray-100 rounded animate-pulse mb-1"/><div className="h-4 w-16 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Bedrooms */}
                <tr className={getDiffClass(bedrooms.map((b) => b?.toString()))}>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2"><BedIcon size={16} className="text-gray-400"/>{t('bedrooms')}</div>
                  </td>
                  {properties.map((p, i) => (
                    <td key={p.id} className={`p-3 border-b border-gray-100 ${getBestValueClass(bedrooms as (number|undefined)[], 'highest', i)}`}>
                      <span className="text-gray-900 font-medium">{p.bedrooms !== undefined && p.bedrooms > 0 ? `${p.bedrooms} ${p.bedrooms === 1 ? t('bedroom') : t('bedrooms')}` : 'N/A'}</span>
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-bed-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-5 w-20 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Bathrooms */}
                <tr className={getDiffClass(bathrooms.map((b) => b?.toString()))}>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2"><BathIcon size={16} className="text-gray-400"/>{t('bathrooms')}</div>
                  </td>
                  {properties.map((p, i) => (
                    <td key={p.id} className={`p-3 border-b border-gray-100 ${getBestValueClass(bathrooms as (number|undefined)[], 'highest', i)}`}>
                      <span className="text-gray-900 font-medium">{p.bathrooms !== undefined && p.bathrooms > 0 ? `${p.bathrooms} ${p.bathrooms === 1 ? t('bathroom') : t('bathrooms')}` : 'N/A'}</span>
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-bath-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-5 w-20 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Area */}
                <tr className={getDiffClass(areas.map((a) => a?.toString()))}>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2"><AreaIcon size={16} className="text-gray-400"/>{t('area')}</div>
                  </td>
                  {properties.map((p, i) => (
                    <td key={p.id} className={`p-3 border-b border-gray-100 ${getBestValueClass(areas as (number|undefined)[], 'highest', i)}`}>
                      <span className="text-gray-900 font-medium">{p.area_sqm ? `${p.area_sqm.toLocaleString()} m²` : 'N/A'}</span>
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-area-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-5 w-16 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Price/m² */}
                <tr>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>{t('pricePerSqm')}</div>
                  </td>
                  {properties.map((p, i) => {
                    const pricePerSqm = p.area_sqm ? Math.round(p.price / p.area_sqm) : null;
                    const allPrices = properties.map((pp) => pp.area_sqm ? Math.round(pp.price / pp.area_sqm) : undefined);
                    return (
                      <td key={p.id} className={`p-3 border-b border-gray-100 ${getBestValueClass(allPrices as (number|undefined)[], 'lowest', i)}`}>
                        <span className="text-gray-900 font-medium">{pricePerSqm ? `${pricePerSqm.toLocaleString()} RWF` : 'N/A'}</span>
                      </td>
                    );
                  })}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-ppsqm-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-5 w-24 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Views */}
                <tr>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{t('views')}</div>
                  </td>
                  {properties.map((p) => (<td key={p.id} className="p-3 border-b border-gray-100"><span className="text-gray-900 font-medium">{p.views.toLocaleString()}</span></td>))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-views-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-5 w-12 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Amenities header */}
                <tr><td colSpan={MAX_COMPARE + 1} className="p-3 bg-gray-100 border-b border-gray-200"><span className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('amenitiesSection')}</span></td></tr>
 
                {allAmenities.map((amenity) => {
                  const hasAmenity = properties.map((p) => p.amenities.includes(amenity));
                  const allHave = hasAmenity.every(Boolean);
                  const noneHave = hasAmenity.every((h) => !h);
                  const isDiff = !allHave && !noneHave;
                  return (
                    <tr key={amenity} className={isDiff ? 'bg-amber-50' : ''}>
                      <td className="p-3 text-sm font-medium text-gray-600 bg-gray-50 border-b border-gray-100">{amenity}</td>
                      {properties.map((p) => {
                        const has = p.amenities.includes(amenity);
                        return (
                          <td key={p.id} className="p-3 border-b border-gray-100 text-center">
                            {has ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircleIcon size={16}/><span className="text-sm font-medium">Yes</span></span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-gray-300"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg><span className="text-sm">No</span></span>
                            )}
                          </td>
                        );
                      })}
                      {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-am-${amenity}-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50 text-center"><div className="h-5 w-10 bg-gray-100 rounded animate-pulse mx-auto"/></td>)}
                    </tr>
                  );
                })}
 
                {/* Agent header */}
                <tr><td colSpan={MAX_COMPARE + 1} className="p-3 bg-gray-100 border-b border-gray-200"><span className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('agentInfo')}</span></td></tr>
 
                {/* Agent */}
                <tr>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">{t('agent')}</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 border-b border-gray-100">
                      {p.agent ? (
                        <div className="flex items-center gap-2">
                          {p.agent.user?.avatar_url ? (
                            <img src={p.agent.user.avatar_url} alt={p.agent.user.full_name} className="w-8 h-8 rounded-full object-cover"/>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><span className="text-blue-600 text-sm font-medium">{p.agent.user?.full_name?.charAt(0) || '?'}</span></div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 text-sm flex items-center gap-1">
                              {p.agent.user?.full_name}
                              {p.agent.verification_status === 'approved' && <CheckCircleIcon size={14} className="text-blue-600"/>}
                            </div>
                            {p.agent.company_name && <div className="text-xs text-gray-500">{p.agent.company_name}</div>}
                          </div>
                        </div>
                      ) : <span className="text-gray-400 text-sm">N/A</span>}
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-agent-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"/><div className="h-4 w-24 bg-gray-100 rounded animate-pulse"/></div></td>)}
                </tr>
 
                {/* Rating */}
                <tr>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100">{t('rating')}</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 border-b border-gray-100">
                      {p.agent && p.agent.rating != null ? (
                        <div className="flex items-center gap-1"><StarIcon size={16} filled className="text-amber-400"/><span className="font-medium text-gray-900">{parseFloat(String(p.agent.rating)).toFixed(1)}</span></div>
                      ) : <span className="text-gray-400 text-sm">N/A</span>}
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-rating-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-5 w-12 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
 
                {/* Experience */}
                <tr>
                  <td className="p-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-100 rounded-bl-xl">{t('experience')}</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 border-b border-gray-100">
                      {p.agent ? <span className="text-gray-900 font-medium">{p.agent.years_experience} {p.agent.years_experience === 1 ? t('year') : t('years')}</span> : <span className="text-gray-400 text-sm">N/A</span>}
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }).map((_, i) => <td key={`e-exp-${i}`} className="p-3 border-b border-gray-100 bg-gray-50/50"><div className="h-5 w-16 bg-gray-100 rounded animate-pulse"/></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        )}
 
        {properties.length >= 2 && (
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-50 border border-amber-200"/><span>{t('valuesDiffer')}</span></div>
            <div className="flex items-center gap-2"><span className="text-emerald-700 font-bold text-xs">Bold green</span><span>{t('bestValue')}</span></div>
          </div>
        )}
 
        {properties.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {properties.length < MAX_COMPARE && (
              <button onClick={onAddMore} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                <PlusIcon size={18}/>{t('addAnotherProperty')}
              </button>
            )}
            <button onClick={() => properties.forEach((p) => onRemove(p.id))} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <XIcon size={18}/>{t('clearAll2')}
            </button>
            <button onClick={onClose} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <ArrowLeftIcon size={18}/>{t('backToListings')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default PropertyComparison;
