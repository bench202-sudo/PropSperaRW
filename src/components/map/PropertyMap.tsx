import React, { useEffect, useRef, useState } from 'react';
import { Property, PropertyType } from '@/types';
import { getPropertyCoordinates } from '@/data/mockData';
import { XIcon, ZoomInIcon, ZoomOutIcon, CrosshairIcon, BedIcon, BathIcon, AreaIcon, MapPinIcon } from '@/components/icons/Icons';

// Leaflet loaded from CDN (index.html)
declare const L: any;

// ─── Constants ───────────────────────────────────────────────────────────────

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

const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };
const DEFAULT_ZOOM  = 13;

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

interface HoverState { property: Property; x: number; y: number }

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

// ─── PriceMarker icon factory ─────────────────────────────────────────────────
// Renders a price pill directly on the map instead of a generic teardrop pin.
// variant: 'default' = white pill w/ colored border
//          'hover'   = filled colored pill
//          'selected'= filled + slightly larger

type IconVariant = 'default' | 'hover' | 'selected';

function makePriceIcon(property: Property, variant: IconVariant) {
  if (typeof L === 'undefined') return null;
  const color  = TYPE_COLORS[property.property_type] ?? '#2563eb';
  const label  = fmtPrice(property.price, property.currency);
  const active = variant !== 'default';
  const bg     = active ? color : '#ffffff';
  const fg     = active ? '#ffffff' : color;
  const shadow = variant === 'selected'
    ? `0 4px 20px ${color}55`
    : active ? `0 3px 12px ${color}44`
    : '0 2px 8px rgba(0,0,0,0.15)';
  const scaleT = variant === 'selected' ? 'scale(1.14)' : 'scale(1)';
  const fs     = variant === 'selected' ? '12px' : '11px';

  // iconSize [0,0] + translate(-50%,-110%) centres the pill above the coordinate point
  return L.divIcon({
    className: '',
    html: `<div style="
      display:inline-flex;align-items:center;justify-content:center;
      background:${bg};color:${fg};border:2px solid ${color};border-radius:16px;
      padding:5px 10px;white-space:nowrap;font-size:${fs};font-weight:700;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-shadow:${shadow};cursor:pointer;
      transform:translate(-50%,-110%) ${scaleT};
      transition:box-shadow 0.15s,transform 0.15s;position:relative;
    ">
      ${label}
      <div style="
        position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);
        width:0;height:0;
        border-left:5px solid transparent;border-right:5px solid transparent;
        border-top:7px solid ${active ? color : color};
      "></div>
    </div>`,
    iconSize:   [0, 0],
    iconAnchor: [0, 0],
  });
}

// ─── ClusterLayer — loads leaflet.markercluster once from CDN ─────────────────

let _clusterReady   = false;
let _clusterLoading = false;
const _clusterCbs: (() => void)[] = [];

