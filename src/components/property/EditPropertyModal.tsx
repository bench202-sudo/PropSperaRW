import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useLanguage } from '@/contexts/AuthContext';
import { Property, PropertyType, ListingType, PropertyStatus } from '@/types';
import { neighborhoods, amenities } from '@/data/mockData';
import { XIcon, ImageIcon, ChevronDownIcon, CheckCircleIcon, AlertCircleIcon, TrashIcon } from '@/components/icons/Icons';
 
interface EditPropertyModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}
 
 
const CURRENCIES = [
  { value: 'RWF', label: 'RWF – Rwandan Franc', symbol: 'RWF' },
  { value: 'USD', label: 'USD – US Dollar', symbol: '$' },
];
 
const EditPropertyModal: React.FC<EditPropertyModalProps> = ({ property, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description || '',
    property_type: property.property_type as PropertyType,
    listing_type: property.listing_type as ListingType,
    price: property.price.toString(),
    currency: property.currency || 'RWF',
    bedrooms: property.bedrooms?.toString() || '',
    bathrooms: property.bathrooms?.toString() || '',
    area_sqm: property.area_sqm?.toString() || '',
    built_area: (property as any).built_area?.toString() || '',
    furnished: (property as any).furnished || '' as 'furnished' | 'unfurnished' | '',
    neighborhood: property.neighborhood || '',
    address: property.address || '',
    latitude: (property as any).latitude || null as number | null,
    longitude: (property as any).longitude || null as number | null,
    amenities: property.amenities || [],
    existingImages: property.images || [],
    newImages: [] as File[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);
  const geocodeTimeout = useRef<any>(null);
 
  const geocodeAddress = async (address: string) => {
    if (!address || address.length < 5) return;
    setGeocoding(true);
    setGeocodeSuccess(false);
    try {
      // Google Geocoding API — best accuracy for Kigali KG/KK/KN streets
      const query = encodeURIComponent(`${address}, Kigali, Rwanda`);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyCVQ1nUKY0b5fTqvwtH2U2l9DQQKoFWpkM&region=rw&bounds=-2.05,29.77|-1.85,30.00`
      );
      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setGeocodeSuccess(true);
        setTimeout(() => setGeocodeSuccess(false), 3000);
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
    if (field === 'address') {
      setGeocodeError(false);
      if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
      geocodeTimeout.current = setTimeout(() => geocodeAddress(value), 800);
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
    const totalImages = formData.existingImages.length - imagesToDelete.length + formData.newImages.length + files.length;
    if (totalImages > 10) { setError('Maximum 10 images allowed'); return; }
    setFormData(prev => ({ ...prev, newImages: [...prev.newImages, ...files] }));
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  };
 
  const removeExistingImage = (imageUrl: string) => setImagesToDelete(prev => [...prev, imageUrl]);
  const removeNewImage = (index: number) => setFormData(prev => ({ ...prev, newImages: prev.newImages.filter((_, i) => i !== index) }));
 
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.property_type) newErrors.property_type = 'Property type is required';
    if (!formData.listing_type) newErrors.listing_type = 'Listing type is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.neighborhood) newErrors.neighborhood = 'Neighborhood is required';
    const remainingImages = formData.existingImages.filter(img => !imagesToDelete.includes(img)).length;
    if (remainingImages + formData.newImages.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const uploadNewImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of formData.newImages) {
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
    if (!validate()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const newImageUrls = await uploadNewImages();
      const remainingImages = formData.existingImages.filter(img => !imagesToDelete.includes(img));
      const allImages = [...remainingImages, ...newImageUrls];
      const { error: updateError } = await supabase.from('properties').update({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        price: parseFloat(formData.price),
        currency: formData.currency,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        built_area: formData.built_area ? parseFloat(formData.built_area) : null,
        neighborhood: formData.neighborhood,
        address: formData.address.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        images: allImages,
        amenities: formData.amenities,
        furnished: formData.listing_type === 'rent' && formData.furnished ? formData.furnished : null,
        updated_at: new Date().toISOString()
      }).eq('id', property.id);
      if (updateError) throw new Error(`Failed to update property: ${updateError.message}`);
      for (const imageUrl of imagesToDelete) {
        try {
          const path = imageUrl.split('/property-images/')[1];
          if (path) await supabase.storage.from('property-images').remove([path]);
        } catch (e) { console.warn('Failed to delete image:', e); }
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
 
  const remainingExistingImages = formData.existingImages.filter(img => !imagesToDelete.includes(img));
  const totalImages = remainingExistingImages.length + formData.newImages.length;
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[95vh] overflow-hidden rounded-t-2xl sm:rounded-2xl animate-slide-up flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('editPropertyTitle')}</h2>
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
 
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('propertyImagesLabel')} ({totalImages}/10)</label>
            <div className="grid grid-cols-4 gap-2">
              {remainingExistingImages.map((imageUrl, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={imageUrl} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removeExistingImage(imageUrl)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"><XIcon size={14} /></button>
                </div>
              ))}
              {formData.newImages.map((file, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={URL.createObjectURL(file)} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removeNewImage(index)} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"><XIcon size={14} /></button>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded">New</div>
                </div>
              ))}
              {totalImages < 10 && (
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
              <div className="relative">
                <select value={formData.listing_type} onChange={(e) => handleInputChange('listing_type', e.target.value)}
                  className={`w-full py-3 px-4 bg-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.listing_type ? 'ring-2 ring-red-500' : ''}`}>
                  <option value="">{t('selectOption')}</option>
                  <option value="sale">{t('forSale')}</option>
                  <option value="rent">{t('forRent')}</option>
                </select>
                <ChevronDownIcon size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
 
          {/* Furnished option - only for rent */}
          {formData.listing_type === 'rent' && (
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
              Price * {formData.listing_type === 'rent' && <span className="text-gray-400 font-normal">/ month</span>}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('beds')}</label>
              <input type="number" value={formData.bedrooms} onChange={(e) => handleInputChange('bedrooms', e.target.value)} placeholder="0"
                className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bathroomsLabel')}</label>
              <input type="number" value={formData.bathrooms} onChange={(e) => handleInputChange('bathrooms', e.target.value)} placeholder="0"
                className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('plotSizeLabel')}</label>
              <input type="number" value={formData.area_sqm} onChange={(e) => handleInputChange('area_sqm', e.target.value)} placeholder="0"
                className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('builtAreaLabel')}</label>
              <input type="number" value={formData.built_area} onChange={(e) => handleInputChange('built_area', e.target.value)} placeholder="0"
                className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
 
          {/* Neighborhood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('neighborhoodReqLabel')}</label>
            <div className="relative">
              <select value={formData.neighborhood} onChange={(e) => handleChange('neighborhood', e.target.value)}
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
              Street Address
              <span className="text-xs text-gray-400 font-normal ml-2">— auto-locates on map</span>
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
            <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('descriptionPlaceholder')} rows={3}
              className="w-full py-3 px-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
 
          {/* Amenities */}
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
        </div>
 
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? t('savingChanges') : t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default EditPropertyModal;