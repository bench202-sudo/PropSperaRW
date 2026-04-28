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
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61578495974579"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit PropSpera on Facebook"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/propspera_kgl/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit PropSpera on Instagram"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            {/* WhatsApp Channel */}
            <a
              href="https://whatsapp.com/channel/0029VbCjMGQ84OmDS4m8Qi17"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow PropSpera on WhatsApp"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
 
export default Footer;
