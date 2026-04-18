import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export interface PricingItem {
  label: string;
  range: string;
  note?: string;
}

export interface GridItem {
  name: string;
  description: string;
}

export interface SeoSection {
  heading: string;
  content?: string;
  bullets?: string[];
  steps?: string[];
  pricing?: PricingItem[];
  grid?: GridItem[];
}

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface RelatedPage {
  label: string;
  href: string;
}

interface SeoLandingPageProps {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  h1: string;
  intro: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  relatedPages?: RelatedPage[];
}

const SeoLandingPage: React.FC<SeoLandingPageProps> = ({
  metaTitle,
  metaDescription,
  canonicalUrl,
  h1,
  intro,
  sections,
  faqs,
  relatedPages = [],
}) => {
  useEffect(() => {
    document.title = metaTitle;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      (el as HTMLLinkElement).href = href;
    };

    const setOg = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', metaDescription);
    setLink('canonical', canonicalUrl);
    setOg('og:title', metaTitle);
    setOg('og:description', metaDescription);
    setOg('og:url', canonicalUrl);
    setOg('og:type', 'website');
    setOg('og:site_name', 'PropSpera');

    // FAQ structured data (JSON-LD) for rich snippets
    const existingScript = document.querySelector<HTMLScriptElement>('#faq-schema');
    if (existingScript) existingScript.remove();
    if (faqs.length > 0) {
      const script = document.createElement('script');
      script.id = 'faq-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
      document.head.appendChild(script);
    }

    return () => {
      document.title = 'PropSpera – Rwanda Real Estate';
      document.querySelector('#faq-schema')?.remove();
    };
  }, [metaTitle, metaDescription, canonicalUrl, faqs]);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">PropSpera</span>
            <span className="text-xs text-gray-400 hidden sm:inline ml-1">Rwanda's #1 Real Estate Platform</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/?view=search" className="text-sm text-gray-600 hover:text-blue-600 hidden sm:block font-medium">
              Browse Listings
            </Link>
            <Link
              to="/?view=agents"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Find an Agent
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">{h1}</h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">{intro}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/?view=search"
              className="px-8 py-3.5 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg text-center"
            >
              Browse Listings
            </Link>
            <Link
              to="/?view=agents"
              className="px-8 py-3.5 bg-blue-500 border border-blue-400 text-white rounded-xl font-bold hover:bg-blue-400 transition-colors text-center"
            >
              Contact an Agent
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-14">
        {sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {section.heading}
            </h2>

            {section.content && (
              <p className="text-gray-600 leading-relaxed text-base">{section.content}</p>
            )}

            {section.bullets && (
              <ul className="space-y-3 mt-3">
                {section.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-gray-600">{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.steps && (
              <ol className="space-y-4 mt-3">
                {section.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {j + 1}
                    </span>
                    <span className="text-gray-600 pt-1 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {section.pricing && (
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {section.pricing.map((p, j) => (
                  <div key={j} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors">
                    <p className="font-semibold text-gray-800">{p.label}</p>
                    <p className="text-blue-600 font-bold text-lg mt-1">{p.range}</p>
                    {p.note && <p className="text-xs text-gray-500 mt-1">{p.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {section.grid && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {section.grid.map((item, j) => (
                  <div
                    key={j}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Mid-page CTA */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-7 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Ready to Find Your Property in Kigali?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Browse hundreds of verified listings — houses, apartments, and land across Kigali. No broker fees, no hidden charges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/?view=search"
              className="px-7 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Browse Listings
            </Link>
            <Link
              to="/?view=agents"
              className="px-7 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Find a Verified Agent
            </Link>
          </div>
        </section>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Pages */}
        {relatedPages.length > 0 && (
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Related Searches</h2>
            <div className="flex flex-wrap gap-3">
              {relatedPages.map((page, i) => (
                <Link
                  key={i}
                  to={page.href}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {page.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 mt-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <Link to="/" className="text-white font-bold text-lg">
                PropSpera
              </Link>
              <p className="text-sm mt-1">Rwanda's leading real estate platform</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/?view=search" className="hover:text-white transition-colors">Properties</Link>
              <Link to="/?view=agents" className="hover:text-white transition-colors">Agents</Link>
              <Link to="/houses-for-rent-kigali" className="hover:text-white transition-colors">Rent</Link>
              <Link to="/houses-for-sale-kigali" className="hover:text-white transition-colors">Buy</Link>
              <Link to="/real-estate-agents-kigali" className="hover:text-white transition-colors">Find Agent</Link>
            </div>
          </div>
          <p className="text-xs text-center mt-8 text-gray-600">
            © {new Date().getFullYear()} PropSpera. All rights reserved. | Kigali, Rwanda
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SeoLandingPage;
