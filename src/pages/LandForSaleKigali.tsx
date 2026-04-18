import React from 'react';
import SeoLandingPage, { SeoSection, SeoFaq, RelatedPage } from '@/components/SeoLandingPage';

const sections: SeoSection[] = [
  {
    heading: 'Land for Sale in Kigali — A Growing Investment',
    content:
      'Land remains one of the most sought-after assets in Kigali, driven by the city\'s expansion, infrastructure investment, and growing population. Whether you\'re looking to build a family home, develop a rental property, or secure a long-term investment, buying land in Kigali offers strong returns. PropSpera lists verified plots across Kigali with clear title documentation, accurate measurements, and direct agent contact.',
  },
  {
    heading: 'Where to Buy Land in Kigali',
    grid: [
      { name: 'Gacuriro', description: 'Established development zone with strong demand. Infrastructure is in place — roads, water, electricity. Popular for residential plots.' },
      { name: 'Bumbogo', description: 'Rapidly developing area north of Kigali. Lower prices with high growth potential. Popular with investors buying early.' },
      { name: 'Rebero', description: 'Elevated location with great city views. Serviced plots in a high-demand residential zone. Good for villa construction.' },
      { name: 'Rusororo', description: 'Northern outskirts with large plots at low prices. Ideal for agricultural or commercial development, or long-term land banking.' },
      { name: 'Kicukiro', description: 'Active land market in southeastern Kigali. Various plot sizes available with access to major roads.' },
      { name: 'Kacyiru', description: 'Limited supply but very high value. Small plots near the government district ideal for commercial or high-density development.' },
    ],
  },
  {
    heading: 'Land Prices in Kigali (2025 — Per Plot)',
    pricing: [
      { label: 'Budget Plot (300–500 sqm)', range: 'RWF 3M – 15M', note: 'Bumbogo, Rusororo, outer suburbs' },
      { label: 'Mid-Range Plot (400–800 sqm)', range: 'RWF 15M – 50M', note: 'Gacuriro, Kicukiro, Kibagabaga' },
      { label: 'Premium Residential Plot', range: 'RWF 50M – 150M', note: 'Rebero, Kacyiru outskirts, Remera' },
      { label: 'Prime Location Plot', range: 'RWF 150M+', note: 'Kacyiru, Nyarutarama, Kimihurura' },
    ],
  },
  {
    heading: 'Why Buy Land in Kigali?',
    bullets: [
      'Kigali\'s population is growing at over 4% per year, driving consistent land demand',
      'Infrastructure expansion — new roads, public transport, and utilities push up surrounding land values',
      'Rwanda has a secure land registry (LAIS) — land ownership is transparent and enforceable',
      'Build-to-rent is increasingly popular — buy land, construct rental units, and earn steady income',
      'Foreign nationals can hold long-term land leases in Rwanda',
      'Strong capital appreciation — land in outer areas purchased in 2015–2018 has tripled in value',
      'Low entry cost in developing areas allows investors to start small',
    ],
  },
  {
    heading: 'What to Check When Buying Land in Kigali',
    bullets: [
      'Title (Titre Foncier): Confirm the land has a clean, registered title in LAIS — no disputes or encumbrances',
      'Zoning: Check the Kigali Master Plan to confirm your intended use is permitted (residential, commercial, mixed)',
      'Services: Verify proximity to water mains, electricity grid, and paved road access',
      'Topography: Assess slope and drainage — some Kigali hillsides are classified as non-buildable',
      'Survey: Always get a formal surveyor\'s report confirming exact boundaries and area',
      'Seller identity: Confirm the seller is the registered owner, not a representative with a questionable mandate',
    ],
  },
  {
    heading: 'How to Buy Land in Kigali Through PropSpera',
    steps: [
      'Browse land listings: Filter by neighborhood, plot size, and price range on PropSpera',
      'Contact the agent: Get full title details, location pin, and visit the site',
      'Verify the title: Request a copy of the Titre Foncier and confirm it in LAIS',
      'Engage a notary: All land sales in Rwanda must be notarized by an authorized notary',
      'Pay and transfer: Complete the notarized deed and register the title transfer at the Rwanda Land Authority',
    ],
  },
];

const faqs: SeoFaq[] = [
  {
    question: 'How much does land cost in Kigali?',
    answer:
      'Land prices in Kigali depend heavily on location. Budget plots in outer areas like Bumbogo and Rusororo start from RWF 3–10 million for 300–500 sqm. Well-serviced plots in Gacuriro and Kicukiro range from RWF 15–50 million. Premium land in Kacyiru and Nyarutarama can exceed RWF 150 million per plot.',
  },
  {
    question: 'Can a foreigner buy land in Kigali?',
    answer:
      'Foreign nationals can hold land in Rwanda through a long-term leasehold (up to 99 years). The purchase process involves a notarized sale agreement and registration at the Rwanda Land Authority. PropSpera agents can connect you with attorneys and notaries experienced in transactions with non-residents.',
  },
  {
    question: 'What is the process for land title transfer in Rwanda?',
    answer:
      'The transfer process involves: agreeing a price with the seller, engaging a certified Rwandan notary to prepare the deed of sale, paying registration fees, and submitting the documents to the Rwanda Land Authority (RLA) for title transfer registration. The process typically takes 2–6 weeks.',
  },
  {
    question: 'Is it a good investment to buy land in Kigali?',
    answer:
      'Land in Kigali has historically been a strong investment, particularly in developing areas where infrastructure is catching up. Outer zones like Bumbogo and Gacuriro have seen significant appreciation. As long as the title is clean and zoning is favorable, land in Kigali offers solid long-term returns.',
  },
  {
    question: 'How do I verify a land title before buying in Kigali?',
    answer:
      'You can verify land title status through the Rwanda Land Administration Information System (LAIS) or by visiting the Rwanda Land Authority offices. Always request a certified copy of the Titre Foncier from the seller and confirm it matches LAIS records. Your notary will typically do this as part of the transaction process.',
  },
];

const relatedPages: RelatedPage[] = [
  { label: 'Houses for Sale in Kigali', href: '/houses-for-sale-kigali' },
  { label: 'Cheap Houses in Kigali', href: '/cheap-houses-kigali' },
  { label: 'Houses for Rent in Kigali', href: '/houses-for-rent-kigali' },
  { label: 'Real Estate Agents in Kigali', href: '/real-estate-agents-kigali' },
];

const LandForSaleKigali: React.FC = () => (
  <SeoLandingPage
    metaTitle="Land for Sale in Kigali 2025 | Investment Plots & Residential Land – PropSpera"
    metaDescription="Browse land for sale in Kigali. Verified residential and investment plots in Gacuriro, Kacyiru, Rebero, Bumbogo. Prices from RWF 3M. Secure title verification."
    canonicalUrl="https://propspera.rw/land-for-sale-kigali"
    h1="Land for Sale in Kigali – Investment Plots & Development Sites"
    intro="Find verified land for sale across Kigali. From affordable development plots in Gacuriro and Bumbogo to premium sites in Kacyiru and Rebero — invest in Rwanda's fastest-growing city."
    sections={sections}
    faqs={faqs}
    relatedPages={relatedPages}
  />
);

export default LandForSaleKigali;
