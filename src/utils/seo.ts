// SEO helpers: build dynamic titles, meta tags, and URL query strings for search pages.

interface SEOFilters {
  listing_type?: string;
  property_type?: string;
  neighborhood?: string;
}

const PROPERTY_TYPE_MAP: Record<string, string> = {
  house: 'Houses',
  apartment: 'Apartments',
  villa: 'Villas',
  commercial: 'Commercial Properties',
  land: 'Land',
  all: 'Properties',
};

const LISTING_TYPE_MAP: Record<string, string> = {
  sale: 'for Sale',
  rent: 'for Rent',
  all: '',
};

export function buildSEOTitle(f: SEOFilters): string {
  const type = PROPERTY_TYPE_MAP[f.property_type || 'all'] ?? 'Properties';
  const listing = LISTING_TYPE_MAP[f.listing_type || 'all'] ?? '';
  const loc = f.neighborhood ? `in ${f.neighborhood}` : 'in Kigali';
  return `${[type, listing, loc].filter(Boolean).join(' ')} | PropSpera`;
}

export function buildSEOMeta(f: SEOFilters): string {
  const typeMap: Record<string, string> = {
    house: 'houses', apartment: 'apartments', villa: 'villas',
    commercial: 'commercial properties', land: 'land', all: 'properties',
  };
  const type = typeMap[f.property_type || 'all'] ?? 'properties';
  const listing = f.listing_type === 'rent' ? 'for rent' : f.listing_type === 'sale' ? 'for sale' : '';
  const loc = f.neighborhood ? `in ${f.neighborhood}, Kigali` : 'in Kigali';
  return `Browse verified ${[type, listing, loc].filter(Boolean).join(' ')}. Contact agents directly and find your next property on PropSpera — Rwanda's real estate marketplace.`;
}

export function applySEOMeta(title: string, description: string): void {
  document.title = title;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description;

  const setOG = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.content = content;
  };

  setOG('og:title', title);
  setOG('og:description', description);
  setOG('og:type', 'website');
  setOG('og:site_name', 'PropSpera');
}

export function applySEOUrl(f: SEOFilters): void {
  const params = new URLSearchParams();
  if (f.listing_type && f.listing_type !== 'all') params.set('type', f.listing_type);
  if (f.property_type && f.property_type !== 'all') params.set('propertyType', f.property_type);
  if (f.neighborhood) params.set('location', encodeURIComponent(f.neighborhood));
  const qs = params.toString();
  window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
}
