import React from 'react';
import SeoLandingPage, { SeoSection, SeoFaq, RelatedPage } from '@/components/SeoLandingPage';

const sections: SeoSection[] = [
  {
    heading: 'Why Rent a House in Kacyiru?',
    content:
      'Kacyiru is one of Kigali\'s most desirable residential neighborhoods, situated in the heart of the city\'s government and diplomatic district. Home to ministries, foreign embassies, international NGOs, and top schools, Kacyiru attracts professionals, diplomats, and senior expats who value security, quality infrastructure, and proximity to the city\'s decision-making center. Rental properties here are premium but reflect a high standard of living.',
  },
  {
    heading: 'What Kacyiru Offers Residents',
    bullets: [
      'Walking distance to key government ministries and diplomatic missions',
      'Close to the Serena Hotel, top restaurants, and international health facilities',
      'Excellent road network — easy access to Kigali CBD in under 15 minutes',
      'Well-maintained streets, reliable electricity, and 24/7 security in most compounds',
      'Proximity to international schools and the Kigali Golf Course',
      'Strong expat and diplomatic community — great for professional networking',
      'Consistent rental demand keeps availability relatively stable year-round',
    ],
  },
  {
    heading: 'Rental Prices in Kacyiru (2025)',
    pricing: [
      { label: '3-Bedroom House (Unfurnished)', range: 'RWF 600,000 – 1,200,000/mo', note: 'Gated compound, city water & electricity' },
      { label: '3-Bedroom House (Furnished)', range: 'RWF 900,000 – 1,800,000/mo', note: 'With backup generator and security' },
      { label: '4-Bedroom Villa (Unfurnished)', range: 'RWF 1,200,000 – 2,000,000/mo', note: 'Large garden, servant quarters' },
      { label: '4-Bedroom Villa (Fully Furnished)', range: 'RWF 1,800,000 – 3,500,000/mo', note: 'Expat-grade finish, pool, generator' },
    ],
  },
  {
    heading: 'Types of Rentals Available in Kacyiru',
    bullets: [
      'Standalone gated houses with private gardens — popular with families',
      'Townhouses in secure compounds shared by 3–6 units — good value for professionals',
      'Furnished villas for diplomats and NGO country directors',
      'Apartments in modern blocks for young professionals or couples',
      'Serviced properties with caretakers, water tanks, and generator backup',
    ],
  },
  {
    heading: 'Why Use PropSpera to Find a Rental in Kacyiru',
    bullets: [
      'PropSpera lists verified properties in Kacyiru with real photos and verified pricing',
      'Filter specifically by Kacyiru neighborhood to see only relevant listings',
      'Contact agents directly — avoid unofficial brokers who operate in premium areas',
      'Compare multiple Kacyiru properties side by side',
      'Read agent reviews to find trusted professionals who know the Kacyiru market',
    ],
  },
  {
    heading: 'How to Rent a House in Kacyiru',
    steps: [
      'Search PropSpera: Use the neighborhood filter to select Kacyiru specifically',
      'Browse verified listings: Review full photo galleries and pricing details',
      'Contact the agent: Send a direct inquiry or WhatsApp for viewing arrangements',
      'Visit and assess: Check utilities, security setup, internet infrastructure, and condition',
      'Negotiate and sign: Discuss terms with the agent — most Kacyiru rentals are 12-month contracts',
    ],
  },
];

const faqs: SeoFaq[] = [
  {
    question: 'How much does it cost to rent a house in Kacyiru, Kigali?',
    answer:
      'Rental prices in Kacyiru are among the highest in Kigali. Unfurnished 3-bedroom houses start from around RWF 600,000/month. Furnished family homes range from RWF 900,000–1,800,000/month. Large diplomat-grade villas with full furnishing, generator, and pool can reach RWF 3,000,000–3,500,000/month.',
  },
  {
    question: 'Is Kacyiru a good area to live in Kigali?',
    answer:
      'Yes. Kacyiru is consistently rated one of Kigali\'s top neighborhoods. It offers excellent security, clean streets, reliable utilities, proximity to government and diplomatic institutions, and a high quality of life. It\'s the preferred neighborhood for senior expats, diplomats, UN staff, and government officials.',
  },
  {
    question: 'Are furnished houses available for rent in Kacyiru?',
    answer:
      'Yes. Kacyiru has a large supply of furnished rental properties specifically catering to expats and international tenants. Most come with beds, wardrobes, kitchen appliances, dining sets, and backup electricity. Some premium villas include pools, domestic staff quarters, and fully equipped offices.',
  },
  {
    question: 'How far is Kacyiru from Kigali CBD?',
    answer:
      'Kacyiru is approximately 3–5 kilometers from Kigali\'s central business district. Depending on traffic, the drive takes 10–20 minutes. It\'s one of the most central residential neighborhoods in Kigali.',
  },
  {
    question: 'What is the notice period for renting in Kacyiru?',
    answer:
      'Most rental agreements in Kacyiru require 1–3 months\' notice before vacating. Standard leases are 12 months with annual renewal. Some landlords offer shorter-term contracts at premium rates for diplomatic or NGO tenants.',
  },
];

const relatedPages: RelatedPage[] = [
  { label: 'Houses for Rent in Kigali', href: '/houses-for-rent-kigali' },
  { label: 'Houses for Rent in Kimihurura', href: '/houses-for-rent-kimihurura' },
  { label: 'Apartments for Rent in Kigali', href: '/apartments-for-rent-kigali' },
  { label: 'Real Estate Agents in Kigali', href: '/real-estate-agents-kigali' },
  { label: 'Houses for Sale in Kigali', href: '/houses-for-sale-kigali' },
];

const HousesForRentKacyiru: React.FC = () => (
  <SeoLandingPage
    metaTitle="Houses for Rent in Kacyiru, Kigali 2025 | Verified Listings – PropSpera"
    metaDescription="Find houses for rent in Kacyiru, Kigali. Browse verified 3 & 4-bedroom homes, furnished villas for expats and diplomats. Prices from RWF 600,000/month. Direct agent contact."
    canonicalUrl="https://propspera.rw/houses-for-rent-kacyiru"
    h1="Houses for Rent in Kacyiru, Kigali"
    intro="Browse verified houses for rent in Kacyiru — Kigali's premier diplomatic and government district. Find furnished villas, family homes, and gated compounds with transparent pricing and expert agents."
    sections={sections}
    faqs={faqs}
    relatedPages={relatedPages}
  />
);

export default HousesForRentKacyiru;
