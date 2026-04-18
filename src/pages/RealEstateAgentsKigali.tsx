import React from 'react';
import SeoLandingPage, { SeoSection, SeoFaq, RelatedPage } from '@/components/SeoLandingPage';

const sections: SeoSection[] = [
  {
    heading: 'Find a Verified Real Estate Agent in Kigali',
    content:
      'Working with the right real estate agent can save you time, money, and headaches. PropSpera\'s agent network includes licensed, verified professionals who specialize in residential sales, rentals, commercial properties, and land across Kigali. Every PropSpera agent is background-checked, has a verified identity, and is reviewed by real clients.',
  },
  {
    heading: 'Why Use a Verified Agent in Kigali',
    bullets: [
      'Avoid scams — unverified brokers sometimes list fake properties or collect fees for non-existent rentals',
      'Agents have local market knowledge and can advise on fair pricing and neighborhood trends',
      'A good agent handles negotiations, paperwork, and legal checks on your behalf',
      'PropSpera agents have verified contact details — you\'re always talking to a real professional',
      'Client reviews on PropSpera let you see how each agent has performed for past clients',
      'Agents are available in English and French to serve both local and international clients',
    ],
  },
  {
    heading: 'How PropSpera Vets Its Agents',
    steps: [
      'Identity verification: Every agent submits a national ID or passport for identity confirmation',
      'License check: Agents provide RDB registration or business license where applicable',
      'Background review: PropSpera reviews agent history and any reported complaints',
      'Profile completion: Agents must complete a full profile with specializations, experience, and contact details',
      'Client reviews: Ongoing ratings and reviews from verified clients keep standards high',
    ],
  },
  {
    heading: 'Agent Specializations Available on PropSpera',
    grid: [
      { name: 'Residential Sales', description: 'Specialists in buying and selling houses, villas, and townhouses across Kigali and Rwanda.' },
      { name: 'Rental Properties', description: 'Experts in finding rental homes, apartments, and commercial spaces for short and long-term tenants.' },
      { name: 'Land & Plots', description: 'Agents with deep knowledge of land transactions, title verification, and development potential.' },
      { name: 'Commercial Real Estate', description: 'Office spaces, retail units, warehouses, and mixed-use developments across Kigali.' },
      { name: 'Luxury & Expat Housing', description: 'Specialists catering to diplomats, NGO workers, and international businesses seeking premium properties.' },
      { name: 'Investment Properties', description: 'Advisors helping buyers identify high-yield rental investments and capital appreciation opportunities.' },
    ],
  },
  {
    heading: 'How to Find the Right Agent on PropSpera',
    steps: [
      'Browse agents: Visit the Agents section and filter by specialization, experience, and rating',
      'Review profiles: Read verified client reviews and check the agent\'s listing portfolio',
      'Contact directly: Send a message or WhatsApp the agent through PropSpera — no intermediary',
      'Discuss your needs: Tell the agent your budget, neighborhood preference, and timeline',
      'Work together: The agent will curate matching listings and arrange viewings',
    ],
  },
  {
    heading: 'What to Expect from a PropSpera Agent',
    bullets: [
      'Fast response — most PropSpera agents reply within 24 hours',
      'Honest pricing advice based on current market data',
      'Assistance with property viewings and scheduling',
      'Support with lease or sale contract review and negotiations',
      'Guidance on title verification and legal due diligence',
      'After-transaction support — many agents maintain long-term client relationships',
    ],
  },
];

const faqs: SeoFaq[] = [
  {
    question: 'How do I find a reliable real estate agent in Kigali?',
    answer:
      'Use PropSpera\'s agent directory to browse verified agents filtered by specialization, experience, and location. Each agent has a detailed profile with client reviews, listed properties, and contact information. This allows you to assess agents before engaging them.',
  },
  {
    question: 'Do I have to pay an agent to find a house in Kigali?',
    answer:
      'Agent commission structures vary. For rentals, agents in Kigali typically charge one month\'s rent as a one-time finder\'s fee (usually paid by the tenant or landlord). For property sales, agents typically earn 3–5% commission from the seller. PropSpera does not add its own platform fees — you pay the agent directly.',
  },
  {
    question: 'Can PropSpera agents help foreigners find property in Kigali?',
    answer:
      'Yes. Many PropSpera agents specialize in serving expats, NGO workers, and diaspora clients. They speak English and French, understand international client needs, and can guide you through Rwanda\'s property regulations remotely or in person.',
  },
  {
    question: 'What qualifications should a real estate agent in Rwanda have?',
    answer:
      'Rwanda does not yet have a mandatory licensing system for real estate agents, but PropSpera requires all agents to complete identity verification and submit business documentation. We encourage agents to be registered with RDB (Rwanda Development Board) and maintain professional conduct standards.',
  },
  {
    question: 'How many verified agents are available on PropSpera?',
    answer:
      'PropSpera has a growing network of over 50 verified agents based in Kigali and across Rwanda. The network spans all property types — residential, commercial, land, and rentals. New agents join regularly as the platform grows.',
  },
  {
    question: 'Can I leave a review for my PropSpera agent?',
    answer:
      'Yes. After a transaction, you can leave a star rating and written review on the agent\'s PropSpera profile. Reviews are visible to all users and help maintain accountability and quality across the platform.',
  },
];

const relatedPages: RelatedPage[] = [
  { label: 'Houses for Rent in Kigali', href: '/houses-for-rent-kigali' },
  { label: 'Houses for Sale in Kigali', href: '/houses-for-sale-kigali' },
  { label: 'Land for Sale in Kigali', href: '/land-for-sale-kigali' },
  { label: 'Apartments for Rent in Kigali', href: '/apartments-for-rent-kigali' },
  { label: 'Cheap Houses in Kigali', href: '/cheap-houses-kigali' },
];

const RealEstateAgentsKigali: React.FC = () => (
  <SeoLandingPage
    metaTitle="Verified Real Estate Agents in Kigali 2025 | Find & Contact – PropSpera"
    metaDescription="Find verified real estate agents in Kigali. Browse agent profiles, read client reviews, and contact specialists in residential sales, rentals, land, and commercial properties."
    canonicalUrl="https://propspera.rw/real-estate-agents-kigali"
    h1="Verified Real Estate Agents in Kigali – Find Your Expert"
    intro="Connect with Kigali's best verified real estate agents. All PropSpera agents are identity-checked, reviewed by real clients, and ready to help you buy, sell, or rent with confidence."
    sections={sections}
    faqs={faqs}
    relatedPages={relatedPages}
  />
);

export default RealEstateAgentsKigali;