function loadMarkerCluster(): Promise<void> {
  return new Promise(resolve => {
    if (_clusterReady) { resolve(); return; }
    _clusterCbs.push(resolve);
    if (_clusterLoading) return;
    _clusterLoading = true;
    const cdn = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist';
    ['MarkerCluster.css', 'MarkerCluster.Default.css'].forEach(f => {
      const el = document.createElement('link');
      el.rel = 'stylesheet'; el.href = `${cdn}/${f}`;
      document.head.appendChild(el);
    });
    const script = document.createElement('script');
    script.src = `${cdn}/leaflet.markercluster.js`;
    script.onload = () => {
      _clusterReady = true; _clusterLoading = false;
      _clusterCbs.splice(0).forEach(cb => cb());
    };
    document.head.appendChild(script);
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties, onSelectProperty, onFavorite, isFavorite,
  className = '', highlightedPropertyId, onPropertyHover,
}) => {
  const mapContainerRef  = useRef<HTMLDivElement>(null);
  const mapRef           = useRef<any>(null);
  const clusterGroupRef  = useRef<any>(null);
  // id → Leaflet marker — used for icon updates without rebuilding all markers
  const markerMapRef     = useRef<Map<string, any>>(new Map());
  const hasFitBoundsRef  = useRef(false);
  const prevSelectedRef  = useRef<string | null>(null);
  const prevHighlightRef = useRef<string | null>(null);
  // Stable ref so mouseover/mouseout closures always see the latest selectedPin
  const selectedPinRef   = useRef<Property | null>(null);

  const [mapTypeFilter, setMapTypeFilter] = useState<PropertyType | 'all'>('all');
  const [selectedPin,   setSelectedPin]   = useState<Property | null>(null);
  const [mapReady,      setMapReady]      = useState(false);
  // HoverCard state — pixel position relative to map container
  const [hoverState,    setHoverState]    = useState<HoverState | null>(null);

  // Keep ref in sync with state
  useEffect(() => { selectedPinRef.current = selectedPin; }, [selectedPin]);
  useEffect(() => { hasFitBoundsRef.current = false; }, [mapTypeFilter]);

  const filteredMapProperties = properties.filter(
    p => mapTypeFilter === 'all' || p.property_type === mapTypeFilter
  );
  const filteredIdsKey = filteredMapProperties.map(p => p.id).join(',');

  // ── Init map + load cluster plugin ─────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined' || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [KIGALI_CENTER.lat, KIGALI_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Dismiss hover card on pan / zoom so it doesn't float away from its marker
    map.on('movestart zoomstart', () => setHoverState(null));

    mapRef.current = map;

    loadMarkerCluster().then(() => {
      if (!mapRef.current) return;

      // Custom cluster icon: clean blue circle with count
      const cluster = L.markerClusterGroup({
        maxClusterRadius: 60,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (c: any) => {
          const n = c.getChildCount();
          return L.divIcon({
            className: '',
            html: `<div style="
              width:40px;height:40px;background:#2563eb;color:#fff;
              border:3px solid #fff;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:13px;font-weight:700;
              font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
              box-shadow:0 3px 14px rgba(37,99,235,0.45);
            ">${n}</div>`,
            iconSize: [40, 40], iconAnchor: [20, 20],
          });
        },
      });

      clusterGroupRef.current = cluster;
      map.addLayer(cluster);
      setMapReady(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      clusterGroupRef.current = null;
      markerMapRef.current.clear();
      hasFitBoundsRef.current = false;
      setMapReady(false);
    };
  }, []);

  // ── Build / rebuild markers when filter or property list changes ────────────
  useEffect(() => {
    const map     = mapRef.current;
    const cluster = clusterGroupRef.current;
    if (!map || !cluster || !mapReady) return;

    cluster.clearLayers();
    markerMapRef.current.clear();
    prevSelectedRef.current  = null;
    prevHighlightRef.current = null;
    const bounds: [number, number][] = [];

    filteredMapProperties.forEach(property => {
      const coords = getPropertyCoordinates(property);
      if (!coords) return;
      const icon = makePriceIcon(property, 'default');
      if (!icon) return;

      const marker = L.marker([coords.lat, coords.lng], { icon });

      // Click: select + flyTo
      marker.on('click', () => {
        setSelectedPin(property);
        setHoverState(null);
        map.flyTo([coords.lat, coords.lng], Math.max(map.getZoom(), 15), {
          animate: true, duration: 0.6,
        });
      });

      // Hover (desktop): show floating HoverCard at pixel coords of this marker
      marker.on('mouseover', () => {
        onPropertyHover?.(property.id);
        const pt = map.latLngToContainerPoint([coords.lat, coords.lng]);
        setHoverState({ property, x: pt.x, y: pt.y });
        if (selectedPinRef.current?.id !== property.id)
          marker.setIcon(makePriceIcon(property, 'hover'));
      });

      marker.on('mouseout', () => {
        onPropertyHover?.(null);
        setHoverState(null);
        marker.setIcon(makePriceIcon(
          property,
          selectedPinRef.current?.id === property.id ? 'selected' : 'default'
        ));
      });

      markerMapRef.current.set(property.id, marker);
      cluster.addLayer(marker);
      bounds.push([coords.lat, coords.lng]);
    });

    if (!hasFitBoundsRef.current && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        hasFitBoundsRef.current = true;
      } catch { /* stay at default Kigali view */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIdsKey, mapReady]);

  // ── Selected marker icon ────────────────────────────────────────────────────
  useEffect(() => {
    const prev = prevSelectedRef.current;
    const next = selectedPin?.id ?? null;
    if (prev === next) return;
    if (prev) {
      const p = properties.find(x => x.id === prev);
      const m = markerMapRef.current.get(prev);
      if (p && m) m.setIcon(makePriceIcon(p, 'default'));
    }
    if (next && selectedPin) {
      const m = markerMapRef.current.get(next);
      if (m) m.setIcon(makePriceIcon(selectedPin, 'selected'));
    }
    prevSelectedRef.current = next;
  }, [selectedPin, properties]);

  // ── Externally highlighted marker icon (list hover sync) ───────────────────
  useEffect(() => {
    const prev = prevHighlightRef.current;
    const next = highlightedPropertyId ?? null;
    if (prev === next) return;
    if (prev) {
      const p = properties.find(x => x.id === prev);
      const m = markerMapRef.current.get(prev);
      if (p && m) m.setIcon(makePriceIcon(p, selectedPin?.id === prev ? 'selected' : 'default'));
    }
    if (next && next !== selectedPin?.id) {
      const p = properties.find(x => x.id === next);
      const m = markerMapRef.current.get(next);
      if (p && m) m.setIcon(makePriceIcon(p, 'hover'));
    }
    prevHighlightRef.current = next;
  }, [highlightedPropertyId, selectedPin, properties]);

  const handleZoomIn   = () => mapRef.current?.zoomIn();
  const handleZoomOut  = () => mapRef.current?.zoomOut();
  const handleRecenter = () => mapRef.current?.setView([KIGALI_CENTER.lat, KIGALI_CENTER.lng], DEFAULT_ZOOM);

  return (
    <div className={`relative bg-gray-100 ${className}`} style={{ isolation: 'isolate', zIndex: 0 }}>
      {/* Map canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

      {/* ── HoverCard — desktop hover preview ────────────────────────────────
          Positioned in pixel space above the hovered marker.
          pointerEvents:none so it never blocks map interaction.         */}
      {hoverState && (
        <div
          style={{
            position: 'absolute',
            left: hoverState.x,
            top:  hoverState.y,
            // Centre horizontally; sit above the price pill (pill is ~26px tall + 7px pointer)
            transform: 'translate(-50%, calc(-100% - 40px))',
            zIndex: 900,
            pointerEvents: 'none',
          }}
          className="w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {hoverState.property.images?.[0] && (
            <div className="h-28 overflow-hidden">
              <img
                src={hoverState.property.images[0]}
                alt={hoverState.property.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-2.5">
            <p className="font-semibold text-gray-900 text-xs leading-tight line-clamp-2">
              {hoverState.property.title}
            </p>
            <p
              className="font-bold mt-1"
              style={{ color: TYPE_COLORS[hoverState.property.property_type] ?? '#2563eb', fontSize: 13 }}
            >
              {fmtPrice(hoverState.property.price, hoverState.property.currency)}
              {hoverState.property.listing_type === 'rent' && (
                <span className="text-gray-400 font-normal text-xs"> /mo</span>
              )}
            </p>
            <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPinIcon size={11} /> {hoverState.property.neighborhood}
            </p>
            {(hoverState.property.bedrooms ?? 0) > 0 && (
              <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                <BedIcon size={11} /> {hoverState.property.bedrooms} bed{hoverState.property.bedrooms !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Zoom Controls ────────────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
        <button onClick={handleZoomIn}  className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Zoom In">
          <ZoomInIcon size={18} className="text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Zoom Out">
          <ZoomOutIcon size={18} className="text-gray-700" />
        </button>
        <button onClick={handleRecenter} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200" title="Re-center">
          <CrosshairIcon size={18} className="text-gray-700" />
        </button>
      </div>

      {/* ── Property type filter chips ────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-1.5">
        <button
          onClick={() => setMapTypeFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all ${mapTypeFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
          All ({properties.length})
        </button>
        {(Object.keys(TYPE_COLORS) as PropertyType[]).map(type => {
          const count = properties.filter(p => p.property_type === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setMapTypeFilter(mapTypeFilter === type ? 'all' : type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all flex items-center gap-1.5 ${mapTypeFilter === type ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
              style={mapTypeFilter === type ? { backgroundColor: TYPE_COLORS[type] } : {}}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} />
              {TYPE_LABELS[type]} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Properties count badge ────────────────────────────────────────── */}
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

      {/* ── Selected Property Card ────────────────────────────────────────── */}
      {selectedPin && (
        <div className="absolute bottom-4 right-4 z-[1000] w-80 max-w-[calc(100vw-2rem)]">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
            <button
              onClick={() => setSelectedPin(null)}
              className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
              <XIcon size={14} />
            </button>
            <div
              className="relative h-36 cursor-pointer"
              onClick={() => { onSelectProperty(selectedPin); setSelectedPin(null); }}>
              <img src={selectedPin.images[0]} alt={selectedPin.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${selectedPin.listing_type === 'sale' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {selectedPin.listing_type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white capitalize"
                  style={{ backgroundColor: TYPE_COLORS[selectedPin.property_type] }}>
                  {selectedPin.property_type}
                </span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-white font-bold text-lg drop-shadow-lg">
                  {fmtPrice(selectedPin.price, selectedPin.currency)}
                </span>
                {selectedPin.listing_type === 'rent' && <span className="text-white/80 text-xs">/mo</span>}
              </div>
            </div>
            <div className="p-3">
              <h4
                className="font-semibold text-gray-900 text-sm line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => { onSelectProperty(selectedPin); setSelectedPin(null); }}>
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
                  className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                {onFavorite && (
                  <button
                    onClick={() => onFavorite(selectedPin.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isFavorite?.(selectedPin.id) ? 'bg-pink-50 text-pink-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
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

