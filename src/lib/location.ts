import { Property } from '@/types';

const KIGALI_PROVINCE_ID = 'kigali-city';

const LEGACY_NEIGHBORHOOD_TO_DISTRICT: Record<string, string> = {
  batsinda: 'gasabo',
  birembo: 'gasabo',
  bumbogo: 'gasabo',
  gaculiro: 'gasabo',
  gasabo: 'gasabo',
  gisozi: 'gasabo',
  jabana: 'gasabo',
  kacyiru: 'gasabo',
  kagugu: 'gasabo',
  kibagabaga: 'gasabo',
  kimihurura: 'gasabo',
  kimironko: 'gasabo',
  kinyinya: 'gasabo',
  masoro: 'gasabo',
  ndera: 'gasabo',
  nduba: 'gasabo',
  nyarutarama: 'gasabo',
  nzove: 'gasabo',
  remera: 'gasabo',
  rugando: 'gasabo',
  rusororo: 'gasabo',
  gahanga: 'kicukiro',
  gikondo: 'kicukiro',
  kabeza: 'kicukiro',
  kanombe: 'kicukiro',
  kicukiro: 'kicukiro',
  rebero: 'kicukiro',
  kanyinya: 'nyarugenge',
  kiyovu: 'nyarugenge',
  nyamirambo: 'nyarugenge',
};

const toSlug = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function deriveStructuredLocationFromNeighborhood(neighborhood?: string | null): {
  province_id: string | null;
  district_id: string | null;
  sector_id: string | null;
  location_label: string | null;
} {
  const normalized = neighborhood?.trim();
  if (!normalized) {
    return {
      province_id: null,
      district_id: null,
      sector_id: null,
      location_label: null,
    };
  }

  const key = normalized.toLowerCase();
  const district = LEGACY_NEIGHBORHOOD_TO_DISTRICT[key] || null;

  return {
    province_id: KIGALI_PROVINCE_ID,
    district_id: district,
    sector_id: toSlug(normalized),
    location_label: normalized,
  };
}

export function getPropertyLocationLabel(property: Partial<Property>): string {
  return property.location_label || property.neighborhood || property.location || 'Kigali';
}