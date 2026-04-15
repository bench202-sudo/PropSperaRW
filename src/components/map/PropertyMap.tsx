import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Property, PropertyType } from '@/types';
import { getPropertyCoordinates, formatPrice } from '@/data/mockData';
import { XIcon, ZoomInIcon, ZoomOutIcon, CrosshairIcon, BedIcon, BathIcon, AreaIcon, MapPinIcon } from '@/components/icons/Icons';
 
// Declare Leaflet global from CDN
declare const L: any;
 
// Property type colors
const typeColors: Record<string, string> = {
  house: '#2563eb',
  apartment: '#7c3aed',
  villa: '#dc2626',
  commercial: '#ea580c',
  land: '#16a34a',
};
 
const typeLabels: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  villa: 'Villa',
  commercial: 'Commercial',
  land: 'Land',
};
 
// Kigali center coordinates
const KIGALI_CENTER = { lat: -1.9450, lng: 29.8739 };
const DEFAULT_ZOOM = 13;
 
interface PropertyMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: (propertyId: string) => boolean;
  className?: string;
  highlightedPropertyId?: string | null;
  onPropertyHover?: (propertyId: string | null) => void;
}
 
const MAP_STYLES = [
  '.custom-property-marker { background: transparent !important; border: none !important; }',
  '@keyframes pulse {',
  '  0% { transform: rotate(-45deg) scale(1); }',
  '  50% { transform: rotate(-45deg) scale(1.15); }',
  '  100% { transform: rotate(-45deg) scale(1); }',
  '}',
  '.leaflet-popup-content-wrapper { display: none; }',
  '.leaflet-popup-tip-container { display: none; }',
].join('\n');
 
