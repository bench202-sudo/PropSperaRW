import { Conversation, Message, Property } from '@/types';
 
// Kigali neighborhoods
export const neighborhoods = [
  'Kacyiru', 'Kimihurura', 'Nyarutarama', 'Gisozi', 'Remera', 
  'Kibagabaga', 'Kicukiro', 'Kanombe', 'Gikondo', 'Nyamirambo',
  'Kimironko', 'Gasabo', 'Kabeza', 'Rugando', 'Kagugu',
  'Gaculiro', 'Gahanga', 'Kiyovu', 'Rebero', 'Rusororo'
];
 
// Neighborhood coordinates for map
// All coordinates verified against Kigali geography (lng must be ~30.06–30.18)
export const neighborhoodCoordinates: Record<string, { lat: number; lng: number }> = {
  'Kacyiru':    { lat: -1.9378, lng: 30.0946 }, // UN/Embassy area, northern Gasabo
  'Kimihurura': { lat: -1.9524, lng: 30.0831 }, // Diplomatic district
  'Nyarutarama':{ lat: -1.9289, lng: 30.1033 }, // Golf course area, northern Gasabo
  'Gisozi':     { lat: -1.9199, lng: 30.0612 }, // North of centre, hillside
  'Remera':     { lat: -1.9621, lng: 30.1145 }, // Eastern residential/commercial
  'Kibagabaga': { lat: -1.9358, lng: 30.1111 }, // North-east residential
  'Kicukiro':   { lat: -1.9939, lng: 30.0618 }, // Southern district centre
  'Kanombe':    { lat: -1.9628, lng: 30.1499 }, // East, near airport
  'Gikondo':    { lat: -1.9831, lng: 30.0617 }, // South-central, industrial
  'Nyamirambo': { lat: -1.9759, lng: 30.0440 }, // South-west, market area
  'Kimironko':  { lat: -1.9383, lng: 30.1225 }, // North-east residential
  'Gasabo':     { lat: -1.9153, lng: 30.0830 }, // Northern district
  'Kabeza':     { lat: -1.9503, lng: 30.1301 }, // Eastern Kigali
  'Rugando':    { lat: -1.9347, lng: 30.0715 }, // North of centre
  'Kagugu':     { lat: -1.9096, lng: 30.0957 }, // Northern Gasabo
  'Gaculiro':   { lat: -1.9206, lng: 30.0787 }, // North-central
  'Gahanga':    { lat: -1.9985, lng: 30.0747 }, // South Kicukiro
  'Kiyovu':     { lat: -1.9479, lng: 30.0544 }, // City centre, upscale
  'Rebero':     { lat: -1.9857, lng: 30.1012 }, // South-east hillside
  'Rusororo':   { lat: -1.9014, lng: 30.1783 }, // Far north-east Gasabo
};
 
export const amenities = [
  'Parking', 'Garden', 'Security', 'Swimming Pool', 'Gym', 
  'Balcony', 'Generator', 'Water Tank', 'CCTV', 'Furnished',
  'Air Conditioning', 'Internet', 'Servant Quarters', 'Office Space', 'Gate'
];
 
// Empty arrays — all data now comes from the database
export const mockUsers: never[] = [];
export const mockAgents: never[] = [];
export const mockProperties: never[] = [];
export const mockMessages: Message[] = [];
export const mockConversations: Conversation[] = [];
 
// ─── Utility helpers ──────────────────────────────────────────────────────────
 
export const formatPrice = (price: number, currency: string = 'RWF'): string => {
  if (!price) return 'Price on request';
  return new Intl.NumberFormat('en-RW', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' ' + currency;
};
 
export const getPropertyCoordinates = (property: Property): { lat: number; lng: number } => {
  // 1. Precise coordinates take priority — parse as number to handle string values from DB
  const lat = typeof property.latitude === 'string'
    ? parseFloat(property.latitude as unknown as string)
    : property.latitude;
  const lng = typeof property.longitude === 'string'
    ? parseFloat(property.longitude as unknown as string)
    : property.longitude;

  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    return { lat, lng };
  }

  // Stable deterministic hash from property id (works reliably with UUIDs)
  const idHash = property.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // 2. Neighborhood-level fallback — case-insensitive lookup
  const neighborhood = property.neighborhood;
  if (neighborhood) {
    const coordsKey = Object.keys(neighborhoodCoordinates).find(
      k => k.toLowerCase() === neighborhood.toLowerCase()
    );
    if (coordsKey) {
      const base = neighborhoodCoordinates[coordsKey];
      // Deterministic offset per property so markers don't stack on the same spot
      const offsetLat = ((idHash * 7 + 3) % 20 - 10) * 0.0008;
      const offsetLng = ((idHash * 13 + 5) % 20 - 10) * 0.0008;
      return { lat: base.lat + offsetLat, lng: base.lng + offsetLng };
    }
    console.warn(`[PropertyMap] Unknown neighborhood: "${neighborhood}" — property ${property.id}`);
  } else {
    console.warn(`[PropertyMap] No location data for property ${property.id} — "${property.title}"`);
  }

  // 3. Last resort: Kigali center with deterministic offset so the marker still appears
  const fallbackLat = ((idHash * 11 + 7) % 30 - 15) * 0.002;
  const fallbackLng = ((idHash * 17 + 3) % 30 - 15) * 0.002;
  return { lat: -1.9450 + fallbackLat, lng: 29.8739 + fallbackLng };
};
 
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-RW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
 
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
 
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString('en-RW', { month: 'short', year: 'numeric' });
};

