/**
 * Rwanda Administrative Geography Data
 * =========================================
 * Structured data for Rwanda's provinces, districts, and sectors.
 * Used for location selection in property forms and filters.
 * 
 * Structure:
 *   - Province: top-level (Kigali City, Eastern, Western, Northern, Southern)
 *   - District: within each province
 *   - Sector: within each district (often displayed as neighborhoods in Kigali)
 * 
 * Note: UUIDs will be fetched from the database; this file provides the
 * hierarchy for building hierarchical UI selectors.
 */

export interface Province {
  id?: string;
  code: string;
  name: string;
}

export interface District {
  id?: string;
  province_id?: string;
  code: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface Sector {
  id?: string;
  district_id?: string;
  code: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

// Kigali City sectors (neighborhoods) for quick access
export const KIGALI_SECTORS = [
  { code: 'batsinda', name: 'Batsinda' },
  { code: 'birembo', name: 'Birembo' },
  { code: 'bumbogo', name: 'Bumbogo' },
  { code: 'gaculiro', name: 'Gaculiro' },
  { code: 'gahanga', name: 'Gahanga' },
  { code: 'gasabo', name: 'Gasabo' },
  { code: 'gikondo', name: 'Gikondo' },
  { code: 'gisozi', name: 'Gisozi' },
  { code: 'jabana', name: 'Jabana' },
  { code: 'kabeza', name: 'Kabeza' },
  { code: 'kacyiru', name: 'Kacyiru' },
  { code: 'kagugu', name: 'Kagugu' },
  { code: 'kanombe', name: 'Kanombe' },
  { code: 'kanyinya', name: 'Kanyinya' },
  { code: 'kibagabaga', name: 'Kibagabaga' },
  { code: 'kicukiro', name: 'Kicukiro' },
  { code: 'kimihurura', name: 'Kimihurura' },
  { code: 'kimironko', name: 'Kimironko' },
  { code: 'kinyinya', name: 'Kinyinya' },
  { code: 'kiyovu', name: 'Kiyovu' },
  { code: 'masoro', name: 'Masoro' },
  { code: 'ndera', name: 'Ndera' },
  { code: 'nduba', name: 'Nduba' },
  { code: 'nyamirambo', name: 'Nyamirambo' },
  { code: 'nyarutarama', name: 'Nyarutarama' },
  { code: 'nzove', name: 'Nzove' },
  { code: 'rebero', name: 'Rebero' },
  { code: 'remera', name: 'Remera' },
  { code: 'rugando', name: 'Rugando' },
  { code: 'rusororo', name: 'Rusororo' },
];

// For quick lookup by name (lowercase)
export const SECTOR_NAME_MAP: Record<string, string> = {
  'batsinda': 'Batsinda',
  'birembo': 'Birembo',
  'bumbogo': 'Bumbogo',
  'gaculiro': 'Gaculiro',
  'gahanga': 'Gahanga',
  'gasabo': 'Gasabo',
  'gikondo': 'Gikondo',
  'gisozi': 'Gisozi',
  'jabana': 'Jabana',
  'kabeza': 'Kabeza',
  'kacyiru': 'Kacyiru',
  'kagugu': 'Kagugu',
  'kanombe': 'Kanombe',
  'kanyinya': 'Kanyinya',
  'kibagabaga': 'Kibagabaga',
  'kicukiro': 'Kicukiro',
  'kimihurura': 'Kimihurura',
  'kimironko': 'Kimironko',
  'kinyinya': 'Kinyinya',
  'kiyovu': 'Kiyovu',
  'masoro': 'Masoro',
  'ndera': 'Ndera',
  'nduba': 'Nduba',
  'nyamirambo': 'Nyamirambo',
  'nyarutarama': 'Nyarutarama',
  'nzove': 'Nzove',
  'rebero': 'Rebero',
  'remera': 'Remera',
  'rugando': 'Rugando',
  'rusororo': 'Rusororo',
};
