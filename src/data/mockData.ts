import { Conversation, Message, Property } from '@/types';
 
// Kigali neighborhoods
export const neighborhoods = [
  'Kacyiru', 'Kimihurura', 'Nyarutarama', 'Gisozi', 'Remera', 
  'Kibagabaga', 'Kicukiro', 'Kanombe', 'Gikondo', 'Nyamirambo',
  'Kimironko', 'Gasabo', 'Kabeza', 'Rugando', 'Kagugu',
  'Gaculiro', 'Gahanga', 'Kiyovu', 'Rebero', 'Rusororo'
];
 
// Neighborhood coordinates for map
export const neighborhoodCoordinates: Record<string, { lat: number; lng: number }> = {
  'Kacyiru': { lat: -1.9403, lng: 29.8580 },
  'Kimihurura': { lat: -1.9450, lng: 29.8700 },
  'Nyarutarama': { lat: -1.9350, lng: 29.8800 },
  'Gisozi': { lat: -1.9300, lng: 29.8500 },
  'Remera': { lat: -1.9550, lng: 29.8900 },
  'Kibagabaga': { lat: -1.9400, lng: 29.8900 },
  'Kicukiro': { lat: -1.9700, lng: 29.8700 },
  'Kanombe': { lat: -1.9650, lng: 29.9100 },
  'Gikondo': { lat: -1.9600, lng: 29.8600 },
  'Nyamirambo': { lat: -1.9650, lng: 29.8400 },
  'Kimironko': { lat: -1.9450, lng: 29.9000 },
  'Gasabo': { lat: -1.9200, lng: 29.8600 },
  'Kabeza': { lat: -1.9500, lng: 29.9050 },
  'Rugando': { lat: -1.9350, lng: 29.8650 },
  'Kagugu': { lat: -1.9250, lng: 29.8750 },
  'Gaculiro': { lat: -1.9206, lng: 30.0787 },
  'Gahanga': { lat: -1.8937, lng: 30.0400 },
  'Kiyovu': { lat: -1.9479, lng: 29.8764 },
  'Rebero': { lat: -2.0257, lng: 30.1312 },
  'Rusororo': { lat: -1.9614, lng: 30.2183 },
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
 
export const getPropertyCoordinates = (property: Property): { lat: number; lng: number } | null => {
  if (property.latitude && property.longitude) {
    return { lat: property.latitude, lng: property.longitude };
  }
  const neighborhood = property.neighborhood;
  if (!neighborhood || !neighborhoodCoordinates[neighborhood]) return null;
  const base = neighborhoodCoordinates[neighborhood];
  const idNum = parseInt(property.id.replace(/\D/g, ''), 10) || 0;
  const offsetLat = ((idNum * 7 + 3) % 20 - 10) * 0.0008;
  const offsetLng = ((idNum * 13 + 5) % 20 - 10) * 0.0008;
  return { lat: base.lat + offsetLat, lng: base.lng + offsetLng };
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