const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  onSelectProperty,
  onFavorite,
  isFavorite,
  className = '',
  highlightedPropertyId,
  onPropertyHover,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const popupRef = useRef<any>(null);
  const hasFitBoundsRef = useRef(false);
  const [mapTypeFilter, setMapTypeFilter] = useState<PropertyType | 'all'>('all');
  const [selectedPin, setSelectedPin] = useState<Property | null>(null);
  const [mapReady, setMapReady] = useState(false);
 
  useEffect(() => {
    hasFitBoundsRef.current = false;
  }, [mapTypeFilter]);
 
  const filteredMapProperties = properties.filter(p => {
    if (mapTypeFilter !== 'all' && p.property_type !== mapTypeFilter) return false;
    return true;
  });
 
  const filteredIdsKey = filteredMapProperties.map(p => p.id).join(',');
 
  const createMarkerIcon = useCallback((property: Property, isHighlighted: boolean = false) => {
    if (typeof L === 'undefined') return null;
    const color = typeColors[property.property_type] || '#2563eb';
    const size = isHighlighted ? 40 : 32;
    const borderWidth = isHighlighted ? 3 : 2;
    return L.divIcon({
      className: 'custom-property-marker',
      html: `
        <div style="
          width: ${size}px; height: ${size}px; background: ${color};
          border: ${borderWidth}px solid white; border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg); box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          ${isHighlighted ? 'animation: pulse 1.5s infinite;' : ''}
        ">
          <span style="transform: rotate(45deg); color: white;
            font-size: ${isHighlighted ? '12px' : '10px'};
            font-weight: 700; line-height: 1;">
            ${property.property_type.charAt(0).toUpperCase()}
          </span>
        </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  }, []);
 
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;
    if (mapRef.current) return;
 
    const map = L.map(mapContainerRef.current, {
      center: [KIGALI_CENTER.lat, KIGALI_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });
 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
 
    mapRef.current = map;
    setMapReady(true);
 
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        hasFitBoundsRef.current = false;
        setMapReady(false);
      }
    };
  }, []);
 
  // Update markers when properties or filter changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
 
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
 
    const bounds: any[] = [];
 
    filteredMapProperties.forEach(property => {
      const coords = getPropertyCoordinates(property);
      if (!coords) return;
 
      const isHighlighted = highlightedPropertyId === property.id;
      const icon = createMarkerIcon(property, isHighlighted);
      if (!icon) return;
 
      const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(mapRef.current);
      marker.on('click', () => setSelectedPin(property));
      marker.on('mouseover', () => onPropertyHover?.(property.id));
      marker.on('mouseout', () => onPropertyHover?.(null));
      markersRef.current.push(marker);
      bounds.push([coords.lat, coords.lng]);
    });
 
    if (!hasFitBoundsRef.current && bounds.length > 0) {
      try {
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        hasFitBoundsRef.current = true;
      } catch (e) {
        // fallback — stay at default Kigali view
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIdsKey, mapReady, highlightedPropertyId]);
 
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => mapRef.current?.setView([KIGALI_CENTER.lat, KIGALI_CENTER.lng], DEFAULT_ZOOM);
 
  const formatPriceShort = (price: number, currency?: string) => {
    if (currency === 'USD') {
      if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
      if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
      return `$${price}`;
    }
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B RWF`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)}M RWF`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K RWF`;
    return `${price} RWF`;
  };
 
  return (
    <div className={`relative bg-gray-100 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />
 
      {/* Inject styles via dangerouslySetInnerHTML to avoid JSX template literal issues */}
      <style dangerouslySetInnerHTML={{ __html: MAP_STYLES }} />
 
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
        <button onClick={handleZoomIn} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Zoom In">
          <ZoomInIcon size={18} className="text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Zoom Out">
          <ZoomOutIcon size={18} className="text-gray-700" />
        </button>
        <button onClick={handleRecenter} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Re-center">
          <CrosshairIcon size={18} className="text-gray-700" />
        </button>
      </div>
 
      {/* Property Type Filter */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-1.5">
        <button onClick={() => setMapTypeFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all ${mapTypeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
          All ({properties.length})
        </button>
        {(Object.keys(typeColors) as PropertyType[]).map(type => {
          const count = properties.filter(p => p.property_type === type).length;
          if (count === 0) return null;
          return (
            <button key={type} onClick={() => setMapTypeFilter(mapTypeFilter === type ? 'all' : type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all flex items-center gap-1.5 ${mapTypeFilter === type ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
              style={mapTypeFilter === type ? { backgroundColor: typeColors[type] } : {}}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeColors[type] }} />
              {typeLabels[type]} ({count})
            </button>
          );
        })}
      </div>
 
      {/* Properties count badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg px-3 py-2 border border-gray-200">
          <div className="flex items-center gap-2">
            <MapPinIcon size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              {filteredMapProperties.length} {filteredMapProperties.length === 1 ? 'property' : 'properties'} on map
            </span>
          </div>
        </div>
      </div>
 
      {/* Selected Property Popup */}
      {selectedPin && (
        <div className="absolute bottom-4 right-4 z-[1000] w-80 max-w-[calc(100vw-2rem)]">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
            <button onClick={() => setSelectedPin(null)}
              className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
              <XIcon size={14} />
            </button>
            <div className="relative h-36 cursor-pointer" onClick={() => { onSelectProperty(selectedPin); setSelectedPin(null); }}>
              <img src={selectedPin.images[0]} alt={selectedPin.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${selectedPin.listing_type === 'sale' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {selectedPin.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white capitalize" style={{ backgroundColor: typeColors[selectedPin.property_type] }}>
                  {selectedPin.property_type}
                </span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-white font-bold text-lg drop-shadow-lg">
                  {formatPriceShort(selectedPin.price, selectedPin.currency)}
                </span>
                {selectedPin.listing_type === 'rent' && <span className="text-white/80 text-xs">/mo</span>}
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => { onSelectProperty(selectedPin); setSelectedPin(null); }}>
                {selectedPin.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPinIcon size={12} />{selectedPin.neighborhood}, Kigali
              </p>
              <div className="flex items-center gap-3 mt-2 text-gray-600 text-xs">
                {selectedPin.bedrooms !== undefined && selectedPin.bedrooms > 0 && (
                  <div className="flex items-center gap-1"><BedIcon size={13} /><span>{selectedPin.bedrooms} Beds</span></div>
                )}
                {selectedPin.bathrooms !== undefined && selectedPin.bathrooms > 0 && (
                  <div className="flex items-center gap-1"><BathIcon size={13} /><span>{selectedPin.bathrooms} Baths</span></div>
                )}
                {selectedPin.area_sqm && (
                  <div className="flex items-center gap-1"><AreaIcon size={13} /><span>{selectedPin.area_sqm} m²</span></div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => { onSelectProperty(selectedPin); setSelectedPin(null); }}
                  className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                {onFavorite && (
                  <button onClick={() => onFavorite(selectedPin.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isFavorite?.(selectedPin.id) ? 'bg-pink-50 text-pink-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite?.(selectedPin.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default PropertyMap;

