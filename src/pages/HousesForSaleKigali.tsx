import React from 'react';
import SeoLandingPage, { SeoSection, SeoFaq, RelatedPage } from '@/components/SeoLandingPage';

const sections: SeoSection[] = [
  {
    heading: 'Buying a House in Kigali — The Market in 2025',
    content:
      'Kigali\'s real estate market continues to attract buyers from across Rwanda and internationally. With a stable economy, improving infrastructure, and strong capital appreciation, buying property in Kigali is widely seen as a sound long-term investment. Whether you\'re purchasing a family home or an investment property, PropSpera gives you access to hundreds of verified listings with transparent pricing.',
  },
  {
    heading: 'Top Neighborhoods to Buy a House in Kigali',
    grid: [
      { name: 'Nyarutarama', description: 'Kigali\'s most prestigious residential area. Luxury villas, embassy row, and top international schools nearby. High capital appreciation.' },
      { name: 'Kacyiru', description: 'Government and diplomatic hub. Prime real estate with high demand and excellent infrastructure. Strong investment value.' },
      { name: 'Kimihurura', description: 'Upscale with golf course proximity. Popular with investors and expats. Good mix of villas and modern townhouses.' },
      { name: 'Gacuriro', description: 'Well-planned estate housing at mid-range prices. Ideal for families. One of Kigali\'s most accessible investment areas.' },
      { name: 'Rebero', description: 'High-altitude neighborhood with panoramic city views. Growing development and good road access.' },
      { name: 'Kicukiro', description: 'Active buying market with diverse options from starter homes to modern developments. Popular with young families.' },
    ],
  },
  {
    heading: 'House Sale Prices in Kigali (2025)',
    pricing: [
      { label: 'Starter / Budget Home', range: 'RWF 25M – 60M', note: 'Gacuriro, Kicukiro, Kibagabaga' },
      { label: 'Mid-Range Family Home', range: 'RWF 60M – 150M', note: '3–4 bedroom, Remera, Kacyiru outskirts' },
      { label: 'Premium Villa', range: 'RWF 150M – 400M', note: 'Kacyiru, Kimihurura, Nyarutarama' },
      { label: 'Luxury / Gated Estate', range: 'RWF 400M+', note: 'Nyarutarama, Kibagabaga Highlands' },
    ],
  },
  {
    heading: 'Why Invest in Kigali Real Estate',
    bullets: [
      'Kigali consistently ranks as Africa\'s safest and cleanest city, driving strong housing demand',
      'Rwanda\'s GDP growth averaging 7–8% per year supports rising property values',
      'Increasing diaspora and expat population creates sustained rental demand',
      'Government incentives and a transparent land registry make ownership secure',
      'Kigali is becoming a regional hub for conferences, tech, and financial services',
      'Limited land supply in prime areas means capital appreciation over time',
      'Strong rental yields of 6–10% annually in prime neighborhoods',
    ],
  },
  {
    heading: 'How to Buy a House in Kigali with PropSpera',
    steps: [
      'Browse listings: Filter by neighborhood, bedrooms, price range, and property type',
      'Contact an agent: Reach out directly through PropSpera — no broker intermediaries',
      'Arrange a viewing: Visit properties shortlisted with agent assistance',
      'Due diligence: Verify land title, ownership, and RDB registration through LAIS',
      'Negotiate: Discuss price and terms directly with the seller\'s agent',
      'Transfer: Complete the notarized sale agreement and register at the Rwanda Land Authority',
    ],
  },
  {
    heading: 'What to Check Before Buying a House in Kigali',
    bullets: [
      'Verify the land title (Titre Foncier) is clean and has no liens or disputes',
      'Confirm the property is properly registered in LAIS (Land Administration Information System)',
      'Check building permits and that the structure complies with Kigali city planning rules',
      'Verify utility connections — water, electricity, and sewage',
      'Assess road access, especially during rainy season',
      'Review neighborhood development plans — will future construction affect your investment?',
    ],
  },
];

const faqs: SeoFaq[] = [
  {
    question: 'How much does a house cost in Kigali?',
    answer:
      'House prices in Kigali vary widely. Budget homes in Gacuriro and Kicukiro start from around RWF 25–40 million. Mid-range family homes in Remera or Kacyiru outskirts range from RWF 60–150 million. Premium villas in Kimihurura and Nyarutarama range from RWF 150–400 million. Luxury properties in prime locations can exceed RWF 500 million.',
  },
  {
    question: 'Can foreigners buy property in Kigali?',
    answer:
      'Foreign nationals can legally own property in Rwanda, including Kigali. Rwanda law allows foreigners to hold land leasehold titles for up to 99 years. The process involves registering with the Rwanda Land Authority and is generally straightforward. PropSpera agents can connect you with legal advisors familiar with foreign ownership.',
  },
  {
    question: 'What taxes and fees apply when buying property in Kigali?',
    answer:
      'Property purchases in Rwanda involve registration fees (typically 0.1% of the property value), notary fees, and capital gains tax if applicable. There is no VAT on residential property sales between private parties. Budget for approximately 2–4% of purchase price in transaction costs.',
  },
  {
    question: 'Is it better to rent or buy in Kigali?',
    answer:
      'For long-term residents and investors, buying typically offers better returns given Kigali\'s appreciation trajectory. Rental yields are strong at 6–10% in prime areas. For those uncertain about staying long-term, renting offers flexibility. A PropSpera agent can help you assess based on your specific situation.',
  },
  {
    question: 'Which is the best neighborhood to buy a house in Kigali?',
    answer:
      'Nyarutarama and Kacyiru offer the highest capital appreciation and strongest demand. For a balance of value and investment upside, Gacuriro and Kicukiro are excellent for family homes. For luxury and prestige, Kimihurura and Nyarutarama are the top choices.',
  },
];

const relatedPages: RelatedPage[] = [
  { label: 'Houses for Rent in Kigali', href: '/houses-for-rent-kigali' },
  { label: 'Land for Sale in Kigali', href: '/land-for-sale-kigali' },
  { label: 'Cheap Houses in Kigali', href: '/cheap-houses-kigali' },
  { label: 'Real Estate Agents in Kigali', href: '/real-estate-agents-kigali' },
  { label: 'Apartments for Rent in Kigali', href: '/apartments-for-rent-kigali' },
];

const HousesForSaleKigali: React.FC = () => (
  <SeoLandingPage
    metaTitle="Houses for Sale in Kigali 2025 | Buy Property in Rwanda – PropSpera"
    metaDescription="Browse houses for sale in Kigali. Find verified homes in Kacyiru, Kimihurura, Gacuriro, Nyarutarama. Prices from RWF 25M. Direct agent contact, no broker fees."
    canonicalUrl="https://propspera.rw/houses-for-sale-kigali"
    h1="Houses for Sale in Kigali – Buy Property in Rwanda"
    intro="Explore verified properties for sale across Kigali. From starter homes in Gacuriro to luxury villas in Nyarutarama — find your investment or family home with transparent pricing and expert agents."
    sections={sections}
    faqs={faqs}
    relatedPages={relatedPages}
  />
);

export default HousesForSaleKigali;
