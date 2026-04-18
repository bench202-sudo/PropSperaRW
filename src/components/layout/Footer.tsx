import React, { useState } from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { MapPinIcon, PhoneIcon, MailIcon } from '@/components/icons/Icons';
 
const PropSperaLogo: React.FC = () => (
  <svg width="200" height="60" viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#3b82f6'}}/>
        <stop offset="100%" style={{stopColor:'#2563eb'}}/>
      </linearGradient>
    </defs>
    <rect x="40" y="40" width="110" height="110" rx="22" fill="url(#fIconGrad)"/>
    <polygon points="95,58 148,95 42,95" fill="white" opacity="0.95"/>
    <rect x="58" y="95" width="74" height="48" rx="3" fill="white" opacity="0.95"/>
    <rect x="82" y="113" width="26" height="30" rx="4" fill="#2563eb"/>
    <rect x="63" y="101" width="14" height="14" rx="2" fill="#93c5fd"/>
    <rect x="113" y="101" width="14" height="14" rx="2" fill="#93c5fd"/>
    <rect x="85" y="124" width="5" height="14" rx="1" fill="white" opacity="0.7"/>
    <rect x="93" y="120" width="5" height="18" rx="1" fill="white" opacity="0.85"/>
    <rect x="101" y="116" width="5" height="22" rx="1" fill="white"/>
    <text x="172" y="97"
      fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
      fontSize="46" fontWeight="700" fill="white"
      textLength="112" lengthAdjust="spacingAndGlyphs">Prop</text>
    <text x="284" y="97"
      fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
      fontSize="46" fontWeight="700" fill="#93c5fd"
      textLength="130" lengthAdjust="spacingAndGlyphs">Spera</text>
    <text x="173" y="130"
      fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
      fontSize="16" fontWeight="400" fill="#94a3b8" letterSpacing="0.5">Where Property Meets Prosperity</text>
    <line x1="173" y1="143" x2="540" y2="143" stroke="#334155" strokeWidth="1"/>
  </svg>
);
 
// Simple "Coming Soon" modal
const ComingSoonModal: React.FC<{ title: string; onClose: () => void; t: (key: string) => string }> = ({ title, onClose, t }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6">{t('comingSoonMsg')}</p>
      <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
        {t('gotIt')}
      </button>
    </div>
  </div>
);
 
interface FooterProps {
  onNavigate?: (view: string) => void;
  onBecomeAgent?: () => void;
  onLogin?: () => void;
  onContact?: () => void;
  onPrivacyPolicy?: () => void;
  onTermsOfService?: () => void;
  onFAQ?: () => void;
  onHelpCenter?: () => void;
}
 
const Footer: React.FC<FooterProps> = ({ onNavigate, onBecomeAgent, onLogin, onContact, onPrivacyPolicy, onTermsOfService, onFAQ, onHelpCenter }) => {
  const { t } = useLanguage();
  const [comingSoon, setComingSoon] = useState<string | null>(null);
 
  const navLink = (view: string, label: string) => (
    <li>
      <button
        onClick={() => onNavigate?.(view)}
        className="hover:text-white transition-colors text-left"
      >
        {label}
      </button>
    </li>
  );
 
  const comingSoonLink = (label: string) => (
    <li>
      <button
        onClick={() => setComingSoon(label)}
        className="hover:text-white transition-colors text-left flex items-center gap-1.5"
      >
        {label}
        <span className="text-[10px] bg-blue-600/40 text-blue-300 px-1.5 py-0.5 rounded-full font-medium">{t('comingSoon')}</span>
      </button>
    </li>
  );
 
  return (
    <footer className="bg-gray-900 text-white">
      {comingSoon && (
        <ComingSoonModal title={comingSoon} onClose={() => setComingSoon(null)} t={t as any} />
      )}
 
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-4">
              <PropSperaLogo />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {t('footerDesc')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPinIcon size={16} />
                <span>Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <PhoneIcon size={16} />
                <span>+250 787 397 658</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MailIcon size={16} />
                <span>hello@propspera.com</span>
              </div>
            </div>
          </div>
 
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {navLink('search', t('browseProperties'))}
              {navLink('agents', t('findAgents'))}
              {navLink('search', t('forSale'))}
              {navLink('search-rent', t('forRent'))}
              {comingSoonLink(t('newListings'))}
            </ul>
          </div>

          {/* For Agents */}
          <div>
            <h4 className="font-semibold mb-4">{t('forAgents')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => onBecomeAgent?.()}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('becomeAgent')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onLogin?.()}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('agentLogin')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onBecomeAgent?.()}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('listAProperty')}
                </button>
              </li>
              {comingSoonLink(t('agentResources'))}
              {comingSoonLink(t('successStories'))}
            </ul>
          </div>
 
          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t('support')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button onClick={() => onHelpCenter?.()} className="hover:text-white transition-colors text-left">
                  {t('helpCenter')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onContact?.()}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('contactUs')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPrivacyPolicy?.()}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('privacyPolicy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTermsOfService?.()}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('termsOfService')}
                </button>
              </li>
              <li>
                <button onClick={() => onFAQ?.()} className="hover:text-white transition-colors text-left">
                  {t('faq')}
                </button>
              </li>
            </ul>
          </div>
        </div>
 
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">{t('footerRights')}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
 
export default Footer;
