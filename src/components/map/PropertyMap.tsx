import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Property, PropertyType } from '@/types';
import { getPropertyCoordinates } from '@/data/mockData';
import {
  XIcon, ZoomInIcon, ZoomOutIcon, CrosshairIcon,
  BedIcon, BathIcon, AreaIcon, MapPinIcon,
} from '@/components/icons/Icons';

// ─── Mapbox token ─────────────────────────────────────────────────────────────

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

// ─── Constants ───────────────────────────────────────────────────────────────

const KIGALI_CENTER: [number, number] = [30.0619, -1.9441]; // [lng, lat]
const DEFAULT_ZOOM = 12;

const TYPE_COLORS: Record<string, string> = {
  house:      '#2563eb',
  apartment:  '#7c3aed',
  villa:      '#dc2626',
  commercial: '#ea580c',
  land:       '#16a34a',
};

const TYPE_LABELS: Record<string, string> = {
  house: 'House', apartment: 'Apartment', villa: 'Villa',
  commercial: 'Commercial', land: 'Land',
};

type MapStyle = 'streets' | 'satellite' | 'hybrid';
const MAP_STYLES: Record<MapStyle, { label: string; url: string }> = {
  streets:   { label: 'Streets',   url: 'mapbox://styles/mapbox/streets-v12' },
  satellite: { label: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9' },
  hybrid:    { label: 'Hybrid',    url: 'mapbox://styles/mapbox/satellite-streets-v12' },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface PropertyMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: (propertyId: string) => boolean;
  className?: string;
  highlightedPropertyId?: string | null;
  onPropertyHover?: (propertyId: string | null) => void;
}

// ─── Price formatter ─────────────────────────────────────────────────────────

function fmtPrice(price: number, currency?: string): string {
  if (currency === 'USD') {
    if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
    if (price >= 1_000)     return `$${Math.round(price / 1_000)}K`;
    return `$${price}`;
  }
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B RWF`;
  if (price >= 1_000_000)     return `${Math.round(price / 1_000_000)}M RWF`;
  if (price >= 1_000)         return `${Math.round(price / 1_000)}K RWF`;
  return `${price} RWF`;
}

// ─── Marker DOM element factory ───────────────────────────────────────────────

type MarkerVariant = 'default' | 'hover' | 'selected';

function makePriceEl(property: Property, variant: MarkerVariant): HTMLElement {
  const color  = TYPE_COLORS[property.property_type] ?? '#2563eb';
  const label  = fmtPrice(property.price, property.currency);
  const active = variant !== 'default';
  const bg     = active ? color : '#ffffff';
  const fg     = active ? '#ffffff' : color;
  const shadow = variant === 'selected'
    ? `0 4px 20px ${color}55`
    : active ? `0 3px 12px ${color}44`
    : '0 2px 8px rgba(0,0,0,0.15)';
  const scale  = variant === 'selected' ? 'scale(1.14)' : 'scale(1)';
  const fs     = variant === 'selected' ? '12px' : '11px';

  const el = document.createElement('div');
  el.style.cssText = 'cursor:pointer;';
  el.innerHTML = `<div style="display:inline-flex;align-items:center;justify-content:center;background:${bg};color:${fg};border:2px solid ${color};border-radius:16px;padding:5px 10px;white-space:nowrap;font-size:${fs};font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-shadow:${shadow};cursor:pointer;transform:translate(-50%,-110%) ${scale};transition:box-shadow 0.15s,transform 0.15s;position:relative;">${label}<div style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${color};"></div></div>`;
  return el;
}

// ─── Geocoding cache ──────────────────────────────────────────────────────────

const geocodeCache = new Map<string, [number, number] | null>();

async function geocodeAddress(address: string, neighborhood?: string): Promise<[number, number] | null> {
  const query = neighborhood
    ? `${address}, ${neighborhood}, Kigali, Rwanda`
    : `${address}, Kigali, Rwanda`;

  if (geocodeCache.has(query)) return geocodeCache.get(query)!;

  try {
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=rw&proximity=30.0619,-1.9441&limit=1&access_token=${token}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const json = await res.json();
    if (json.features?.length > 0) {
      const result = json.features[0].center as [number, number];
      geocodeCache.set(query, result);
      return result;
    }
  } catch (err) {
    console.warn('[PropertyMap] Geocoding failed for:', query, err);
  }

  geocodeCache.set(query, null);
  return null;
}

// ─── Coordinate resolver ──────────────────────────────────────────────────────

async function resolveCoords(property: Property): Promise<[number, number]> {
  const lat = typeof property.latitude === 'string'
    ? parseFloat(property.latitude as unknown as string)
    : property.latitude;
  const lng = typeof property.longitude === 'string'
    ? parseFloat(property.longitude as unknown as string)
    : property.longitude;

  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    return [lng, lat];
  }

  if (property.address && property.address.trim().length > 0) {
    const result = await geocodeAddress(property.address, property.neighborhood);
    if (result) return result;
  }

  const fallback = getPropertyCoordinates(property);
  return [fallback.lng, fallback.lat];
}

