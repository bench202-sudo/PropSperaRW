import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useLanguage } from '@/contexts/AuthContext';
import { PropertyType, ListingType } from '@/types';
import { neighborhoods, amenities } from '@/data/mockData';
import { XIcon, ImageIcon, ChevronDownIcon, CheckCircleIcon, AlertCircleIcon } from '@/components/icons/Icons';
 
interface AddPropertyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}
 
 
const CURRENCIES = [
  { value: 'RWF', label: 'RWF – Rwandan Franc', symbol: 'RWF' },
  { value: 'USD', label: 'USD – US Dollar', symbol: '$' },
];
 
const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, onSuccess }) => {
  const { appUser, user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: '' as PropertyType | '',
    listing_type: '' as ListingType | '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    built_area: '',
    furnished: '' as 'furnished' | 'unfurnished' | '',
    neighborhood: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    amenities: [] as string[],
    images: [] as File[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationBanner, setValidationBanner] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);
  const geocodeTimeout = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Scroll banner into view after React renders it
  useEffect(() => {
    if (validationBanner && bannerRef.current) {
      bannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [validationBanner]);
 
  const isLand = formData.property_type === 'land';
 
  useEffect(() => {
    const fetchAgentId = async () => {
      if (!appUser?.id) return;
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, verification_status, is_homeowner')
          .eq('user_id', appUser.id)
          .single();
        if (error) { setError('Could not verify your account. Please try again.'); return; }
        // Agents need approval; homeowners are auto-approved
        if (data.verification_status !== 'approved') {
          setError('Your agent account is not yet approved. Please wait for admin approval before adding properties.');
          return;
        }
        setAgentId(data.id);
      } catch (err) {
        setError('An unexpected error occurred.');
      }
    };
    fetchAgentId();
  }, [appUser]);
 
  // When property type changes to land, force listing_type to 'sale'
  // and clear land-irrelevant fields
  useEffect(() => {
    if (isLand) {
      setFormData(prev => ({
        ...prev,
        listing_type: 'sale',
        bedrooms: '',
        bathrooms: '',
        built_area: '',
        furnished: '',
        amenities: [],
      }));
    }
  }, [isLand]);
 
  const geocodeAddress = async (address: string) => {
    if (!address || address.length < 5) return;
    setGeocoding(true);
    setGeocodeSuccess(false);

    const KIGALI_BOUNDS = { latMin: -2.05, latMax: -1.85, lngMin: 29.95, lngMax: 30.25 };

    const tryNominatim = async (query: string): Promise<{ lat: number; lng: number } | null> => {
      try {
        const params = new URLSearchParams({
          q: query, format: 'json', limit: '1', countrycodes: 'rw',
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { headers: { 'User-Agent': 'PropSpera/1.0' } }
        );
        const data = await res.json();
        if (data?.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (lat >= KIGALI_BOUNDS.latMin && lat <= KIGALI_BOUNDS.latMax &&
              lng >= KIGALI_BOUNDS.lngMin && lng <= KIGALI_BOUNDS.lngMax) {
            return { lat, lng };
          }
        }
      } catch { /* silent */ }
      return null;
    };

    try {
      const neighborhood = formData.neighborhood || '';
      // Strategy 1: full address + neighborhood + Kigali
      let result = await tryNominatim(`${address}, ${neighborhood}, Kigali, Rwanda`.replace(/,\s*,/g, ','));
      // Strategy 2: address + Kigali only
      if (!result) result = await tryNominatim(`${address}, Kigali, Rwanda`);
      // Strategy 3: neighborhood only
      if (!result && neighborhood) result = await tryNominatim(`${neighborhood}, Kigali, Rwanda`);

      if (result) {
        setFormData(prev => ({ ...prev, latitude: result!.lat, longitude: result!.lng }));
        setGeocodeSuccess(true);
        setTimeout(() => setGeocodeSuccess(false), 3000);
      } else {
        setGeocodeError(true);
        setTimeout(() => setGeocodeError(false), 3000);
      }
    } catch (err) {
      console.warn('Geocoding failed:', err);
      setGeocodeError(true);
      setTimeout(() => setGeocodeError(false), 3000);
    }
    setGeocoding(false);
  };
 
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (validationBanner) setValidationBanner(false);
    // Auto-geocode when address or neighborhood changes
    if (field === 'address' || (field === 'neighborhood' && formData.address)) {
      setGeocodeError(false);
      if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
      const addr = field === 'address' ? value : formData.address;
      geocodeTimeout.current = setTimeout(() => geocodeAddress(addr), 800);
    }
  };
 
  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };
 
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 10) }));
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
    if (validationBanner) setValidationBanner(false);
  };
 
  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };
 
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.property_type) newErrors.property_type = 'Property type is required';
    if (!formData.listing_type) newErrors.listing_type = 'Listing type is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.neighborhood) newErrors.neighborhood = 'Neighborhood is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of formData.images) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);
      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
  };
 
  const handleSubmit = async () => {
    if (!validate()) {
      setValidationBanner(true);
      return;
    }
    setValidationBanner(false);
    if (!agentId) { setError('Agent verification required.'); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const imageUrls = await uploadImages();
      const { error: insertError } = await supabase.from('properties').insert({
        agent_id: agentId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        price: parseFloat(formData.price),
        currency: 'RWF',
        bedrooms: !isLand && formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: !isLand && formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        built_area: !isLand && formData.built_area ? parseFloat(formData.built_area) : null,
        location: 'Kigali, Rwanda',
        neighborhood: formData.neighborhood,
        address: formData.address.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        images: imageUrls,
        amenities: isLand ? [] : formData.amenities,
        furnished: !isLand && formData.listing_type === 'rent' && formData.furnished ? formData.furnished : null,
        status: 'pending',
        featured: false,
        views: 0
      });
      if (insertError) throw new Error(`Failed to create property: ${insertError.message}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[95vh] overflow-hidden rounded-t-2xl sm:rounded-2xl animate-slide-up flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('addNewProperty')}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"><XIcon size={20} /></button>
        </div>
 
        {error && (
          <div className="mx-5 mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircleIcon size={20} className="text-red-600 mt-0.5" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-600"><XIcon size={16} /></button>
            </div>
          </div>
        )}
 
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
          {validationBanner && (
            <div ref={bannerRef} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircleIcon size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 mb-1">Please fill in all required fields</p>
                <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
                  {Object.values(errors).filter(Boolean).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setValidationBanner(false)} className="text-red-400 hover:text-red-600"><XIcon size={16} /></button>
            </div>
          )}
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('propertyImagesLabel')}</label>
            <div className="grid grid-cols-4 gap-2">
              {formData.images.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={URL.createObjectURL(file)} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(index)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"><XIcon size={14} /></button>
                </div>
              ))}
              {formData.images.length < 10 && (
                <label className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${errors.images ? 'border-red-500' : 'border-gray-300'}`}>
                  <ImageIcon size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">{t('addImageBtn')}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
          </div>
 
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('titleFieldLabel')}</label>
            <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Modern 3-Bedroom Apartment in Kacyiru"
              className={`w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'ring-2 ring-red-500' : ''}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
 
          {/* Property Type & Listing Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('propertyType')} *</label>
              <div className="relative">
                <select value={formData.property_type} onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className={`w-full py-3 px-4 bg-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.property_type ? 'ring-2 ring-red-500' : ''}`}>
                  <option value="">{t('selectOption')}</option>
                  <option value="house">{t('house')}</option>
                  <option value="apartment">{t('apartment')}</option>
                  <option value="villa">{t('villa')}</option>
                  <option value="commercial">{t('commercial')}</option>
                  <option value="land">{t('land')}</option>
                </select>
                <ChevronDownIcon size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('listingType')} *</label>
              {isLand ? (
                <div className="w-full py-3 px-4 bg-gray-100 rounded-xl text-sm font-medium text-gray-500 flex items-center gap-2">
                  <span>{t('forSale')}</span>
                  <span className="text-xs text-gray-400">({t('land')} only)</span>
                </div>
              ) : (
                <div className="relative">
                  <select value={formData.listing_type} onChange={(e) => handleInputChange('listing_type', e.target.value)}
                    className={`w-full py-3 px-4 bg-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.listing_type ? 'ring-2 ring-red-500' : ''}`}>
                    <option value="">{t('selectOption')}</option>
                    <option value="sale">{t('forSale')}</option>
                    <option value="rent">{t('forRent')}</option>
                  </select>
                  <ChevronDownIcon size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              )}
              {errors.listing_type && <p className="text-red-500 text-xs mt-1">{errors.listing_type}</p>}
            </div>
          </div>
 
          {/* Furnished option - only for rent and non-land */}
          {!isLand && formData.listing_type === 'rent' && (
            <div className="flex gap-3">
              {['furnished', 'unfurnished'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInputChange('furnished', formData.furnished === option ? '' : option)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors capitalize ${
                    formData.furnished === option
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          )}
 
          {/* Price + Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('priceLabel')} {formData.listing_type === 'rent' && <span className="text-gray-400 font-normal">/ {t('month')}</span>}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-shrink-0">
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="h-full py-3 pl-3 pr-8 bg-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm text-gray-700"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.value} value={c.value}>{c.value}</option>
                  ))}
                </select>
                <ChevronDownIcon size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder={formData.currency === 'RWF' ? 'e.g. 50,000,000' : 'e.g. 50,000'}
                className={`flex-1 py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'ring-2 ring-red-500' : ''}`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {formData.currency === 'RWF' ? t('rwfCurrencyHint') : t('usdCurrencyHint')}
            </p>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
 
          {/* Bedrooms, Bathrooms, Plot Size, Built Area */}
          <div className="grid grid-cols-2 gap-4">
            {!isLand && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('beds')}</label>
                <input type="number" value={formData.bedrooms} onChange={(e) => handleInputChange('bedrooms', e.target.value)} placeholder="0"
                  className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            {!isLand && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('bathroomsLabel')}</label>
                <input type="number" value={formData.bathrooms} onChange={(e) => handleInputChange('bathrooms', e.target.value)} placeholder="0"
                  className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('plotSizeLabel')}</label>
              <input type="number" value={formData.area_sqm} onChange={(e) => handleInputChange('area_sqm', e.target.value)} placeholder="0"
                className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {!isLand && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('builtAreaLabel')}</label>
                <input type="number" value={formData.built_area} onChange={(e) => handleInputChange('built_area', e.target.value)} placeholder="0"
                  className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>
 
          {/* Neighborhood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('neighborhoodReqLabel')}</label>
            <div className="relative">
              <select value={formData.neighborhood} onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                className={`w-full py-3 px-4 bg-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.neighborhood ? 'ring-2 ring-red-500' : ''}`}>
                <option value="">{t('selectOption')} {t('neighborhood').toLowerCase()}</option>
                {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <ChevronDownIcon size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
          </div>
 
          {/* Address with geocoding */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('streetAddressLabel')}
              <span className="text-xs text-gray-400 font-normal ml-2">{t('autoLocatesOnMap')}</span>
            </label>
            <div className="relative">
              <input type="text" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g. KG 360 Street, KK 12 Avenue"
                className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
              {geocoding && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
              )}
              {geocodeSuccess && !geocoding && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
              )}
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Located: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
              </p>
            )}
            {geocodeError && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Could not locate address — property will use neighborhood coordinates
              </p>
            )}
          </div>
 
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
            <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('descriptionPlaceholder')} rows={3}
              className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
 
          {/* Amenities — hidden for Land */}
          {!isLand && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('amenities')}</label>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.amenities.includes(amenity) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
 
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
            <CheckCircleIcon size={18} />
            <span>{t('listingUnderReview')}</span>
          </div>
          <button onClick={handleSubmit} disabled={isSubmitting || !agentId}
            className="w-full py-3.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? t('uploadingSubmitting') : t('submitForReview')}
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default AddPropertyModal;
