import React from 'react';
import SeoLandingPage, { SeoSection, SeoFaq, RelatedPage } from '@/components/SeoLandingPage';

const sections: SeoSection[] = [
  {
    heading: 'Finding a House for Rent in Kigali',
    content:
      'Kigali is one of Africa\'s fastest-growing cities, with a thriving rental market that caters to local families, returning diaspora, expats, and professionals. Whether you\'re looking for a modest 2-bedroom in Gacuriro or a spacious 4-bedroom villa in Kimihurura, PropSpera lists verified properties across all of Kigali\'s key neighborhoods — with real photos, transparent pricing, and direct agent contact.',
  },
  {
    heading: 'Popular Neighborhoods for Renting in Kigali',
    grid: [
      { name: 'Kacyiru', description: 'Home to government offices and embassies. Premium housing with reliable amenities. Ideal for expats and senior professionals.' },
      { name: 'Kimihurura', description: 'Upscale residential area near the Kigali Golf Course. Popular with diplomats, NGO workers, and international families.' },
      { name: 'Remera', description: 'Central and well-connected. Great balance of price and convenience, near the airport and city center.' },
      { name: 'Gacuriro', description: 'One of Kigali\'s fastest-growing suburbs. More affordable options with modern houses and good infrastructure.' },
      { name: 'Kibagabaga', description: 'Quiet residential area with a mix of standalone houses and small compounds. Popular with local families.' },
      { name: 'Kicukiro', description: 'Southeastern district with a range of options from budget to mid-range. Good road access and growing amenities.' },
    ],
  },
  {
    heading: 'Rental Price Ranges in Kigali (2025)',
    pricing: [
      { label: '2-Bedroom House', range: 'RWF 300,000 – 700,000/mo', note: 'Unfurnished, Gacuriro, Kibagabaga' },
      { label: '3-Bedroom House', range: 'RWF 600,000 – 1,500,000/mo', note: 'Furnished or unfurnished, Remera, Kicukiro' },
      { label: '4-Bedroom Villa', range: 'RWF 1,200,000 – 3,000,000/mo', note: 'Kacyiru, Kimihurura, Nyarutarama' },
      { label: 'Furnished House', range: 'RWF 800,000 – 2,500,000/mo', note: 'Expat-ready with generator & security' },
    ],
  },
  {
    heading: 'Why Use PropSpera to Find a Rental',
    bullets: [
      'All listings are verified — no fake photos or inflated prices',
      'Browse 500+ active rental listings updated daily',
      'Filter by bedrooms, price, neighborhood, furnished status, and more',
      'Contact agents directly — no middlemen, no extra fees',
      'View real photos, floor plans, and location maps',
      'Available in English and French for local and international users',
      'Save properties and compare side by side before deciding',
    ],
  },
  {
    heading: 'How to Rent a House in Kigali Through PropSpera',
    steps: [
      'Search: Enter your neighborhood, budget, and bedroom requirements in the search bar',
      'Browse: Review verified listings with full photo galleries and detailed descriptions',
      'Inquire: Send a direct message or WhatsApp the listing agent instantly',
      'Visit: Schedule a property viewing at a time that suits you',
      'Sign: Finalize your rental agreement with agent support',
    ],
  },
];

const faqs: SeoFaq[] = [
  {
    question: 'How much does it cost to rent a house in Kigali?',
    answer:
      'Rental prices in Kigali vary by location and size. A 2-bedroom house in Gacuriro starts from RWF 300,000/month, while a 3-bedroom in Remera typically ranges from RWF 600,000–1,000,000/month. Premium areas like Kacyiru and Kimihurura can range from RWF 1,200,000 to over RWF 3,000,000/month for furnished villas.',
  },
  {
    question: 'What documents do I need to rent a house in Kigali?',
    answer:
      'Most landlords require a valid national ID or passport, proof of income or employment letter, and 1–3 months\' security deposit. Some may ask for references from previous landlords or an employer guarantee letter.',
  },
  {
    question: 'Is it easy for foreigners to rent a house in Kigali?',
    answer:
      'Yes. Kigali has a large expat community and many properties are furnished and ready for international tenants. PropSpera lists expat-friendly properties with English-speaking agents who can assist with contracts and local requirements.',
  },
  {
    question: 'Which neighborhoods are best for renting a house in Kigali?',
    answer:
      'Kacyiru and Kimihurura are top choices for expats and diplomats. Remera is popular for its central location and transport links. Gacuriro and Kibagabaga offer more affordable family housing with good infrastructure.',
  },
  {
    question: 'Are utilities included in rental prices in Kigali?',
    answer:
      'Usually not. Most rental listings in Kigali quote the bare rent. Water, electricity (RECO/REG), and internet are typically paid separately by the tenant. Some furnished properties may include generator costs or internet in the monthly rate — always confirm with the agent.',
  },
  {
    question: 'How long does it take to find a rental house in Kigali?',
    answer:
      'With PropSpera, you can find and inquire about a property within minutes. Most agents respond within 24 hours, and viewings can typically be arranged within 2–5 days. The full process from search to move-in usually takes 1–3 weeks.',
  },
];

const relatedPages: RelatedPage[] = [
  { label: 'Apartments for Rent in Kigali', href: '/apartments-for-rent-kigali' },
  { label: 'Houses for Sale in Kigali', href: '/houses-for-sale-kigali' },
  { label: 'Houses for Rent in Kacyiru', href: '/houses-for-rent-kacyiru' },
  { label: 'Houses for Rent in Kimihurura', href: '/houses-for-rent-kimihurura' },
  { label: 'Affordable Houses in Kigali', href: '/cheap-houses-kigali' },
  { label: 'Real Estate Agents in Kigali', href: '/real-estate-agents-kigali' },
];

const HousesForRentKigali: React.FC = () => (
  <SeoLandingPage
    metaTitle="Houses for Rent in Kigali 2025 | Verified Listings – PropSpera"
    metaDescription="Browse verified houses for rent in Kigali. Find 2, 3 & 4-bedroom homes in Kacyiru, Remera, Gacuriro, Kimihurura. Transparent pricing, real photos. No broker fees."
    canonicalUrl="https://propspera.rw/houses-for-rent-kigali"
    h1="Houses for Rent in Kigali – Browse Verified Listings"
    intro="Find your perfect rental home in Kigali. Browse verified houses across all neighborhoods — from affordable options in Gacuriro to premium villas in Kimihurura — with real photos and direct agent contact."
    sections={sections}
    faqs={faqs}
    relatedPages={relatedPages}
  />
);

export default HousesForRentKigali;