// ─── Component ───────────────────────────────────────────────────────────────

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties, onSelectProperty, onFavorite, isFavorite,
  className = '', highlightedPropertyId, onPropertyHover,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<mapboxgl.Map | null>(null);
  const markersRef      = useRef<Map<string, { marker: mapboxgl.Marker; property: Property }>>(new Map());
  const selectedIdRef   = useRef<string | null>(null);

  const [mapReady,      setMapReady]      = useState(false);
  const [mapStyle,      setMapStyle]      = useState<MapStyle>('streets');
  const [selectedPin,   setSelectedPin]   = useState<Property | null>(null);
  const [mapTypeFilter, setMapTypeFilter] = useState<PropertyType | 'all'>('all');

  useEffect(() => { selectedIdRef.current = selectedPin?.id ?? null; }, [selectedPin]);

  const filteredProperties = properties.filter(
    p => mapTypeFilter === 'all' || p.property_type === mapTypeFilter
  );
  const filteredKey = filteredProperties.map(p => p.id).join(',');

  // ── Init Mapbox ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.streets.url,
      center: KIGALI_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: true,
    });

    map.on('load', () => setMapReady(true));
    map.on('click', () => setSelectedPin(null));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      setMapReady(false);
    };
  }, []);

  // ── Style switcher ──────────────────────────────────────────────────────────
  const handleStyleChange = useCallback((style: MapStyle) => {
    if (!mapRef.current) return;
    setMapStyle(style);
    mapRef.current.setStyle(MAP_STYLES[style].url);
  }, []);

  // ── Place / rebuild markers ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();
    selectedIdRef.current = null;
    setSelectedPin(null);

    const bounds = new mapboxgl.LngLatBounds();
    let hasPoints = false;

    const addMarkers = async () => {
      for (const property of filteredProperties) {
        const [lng, lat] = await resolveCoords(property);
        const el = makePriceEl(property, 'default');

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedPin(property);
          map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15), duration: 600 });
        });

        el.addEventListener('mouseenter', () => {
          onPropertyHover?.(property.id);
          if (selectedIdRef.current !== property.id) {
            const inner = makePriceEl(property, 'hover').firstElementChild!.cloneNode(true);
            el.replaceChildren(inner);
          }
        });

        el.addEventListener('mouseleave', () => {
          onPropertyHover?.(null);
          if (selectedIdRef.current !== property.id) {
            const inner = makePriceEl(property, 'default').firstElementChild!.cloneNode(true);
            el.replaceChildren(inner);
          }
        });

        markersRef.current.set(property.id, { marker, property });
        bounds.extend([lng, lat]);
        hasPoints = true;
      }

      if (hasPoints && filteredProperties.length > 1) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
      }
    };

    addMarkers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredKey, mapReady]);

  // ── Selected marker visual ──────────────────────────────────────────────────
  useEffect(() => {
    markersRef.current.forEach(({ marker, property }) => {
      const el = marker.getElement();
      const variant: MarkerVariant = selectedPin?.id === property.id ? 'selected' : 'default';
      const inner = makePriceEl(property, variant).firstElementChild!.cloneNode(true);
      el.replaceChildren(inner);
    });
  }, [selectedPin]);

  // ── Externally highlighted marker ───────────────────────────────────────────
  useEffect(() => {
    markersRef.current.forEach(({ marker, property }) => {
      const el = marker.getElement();
      const isSelected    = selectedIdRef.current === property.id;
      const isHighlighted = highlightedPropertyId === property.id;
      const variant: MarkerVariant = isSelected ? 'selected' : isHighlighted ? 'hover' : 'default';
      const inner = makePriceEl(property, variant).firstElementChild!.cloneNode(true);
      el.replaceChildren(inner);
    });
  }, [highlightedPropertyId]);

  const handleZoomIn   = () => mapRef.current?.zoomIn();
  const handleZoomOut  = () => mapRef.current?.zoomOut();
  const handleRecenter = () => mapRef.current?.flyTo({ center: KIGALI_CENTER, zoom: DEFAULT_ZOOM });

  return (
    <div className={`relative bg-gray-100 ${className}`} style={{ isolation: 'isolate', zIndex: 0 }}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

      {/* ── Style switcher — top center ────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {(Object.keys(MAP_STYLES) as MapStyle[]).map((style) => (
          <button
            key={style}
            onClick={() => handleStyleChange(style)}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              mapStyle === style ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {MAP_STYLES[style].label}
          </button>
        ))}
      </div>

      {/* ── Property type filter chips — top left ─────────────────────── */}
      <div className="absolute top-14 left-4 z-[1000] flex flex-wrap gap-1.5">
        <button
          onClick={() => setMapTypeFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all ${
            mapTypeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          All ({properties.length})
        </button>
        {(Object.keys(TYPE_COLORS) as PropertyType[]).map((type) => {
          const count = properties.filter((p) => p.property_type === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setMapTypeFilter(mapTypeFilter === type ? 'all' : type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all flex items-center gap-1.5 ${
                mapTypeFilter === type ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={mapTypeFilter === type ? { backgroundColor: TYPE_COLORS[type] } : {}}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} />
              {TYPE_LABELS[type]} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Zoom / Recenter — top right ───────────────────────────────── */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
        <button onClick={handleZoomIn} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Zoom In">
          <ZoomInIcon size={18} className="text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Zoom Out">
          <ZoomOutIcon size={18} className="text-gray-700" />
        </button>
        <button onClick={handleRecenter} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Re-center on Kigali">
          <CrosshairIcon size={18} className="text-gray-700" />
        </button>
      </div>

      {/* ── Properties count — bottom left ────────────────────────────── */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg px-3 py-2 border border-gray-200">
          <div className="flex items-center gap-2">
            <MapPinIcon size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              {filteredProperties.length}{' '}
              {filteredProperties.length === 1 ? 'property' : 'properties'} on map
            </span>
          </div>
        </div>
      </div>

      {/* ── Selected Property Card — bottom right ─────────────────────── */}
      {selectedPin && (
        <div className="absolute bottom-4 right-4 z-[1000] w-80 max-w-[calc(100vw-2rem)]">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
            <button
              onClick={() => setSelectedPin(null)}
              className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <XIcon size={14} />
            </button>
            <div
              className="relative h-36 cursor-pointer"
              onClick={() => { onSelectProperty(selectedPin); setSelectedPin(null); }}
            >
              {selectedPin.images?.[0] ? (
                <img src={selectedPin.images[0]} alt={selectedPin.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <MapPinIcon size={32} className="text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${selectedPin.listing_type === 'sale' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {selectedPin.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white capitalize" style={{ backgroundColor: TYPE_COLORS[selectedPin.property_type] ?? '#2563eb' }}>
                  {selectedPin.property_type}
                </span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-white font-bold text-lg drop-shadow-lg">{fmtPrice(selectedPin.price, selectedPin.currency)}</span>
                {selectedPin.listing_type === 'rent' && <span className="text-white/80 text-xs">/mo</span>}
              </div>
            </div>
            <div className="p-3">
              <h4
                className="font-semibold text-gray-900 text-sm line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => { onSelectProperty(selectedPin); setSelectedPin(null); }}
              >
                {selectedPin.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPinIcon size={12} />{selectedPin.neighborhood}, Kigali
              </p>
              <div className="flex items-center gap-3 mt-2 text-gray-600 text-xs">
                {(selectedPin.bedrooms ?? 0) > 0 && (
                  <div className="flex items-center gap-1"><BedIcon size={13} /><span>{selectedPin.bedrooms} Beds</span></div>
                )}
                {(selectedPin.bathrooms ?? 0) > 0 && (
                  <div className="flex items-center gap-1"><BathIcon size={13} /><span>{selectedPin.bathrooms} Baths</span></div>
                )}
                {selectedPin.area_sqm && (
                  <div className="flex items-center gap-1"><AreaIcon size={13} /><span>{selectedPin.area_sqm} m²</span></div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => { onSelectProperty(selectedPin); setSelectedPin(null); }}
                  className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                {onFavorite && (
                  <button
                    onClick={() => onFavorite(selectedPin.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isFavorite?.(selectedPin.id) ? 'bg-pink-50 text-pink-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24"
                      fill={isFavorite?.(selectedPin.id) ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
