import React from 'react';
import SeoLandingPage, { SeoSection, SeoFaq, RelatedPage } from '@/components/SeoLandingPage';

const sections: SeoSection[] = [
  {
    heading: 'Apartments for Rent in Kigali — What to Expect',
    content:
      'Kigali\'s apartment market has grown rapidly, with modern blocks offering furnished and unfurnished units across the city. From studio apartments in the CBD to spacious 3-bedroom flats in Kiyovu and Kacyiru, there are options for every budget. PropSpera lists only verified apartments with real photos, accurate pricing, and responsive agents.',
  },
  {
    heading: 'Best Areas for Apartments in Kigali',
    grid: [
      { name: 'Kiyovu / CBD', description: 'Central location ideal for professionals. Walking distance to offices, restaurants, and nightlife. Mix of furnished studios and 2-bedroom flats.' },
      { name: 'Kacyiru', description: 'Quiet, well-serviced neighborhood. Preferred by diplomats and NGO workers. Higher-end furnished apartments with 24/7 security.' },
      { name: 'Kimihurura', description: 'Upscale area near the Golf Course. Luxury furnished apartments, popular with expats and international tenants.' },
      { name: 'Remera', description: 'Great value and central access. Many modern apartment buildings catering to young professionals and families.' },
      { name: 'Nyarutarama', description: 'Exclusive residential zone with gated apartment complexes. High-end finishes, pools, and gym facilities.' },
      { name: 'Gacuriro', description: 'Affordable newer developments. Good for those seeking modern apartments at budget-friendly prices.' },
    ],
  },
  {
    heading: 'Apartment Rental Prices in Kigali (2025)',
    pricing: [
      { label: 'Studio / 1-Bedroom', range: 'RWF 250,000 – 600,000/mo', note: 'Unfurnished, Remera, Gacuriro, CBD' },
      { label: '2-Bedroom Apartment', range: 'RWF 500,000 – 1,200,000/mo', note: 'Furnished or unfurnished, city-wide' },
      { label: '3-Bedroom Apartment', range: 'RWF 900,000 – 2,000,000/mo', note: 'Kacyiru, Kimihurura, Nyarutarama' },
      { label: 'Furnished Expat Apartment', range: 'RWF 800,000 – 2,500,000/mo', note: 'With generator, security, internet' },
    ],
  },
  {
    heading: 'Furnished vs Unfurnished Apartments in Kigali',
    bullets: [
      'Furnished apartments include bed frames, wardrobes, kitchen appliances, and sometimes internet and DSTV — ideal for short-term stays or new arrivals',
      'Unfurnished apartments are cheaper and better for long-term residents who own furniture',
      'Many expat-ready apartments in Kacyiru and Kimihurura include generator backup and 24/7 security',
      'Always confirm what is included in the monthly rent before signing — water, electricity, and internet are often separate',
      'PropSpera listings clearly indicate furnished/unfurnished status with photo evidence',
    ],
  },
  {
    heading: 'Why Choose PropSpera for Apartment Rentals',
    bullets: [
      'All listings verified — no ghost listings or misleading photos',
      'Filter by furnished status, number of bedrooms, price, and neighborhood',
      'Direct agent contact — send an inquiry or WhatsApp in one click',
      'Available in English and French for local and international tenants',
      'Save and compare multiple apartments simultaneously',
      'Trusted by thousands of renters and hundreds of agents across Kigali',
    ],
  },
  {
    heading: 'How to Find and Rent an Apartment in Kigali',
    steps: [
      'Browse: Use filters to narrow down apartments by budget, size, and neighborhood',
      'View: Check full photo galleries, floor plans, and location maps',
      'Inquire: Contact the agent directly via the platform — no middleman required',
      'Visit: Arrange a viewing at your convenience',
      'Sign: Review your lease with agent support and move in',
    ],
  },
];

const faqs: SeoFaq[] = [
  {
    question: 'How much does it cost to rent an apartment in Kigali?',
    answer:
      'Studio and 1-bedroom apartments in Kigali start from around RWF 250,000/month in areas like Gacuriro and Remera. Furnished 2-bedroom apartments in central areas range from RWF 600,000–1,200,000/month. Luxury furnished apartments in Kacyiru or Kimihurura can reach RWF 2,000,000–2,500,000/month.',
  },
  {
    question: 'Are there furnished apartments available for rent in Kigali?',
    answer:
      'Yes. Many apartments in Kigali are available fully furnished, especially in expat-friendly areas like Kacyiru, Kimihurura, and Nyarutarama. Furnished units typically include beds, wardrobes, kitchen appliances, and sometimes internet and backup power. PropSpera allows you to filter listings by furnished status.',
  },
  {
    question: 'Can foreigners rent apartments in Kigali easily?',
    answer:
      'Yes, Rwanda is very welcoming to foreign nationals. Most landlords and agents speak English and are experienced working with expats, NGO workers, and diplomats. PropSpera connects you directly with English and French-speaking agents who can guide you through the entire process.',
  },
  {
    question: 'What is the notice period for renting an apartment in Kigali?',
    answer:
      'Lease terms vary but most apartments in Kigali offer 6-month or 12-month contracts. Notice periods are typically 1–3 months before the end of the lease. Always read your contract carefully — a PropSpera agent can help clarify local norms.',
  },
  {
    question: 'Which part of Kigali is best for expats renting apartments?',
    answer:
      'Kacyiru and Kimihurura are the most popular among expatriates due to proximity to embassies, international schools, and upscale amenities. Nyarutarama is also excellent for families. For a more local urban experience at lower cost, Remera and Kiyovu are great alternatives.',
  },
];

const relatedPages: RelatedPage[] = [
  { label: 'Houses for Rent in Kigali', href: '/houses-for-rent-kigali' },
  { label: 'Cheap Houses in Kigali', href: '/cheap-houses-kigali' },
  { label: 'Houses for Rent in Kacyiru', href: '/houses-for-rent-kacyiru' },
  { label: 'Houses for Rent in Kimihurura', href: '/houses-for-rent-kimihurura' },
  { label: 'Houses for Sale in Kigali', href: '/houses-for-sale-kigali' },
  { label: 'Real Estate Agents in Kigali', href: '/real-estate-agents-kigali' },
];

const ApartmentsForRentKigali: React.FC = () => (
  <SeoLandingPage
    metaTitle="Apartments for Rent in Kigali 2025 | Furnished & Unfurnished – PropSpera"
    metaDescription="Find apartments for rent in Kigali. Browse furnished and unfurnished studios, 1, 2 & 3-bedroom flats in Kacyiru, Kimihurura, Remera. Verified listings, transparent pricing."
    canonicalUrl="https://propspera.rw/apartments-for-rent-kigali"
    h1="Apartments for Rent in Kigali – Furnished & Unfurnished"
    intro="Discover verified apartment rentals across Kigali. From affordable studios in Remera to luxury furnished flats in Kimihurura — find your ideal apartment with real photos and zero broker fees."
    sections={sections}
    faqs={faqs}
    relatedPages={relatedPages}
  />
);

export default ApartmentsForRentKigali;
