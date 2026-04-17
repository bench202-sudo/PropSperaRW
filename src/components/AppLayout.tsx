import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Property, Agent, SearchFilters, Conversation } from '@/types';
 
import { neighborhoods } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { useAuth, useLanguage } from '@/contexts/AuthContext';
import { useProperties, useAgents } from '@/hooks/useProperties';
import { useFavorites } from '@/hooks/useFavorites';
import { usePropertyRatings } from '@/hooks/useReviews';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import SavedSearchModal from '@/components/notifications/SavedSearchModal';
 
// Layout Components
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';
 
// Home Components
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import NeighborhoodSection from '@/components/home/NeighborhoodSection';
import AgentsSection from '@/components/home/AgentsSection';
 
// Property Components
import PropertyCard from '@/components/property/PropertyCard';
import PropertyDetail from '@/components/property/PropertyDetail';
import AddPropertyModal from '@/components/property/AddPropertyModal';
import InquiryModal from '@/components/property/InquiryModal';
 
// Search Components
import SearchFiltersComponent from '@/components/search/SearchFilters';
import AgentSearchFilters, { AgentFilterState, defaultAgentFilters } from '@/components/search/AgentSearchFilters';
 
// Agent Components
import AgentCard from '@/components/agent/AgentCard';
import AgentProfile from '@/components/agent/AgentProfile';
import AgentSignup from '@/components/agent/AgentSignup';
import AgentDashboard from '@/components/agent/AgentDashboard';
 
// Favorites Components
import SavedProperties from '@/components/favorites/SavedProperties';
 
// Compare Components
import PropertyComparison from '@/components/compare/PropertyComparison';
 
// Map Components
import PropertyMap from '@/components/map/PropertyMap';
 
// Other Components
import MessagingPanel from '@/components/messaging/MessagingPanel';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AuthModal from '@/components/auth/AuthModal';
import SuccessModal from '@/components/SuccessModal';
import UserProfilePage from '@/components/profile/UserProfilePage';
 
// Icons
import { ShieldCheckIcon, SearchIcon, UsersIcon, StarIcon, BuildingIcon, MapPinIcon, ColumnsIcon, XIcon, GridIcon, MapIcon, SplitIcon, MailIcon, PhoneIcon, MessageIcon, CheckCircleIcon, AlertCircleIcon } from '@/components/icons/Icons';
 
// ─────────────────────────────────────────────────────────────────────────────
// SEO HELPERS — dynamic title, meta, URL sync. No new files needed.
// ─────────────────────────────────────────────────────────────────────────────
 
function buildSEOTitle(f: { listing_type?: string; property_type?: string; neighborhood?: string }): string {
  const typeMap: Record<string, string> = { house: 'Houses', apartment: 'Apartments', villa: 'Villas', commercial: 'Commercial Properties', land: 'Land', all: 'Properties' };
  const listingMap: Record<string, string> = { sale: 'for Sale', rent: 'for Rent', all: '' };
  const type = typeMap[f.property_type || 'all'] ?? 'Properties';
  const listing = listingMap[f.listing_type || 'all'] ?? '';
  const loc = f.neighborhood && f.neighborhood !== '' ? `in ${f.neighborhood}` : 'in Kigali';
  return `${[type, listing, loc].filter(Boolean).join(' ')} | PropSpera`;
};
 
function buildSEOMeta(f: { listing_type?: string; property_type?: string; neighborhood?: string }): string {
  const typeMap: Record<string, string> = { house: 'houses', apartment: 'apartments', villa: 'villas', commercial: 'commercial properties', land: 'land', all: 'properties' };
  const type = typeMap[f.property_type || 'all'] ?? 'properties';
  const listing = f.listing_type === 'rent' ? 'for rent' : f.listing_type === 'sale' ? 'for sale' : '';
  const loc = f.neighborhood && f.neighborhood !== '' ? `in ${f.neighborhood}, Kigali` : 'in Kigali';
  return `Browse verified ${[type, listing, loc].filter(Boolean).join(' ')}. Contact agents directly and find your next property on PropSpera — Rwanda\'s real estate marketplace.`;
};
 
function applySEOMeta(title: string, description: string): void {
  document.title = title;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
  meta.content = description;
  const setOG = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
    el.content = content;
  };
  setOG('og:title', title);
  setOG('og:description', description);
  setOG('og:type', 'website');
  setOG('og:site_name', 'PropSpera');
};
 
function applySEOUrl(f: { listing_type?: string; property_type?: string; neighborhood?: string }): void {
  const params = new URLSearchParams();
  if (f.listing_type && f.listing_type !== 'all') params.set('type', f.listing_type);
  if (f.property_type && f.property_type !== 'all') params.set('propertyType', f.property_type);
  if (f.neighborhood && f.neighborhood !== '') params.set('location', encodeURIComponent(f.neighborhood));
  const qs = params.toString();
  window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
};
 
 
// ─────────────────────────────────────────────────────────────────────────────
 
 
 
type NavItem = 'home' | 'search' | 'add' | 'messages' | 'profile' | 'admin';
type View = 'home' | 'search' | 'agents' | 'favorites' | 'compare';
type SearchViewMode = 'grid' | 'map' | 'split';
 
const MAX_COMPARE = 3;
 
 
 
 
// ── Inline ContactModal ───────────────────────────────────────────────
 
interface ContactModalProps {
  onClose: () => void;
}
 
const MAX_MESSAGE_LENGTH = 500;
 
const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
 
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (phone.trim().length < 7) newErrors.phone = 'Enter a valid phone number';
    if (!message.trim()) newErrors.message = 'Message is required';
    else if (message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
 
    setSubmitting(true);
    setError(null);
 
    try {
      // 1. Find admin user id
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .single();
 
      if (adminError || !adminUser) {
        setError('Could not reach support. Please email hello@propspera.com directly.');
        setSubmitting(false);
        return;
      }
 
      // 2. Create a synthetic sender record or use a placeholder id
      // We insert a message from a "guest" using their email as identifier
      // Since sender_id requires a valid users.id, we use the admin's id as both
      // and embed the contact info in the message body
      const messageBody = `📬 Contact Form Submission\n\nFrom: ${email}\nPhone: ${phone}\n\n${message}`;
 
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: adminUser.id,   // self-message to admin inbox
          receiver_id: adminUser.id,
          content: messageBody,
          is_read: false,
          created_at: new Date().toISOString()
        });
 
      if (msgError) throw msgError;
 
      // 3. Send email notification to admin via edge function
      try {
        await supabase.functions.invoke('send-inquiry-notification', {
          body: {
            type: 'contact_form',
            agentEmail: 'hello@propspera.com',
            agentName: 'PropSpera Admin',
            senderEmail: email,
            senderPhone: phone,
            message: message
          }
        });
      } catch (emailErr) {
        console.warn('Email notification failed but message was saved:', emailErr);
      }
 
      setSuccess(true);
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try again or email hello@propspera.com.');
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Contact Us</h2>
              <p className="text-blue-200 text-sm mt-0.5">We'll get back to you within 24 hours</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
 
        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm mb-6">
                Thank you for reaching out. Our team will get back to you at <strong>{email}</strong> within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MailIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
 
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: '' })); }}
                    placeholder="+250 7XX XXX XXX"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.phone ? 'ring-2 ring-red-400' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
 
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => {
                    if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                      setMessage(e.target.value);
                      if (errors.message) setErrors(p => ({ ...p, message: '' }));
                    }
                  }}
                  placeholder="How can we help you? Tell us about your property needs, questions, or feedback..."
                  rows={5}
                  className={`w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${errors.message ? 'ring-2 ring-red-400' : ''}`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.message
                    ? <p className="text-red-500 text-xs">{errors.message}</p>
                    : <span />
                  }
                  <p className={`text-xs ml-auto ${message.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </p>
                </div>
              </div>
 
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircleIcon size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
 
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageIcon size={18} />
                    Send Message
                  </>
                )}
              </button>
 
              <p className="text-center text-xs text-gray-400">
                Or email us directly at{' '}
                <a href="mailto:hello@propspera.com" className="text-blue-600 hover:underline">
                  hello@propspera.com
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
 
// ── End ContactModal ──────────────────────────────────────────────────
 
// ── Inline FAQModal ──────────────────────────────────────────────────
 
interface FAQModalProps { onClose: () => void; }
 
const FAQModal: React.FC<FAQModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const isFrFaq = language === 'fr';
 
  const enSections = [
    { icon: '🏡', title: 'General Questions', items: [
      { q: `What is PropSpera?`, a: `PropSpera is a digital real estate platform that helps people in Rwanda discover properties, connect with agents, and close deals faster. Whether buying, renting, or listing, PropSpera makes the process easier and more transparent.` },
      { q: `Is PropSpera free to use?`, a: `Yes. Browsing properties and contacting agents is completely free. For agents and property owners, listing properties is currently free during our early launch phase.` },
      { q: `Where does PropSpera operate?`, a: `PropSpera is currently focused on Kigali and surrounding areas, with plans to expand across Rwanda.` },
    ]},
    { icon: '🔍', title: 'For Buyers & Tenants', items: [
      { q: `How do I find a property?`, a: `Browse properties using filters such as location, price, and property type. Click on a listing to view details and contact the agent directly.` },
      { q: `How do I contact an agent?`, a: `Each listing includes a Send Message button and a WhatsApp icon. Click whichever you prefer to reach the agent.` },
      { q: `Are the properties verified?`, a: `We encourage agents to provide accurate listings and monitor for suspicious activity. Always visit in person, verify ownership and documents, and avoid payments without proper agreements.` },
      { q: `Can I save properties?`, a: `Yes. Save your favorite listings and come back to them later from your account.` },
      { q: `How do I know if a property is still available?`, a: `Contact the agent directly via WhatsApp or message to confirm availability.` },
    ]},
    { icon: '🧑‍💼', title: 'For Agents & Property Owners', items: [
      { q: `How do I list a property?`, a: `Create an account and click List a Property. Fill in the details, upload images, and publish your listing.` },
      { q: `How do buyers contact me?`, a: `Buyers can contact you via WhatsApp or through the platform. You will receive inquiries from interested clients.` },
      { q: `Is listing a property free?`, a: `Yes, listing is currently free during our early stage. Premium features may be introduced later.` },
      { q: `How can I get more visibility?`, a: `Upload high-quality photos, write clear and detailed descriptions, and respond quickly to inquiries.` },
      { q: `Can I list multiple properties?`, a: `Yes. Agents and property owners can list multiple properties on PropSpera.` },
    ]},
    { icon: '🔒', title: 'Trust & Safety', items: [
      { q: `Is PropSpera safe?`, a: `We are committed to creating a safe marketplace. Always verify property details, meet agents in person, and avoid sending money without proper documentation.` },
      { q: `How do you prevent scams?`, a: `We actively monitor listings and user activity. Suspicious listings may be removed and accounts suspended.` },
      { q: `How can I report a suspicious listing?`, a: `Contact us at hello@propspera.com. We will investigate and take appropriate action.` },
    ]},
    { icon: '⚙️', title: 'Account & Support', items: [
      { q: `Do I need an account to use PropSpera?`, a: `You can browse without an account, but need one to save listings, list properties, and access additional features.` },
      { q: `I forgot my password. What should I do?`, a: `Click Forgot Password on the login page and follow the instructions to reset your password.` },
      { q: `How can I contact PropSpera?`, a: `You can reach us at hello@propspera.com. We are happy to help!` },
    ]},
  ];
 
  const frSections = [
    { icon: '🏡', title: 'Questions générales', items: [
      { q: `Qu'est-ce que PropSpera ?`, a: `PropSpera est une plateforme immobilière numérique qui aide les personnes au Rwanda à découvrir des biens, se connecter avec des agents et conclure des transactions plus rapidement. Que vous achetiez, louiez ou mettiez en vente, PropSpera rend le processus plus simple et plus transparent.` },
      { q: `PropSpera est-il gratuit ?`, a: `Oui. La navigation et le contact des agents sont entièrement gratuits. Pour les agents et propriétaires, la publication d'annonces est actuellement gratuite pendant notre phase de lancement.` },
      { q: `Où PropSpera opère-t-il ?`, a: `PropSpera est actuellement concentré sur Kigali et ses environs, avec des projets d'expansion à travers le Rwanda.` },
    ]},
    { icon: '🔍', title: 'Pour les acheteurs et locataires', items: [
      { q: `Comment trouver un bien ?`, a: `Parcourez les biens avec des filtres tels que la localisation, le prix et le type. Cliquez sur une annonce pour voir les détails et contacter l'agent directement.` },
      { q: `Comment contacter un agent ?`, a: `Chaque annonce inclut un bouton Envoyer un message et une icône WhatsApp pour contacter l'agent.` },
      { q: `Les biens sont-ils vérifiés ?`, a: `Nous encourageons les agents à fournir des annonces exactes. Visitez le bien en personne, vérifiez la propriété et les documents, et évitez les paiements sans accord écrit.` },
      { q: `Puis-je sauvegarder des biens ?`, a: `Oui. Sauvegardez vos annonces favorites et retrouvez-les plus tard depuis votre compte.` },
      { q: `Comment savoir si un bien est disponible ?`, a: `Contactez directement l'agent via WhatsApp ou message pour confirmer la disponibilité.` },
    ]},
    { icon: '🧑‍💼', title: 'Pour les agents et propriétaires', items: [
      { q: `Comment publier un bien ?`, a: `Créez un compte et cliquez sur Publier un bien. Remplissez les détails, téléchargez des images et publiez votre annonce.` },
      { q: `Comment les acheteurs me contactent-ils ?`, a: `Les acheteurs peuvent vous contacter via WhatsApp ou via la plateforme. Vous recevrez des demandes de clients intéressés.` },
      { q: `La publication est-elle gratuite ?`, a: `Oui, la publication est actuellement gratuite. Nous pourrons introduire des fonctionnalités premium ultérieurement.` },
      { q: `Comment obtenir plus de visibilité ?`, a: `Téléchargez des photos de haute qualité, rédigez des descriptions claires et détaillées, et répondez rapidement aux demandes.` },
      { q: `Puis-je publier plusieurs biens ?`, a: `Oui. Les agents et propriétaires peuvent publier plusieurs biens sur PropSpera.` },
    ]},
    { icon: '🔒', title: 'Confiance et sécurité', items: [
      { q: `PropSpera est-il sûr ?`, a: `Nous nous engageons à créer un marché sécurisé. Vérifiez toujours les détails des biens, rencontrez les agents en personne et évitez d'envoyer de l'argent sans documentation appropriée.` },
      { q: `Comment prévenez-vous les arnaques ?`, a: `Nous surveillons activement les annonces. Les annonces suspectes peuvent être supprimées et les comptes suspendus.` },
      { q: `Comment signaler une annonce suspecte ?`, a: `Contactez-nous à hello@propspera.com. Nous enquêterons et prendrons les mesures appropriées.` },
    ]},
    { icon: '⚙️', title: 'Compte et support', items: [
      { q: `Ai-je besoin d'un compte ?`, a: `Vous pouvez parcourir les biens sans compte. Un compte est nécessaire pour sauvegarder des annonces, publier des biens et accéder aux fonctionnalités supplémentaires.` },
      { q: `J'ai oublié mon mot de passe.`, a: `Cliquez sur Mot de passe oublié sur la page de connexion et suivez les instructions.` },
      { q: `Comment contacter PropSpera ?`, a: `Vous pouvez nous joindre à hello@propspera.com. Nous sommes ravis de vous aider !` },
    ]},
  ];
 
  const sections = isFrFaq ? frSections : enSections;
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden animate-slide-up flex flex-col">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('faq')}</h2>
              <p className="text-amber-100 text-sm mt-0.5">{isFrFaq ? 'Questions fréquemment posées' : 'Frequently Asked Questions'}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <p className="text-sm text-gray-600 italic">
            {isFrFaq ? `Bienvenue sur PropSpera ! Voici les réponses aux questions les plus fréquentes des acheteurs, locataires, agents et propriétaires.` : `Welcome to PropSpera! Below are answers to the most common questions from buyers, tenants, agents, and property owners.`}
          </p>
          {sections.map((section, si) => (
            <div key={si}>
              <h3 className="font-bold text-gray-900 text-base mb-3">{section.icon} {section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, ii) => (
                  <div key={ii} className="bg-gray-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{item.q}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-sm text-amber-700">
              {isFrFaq ? `PropSpera est conçu pour rendre l'immobilier au Rwanda plus simple, rapide et transparent.` : `PropSpera is built to make real estate in Rwanda simpler, faster, and more transparent.`}
            </p>
            <a href="mailto:hello@propspera.com" className="inline-block mt-2 text-sm text-amber-700 font-medium hover:underline">📧 hello@propspera.com</a>
          </div>
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">{t('close')}</button>
        </div>
      </div>
    </div>
  );
};
 
// ── End FAQModal ──────────────────────────────────────────────────────
 
// ── Inline HelpCenterModal ───────────────────────────────────────────
 
interface HelpCenterModalProps { onClose: () => void; }
 
const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const isFrHelp = language === 'fr';
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden animate-slide-up flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('helpCenter')}</h2>
              <p className="text-emerald-100 text-sm mt-0.5">{isFrHelp ? 'Guides et assistance PropSpera' : 'PropSpera Guides & Support'}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 text-sm text-gray-700 leading-relaxed">
 
          <p className="text-gray-600 italic">{isFrHelp ? "Bienvenue dans le Centre d’aide PropSpera. Trouvez ici des guides pour démarrer, publier des biens et vous connecter avec des agents ou des acheteurs." : "Welcome to the PropSpera Help Center. Here you’ll find guides to help you get started, list properties, and connect with agents or buyers."}</p>
 
          {/* Getting Started */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-3">🧭 {isFrHelp ? 'Premiers pas' : 'Getting Started'}</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">{isFrHelp ? 'Comment créer un compte' : 'How to create an account'}</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  {isFrHelp ? (<><li>Cliquez sur <strong>S’inscrire</strong></li><li>Choisissez Email ou Google (BIENTÔT DISPONIBLE)</li><li>Saisissez vos informations</li><li>Confirmez votre compte</li></>) : (<><li>Click <strong>Sign Up</strong></li><li>Choose Email or Google (COMING SOON)</li><li>Enter your details</li><li>Confirm your account</li></>)}
                </ol>
                <p className="text-gray-500 text-xs mt-2">{isFrHelp ? "Pour publier des biens, vous devez vous inscrire en tant que Propriétaire ou Agent lors de la création du compte." : "To list properties, you must register as a Homeowner or Agent at account creation."}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-1">{isFrHelp ? "Ai-je besoin d’un compte ?" : 'Do I need an account?'}</p>
                <p className="text-gray-600">{isFrHelp ? "Vous pouvez parcourir les biens sans compte. Cependant, un compte est nécessaire pour sauvegarder des annonces, publier des biens et accéder aux fonctionnalités agent." : "You can browse properties without an account. However, you need an account to save listings, list properties, and access agent features."}</p>
              </div>
            </div>
          </section>
 
          {/* Listing Properties */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-3">🏡 {isFrHelp ? 'Publier des biens' : 'Listing Properties'}</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">{isFrHelp ? 'Comment publier un bien' : 'How to list a property'}</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  {isFrHelp ? (<><li>Connectez-vous à votre compte Agent</li><li>Accédez au Tableau de bord Agent</li><li>Cliquez sur <strong>Ajouter un bien</strong></li><li>Remplissez le titre, prix, localisation et description</li><li>Téléchargez des photos nettes</li><li>Cliquez sur <strong>Publier</strong></li></>) : (<><li>Log in to your Agent account</li><li>Go to Agent Dashboard</li><li>Click <strong>Add Property</strong></li><li>Fill in title, price, location, description</li><li>Upload clear photos</li><li>Click <strong>Publish</strong></li></>)}
                </ol>
                <p className="text-gray-500 text-xs mt-2">{isFrHelp ? "Votre annonce apparaîtra une fois examinée et approuvée." : "Your listing will appear once reviewed and approved."}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-semibold text-amber-800 mb-1">👉 {isFrHelp ? 'Conseils pour plus de demandes' : 'Tips to get more inquiries'}</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700 text-xs">
                  {isFrHelp ? (<><li>Photos haute qualité (nettes, lumineuses, multiples angles)</li><li>Description claire et détaillée</li><li>Tarification précise</li><li>Répondre rapidement aux messages</li></>) : (<><li>High-quality photos (bright, clear, multiple angles)</li><li>Clear and detailed description</li><li>Accurate pricing</li><li>Respond quickly to messages</li></>)}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-1">{isFrHelp ? 'Puis-je modifier ou supprimer mon annonce ?' : 'Can I edit or delete my listing?'}</p>
                <p className="text-gray-600">{isFrHelp ? "Oui. Accédez à votre tableau de bord, sélectionnez votre bien et cliquez sur Modifier ou Supprimer." : "Yes. Go to your dashboard, select your property, and click Edit or Delete."}</p>
              </div>
            </div>
          </section>
 
          {/* Contacting Agents */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-3">📲 {isFrHelp ? 'Contacter les agents' : 'Contacting Agents'}</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">{isFrHelp ? 'Comment contacter un agent' : 'How to contact an agent'}</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  {isFrHelp ? (<><li>Ouvrez une annonce immobilière</li><li>Cliquez sur <strong>Envoyer un message</strong> pour un message direct</li><li>Cliquez sur l’icône <strong>WhatsApp</strong> pour chatter</li></>) : (<><li>Open a property listing</li><li>Click <strong>Send Message</strong> for a direct message</li><li>Click the <strong>WhatsApp</strong> icon to chat</li></>)}
                </ol>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">{isFrHelp ? 'Que demander à un agent ?' : 'What should I ask an agent?'}</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {isFrHelp ? (<><li>Le bien est-il encore disponible ?</li><li>Puis-je planifier une visite ?</li><li>Quelles sont les conditions de paiement ?</li><li>Y a-t-il des frais supplémentaires ?</li></>) : (<><li>Is the property still available?</li><li>Can I schedule a visit?</li><li>What are the payment terms?</li><li>Are there additional costs?</li></>)}
                </ul>
              </div>
            </div>
          </section>
 
          {/* Saving & Comparing */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-3">❤️ {isFrHelp ? 'Sauvegarder et comparer' : 'Saving & Comparing'}</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">{isFrHelp ? 'Comment sauvegarder un bien' : 'How to save a property'}</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  {isFrHelp ? (<><li>Cliquez sur l’icône ❤️ sur l’annonce</li><li>Retrouvez vos biens sauvegardés depuis votre compte</li></>) : (<><li>Click the ❤️ icon on the listing</li><li>Access saved properties from your account</li></>)}
                </ol>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">{isFrHelp ? 'Comment comparer des biens' : 'How to compare properties'}</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  {isFrHelp ? (<><li>Cliquez sur l’icône comparer</li><li>Ajoutez jusqu’à 3 biens</li><li>Visualisez-les côte à côte</li></>) : (<><li>Click the compare icon</li><li>Add up to 3 properties</li><li>View them side-by-side</li></>)}
                </ol>
              </div>
            </div>
          </section>
 
          {/* Safety */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-3">🔒 {isFrHelp ? 'Sécurité et confiance' : 'Safety & Trust'}</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">{isFrHelp ? 'Comment rester en sécurité' : 'How to stay safe'}</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {isFrHelp ? (<><li>Visitez toujours le bien en personne</li><li>Vérifiez la propriété et la documentation</li><li>Évitez d’envoyer de l’argent sans accord écrit</li><li>Méfiez-vous des offres trop belles pour être vraies</li></>) : (<><li>Always visit the property in person</li><li>Verify ownership and documentation</li><li>Avoid sending money without a written agreement</li><li>Be cautious of deals that seem too good to be true</li></>)}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-1">{isFrHelp ? 'Comment signaler une annonce ou un utilisateur' : 'How to report a listing or user'}</p>
                <p className="text-gray-600">{isFrHelp ? "Si vous suspectez une fraude, contactez-nous à " : "If you suspect fraud or misleading information, contact us at "}<a href="mailto:hello@propspera.com" className="text-blue-600 hover:underline">hello@propspera.com</a></p>
              </div>
            </div>
          </section>
 
          {/* Account & Technical */}
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-3">⚙️ {isFrHelp ? 'Compte et aide technique' : 'Account & Technical Help'}</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">{isFrHelp ? 'Mot de passe oublié' : 'Forgot my password'}</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  {isFrHelp ? (<><li>Cliquez sur Mot de passe oublié sur la page de connexion</li><li>Saisissez votre e-mail</li><li>Suivez les instructions de réinitialisation</li></>) : (<><li>Click Forgot Password on the login page</li><li>Enter your email</li><li>Follow the reset instructions</li></>)}
                </ol>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-1">{isFrHelp ? "Je ne reçois pas d’e-mails" : "I’m not receiving emails"}</p>
                <p className="text-gray-600">{isFrHelp ? "Vérifiez votre dossier spam et que votre adresse e-mail est correcte. Si le problème persiste, contactez le support." : "Check your spam/junk folder and that your email address is correct. If the issue continues, contact support."}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-1">{isFrHelp ? 'Contacter le support' : 'How to contact support'}</p>
                <div className="bg-gray-100 rounded-lg p-3 mt-1">
                  <p>📧 <a href="mailto:hello@propspera.com" className="text-blue-600 hover:underline font-medium">hello@propspera.com</a></p>
                </div>
              </div>
            </div>
          </section>
 
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-sm text-emerald-700">{isFrHelp ? "PropSpera est conçu pour rendre l’immobilier au Rwanda simple et efficace. Si vous avez besoin d’aide, nous sommes là pour vous." : "PropSpera is designed to make real estate in Rwanda simple and efficient. If you need help at any step, we’re here for you."}</p>
          </div>
 
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">{t('close')}</button>
        </div>
      </div>
    </div>
  );
};
 
// ── End HelpCenterModal ───────────────────────────────────────────────
 
// ── Inline TermsOfServiceModal ───────────────────────────────────────
 
interface TermsOfServiceModalProps { onClose: () => void; }
 
const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const isFrTos = language === 'fr';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden animate-slide-up flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('termsOfService')}</h2>
              <p className="text-indigo-200 text-sm mt-0.5">{isFrTos ? 'Dernière mise à jour : 28 mars 2026' : 'Last updated: March 28, 2026'}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm text-gray-700 leading-relaxed">
 
          <p className="text-gray-600 italic">{isFrTos ? 'Bienvenue sur PropSpera. Ces Conditions d’utilisation régissent votre accès et l’utilisation de la plateforme PropSpera. En utilisant PropSpera, vous acceptez ces Conditions.' : 'Welcome to PropSpera. These Terms of Service govern your access to and use of the PropSpera platform. By using PropSpera, you agree to these Terms.'}</p>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '1. Aperçu de la plateforme' : '1. Overview of the Platform'}</h3>
            <p className="mb-2">{isFrTos ? 'PropSpera est une marketplace numérique qui met en relation :' : 'PropSpera is a digital marketplace that connects:'}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              {isFrTos ? (<><li>Les agents immobiliers</li><li>Les propriétaires</li><li>Les acheteurs et locataires</li></>) : (<><li>Real estate agents</li><li>Property owners</li><li>Buyers and tenants</li></>)}
            </ul>
            <p className="mt-2">{isFrTos ? 'PropSpera facilite les mises en relation mais n’est pas partie à une transaction entre utilisateurs.' : 'PropSpera facilitates connections but is not a party to any transaction between users.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '2. Rôles et responsabilités des utilisateurs' : '2. User Roles and Responsibilities'}</h3>
            <h4 className="font-semibold text-gray-800 mb-1">{isFrTos ? '2.1 Agents et propriétaires' : '2.1 Agents and Property Owners'}</h4>
            <p className="mb-2">{isFrTos ? 'Si vous publiez un bien, vous vous engagez à :' : 'If you are listing a property, you agree to:'}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600 mb-2">
              {isFrTos ? (<><li>Fournir des informations <strong>exactes, complètes et à jour</strong></li><li>Ne lister que des biens que vous êtes <strong>autorisé à représenter ou vendre</strong></li><li>S’assurer que les détails (prix, localisation, caractéristiques) sont véridiques</li><li>S’assurer que les images reflètent le bien réel</li><li>Répondre aux demandes de manière professionnelle</li></>) : (<><li>Provide <strong>accurate, complete, and up-to-date information</strong></li><li>Only list properties you are <strong>authorized to represent or sell</strong></li><li>Ensure property details (price, location, features) are truthful</li><li>Ensure images reflect the actual property</li><li>Respond to inquiries in a professional manner</li></>)}
            </ul>
            <p>{isFrTos ? 'Vous êtes seul responsable de la légalité de vos annonces et de tout accord conclu avec les acheteurs ou locataires.' : 'You are solely responsible for the legality of your listings and any agreements made with buyers or tenants.'}</p>
            <h4 className="font-semibold text-gray-800 mt-3 mb-1">{isFrTos ? '2.2 Acheteurs et locataires' : '2.2 Buyers and Tenants'}</h4>
            <p className="mb-2">{isFrTos ? 'Si vous utilisez PropSpera pour rechercher un bien, vous vous engagez à fournir des informations exactes et à effectuer votre propre vérification avant toute transaction.' : 'If you are using PropSpera to search for property, you agree to provide accurate information when contacting agents and conduct your own due diligence before entering any transaction.'}</p>
            <p>{isFrTos ? 'PropSpera ne garantit pas la disponibilité des biens, l’exactitude des annonces ni l’issue des négociations.' : 'PropSpera does not guarantee property availability, accuracy of listings, or outcome of negotiations.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '3. Politique des annonces immobilières' : '3. Property Listings Policy'}</h3>
            <p className="mb-2">{isFrTos ? 'Toutes les annonces doivent être authentiques, représenter des biens réels et inclure des prix et localisations exacts. Sont strictement interdits :' : 'All listings must be genuine, represent real existing properties, and include accurate pricing and location. The following are strictly prohibited:'}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600 mb-2">
              {isFrTos ? (<><li>Les annonces fausses ou dupliquées</li><li>Les annonces visant à escroquer ou induire en erreur</li><li>La déformation de la propriété ou de l’autorisation</li><li>L’utilisation d’images ou de contenus volés</li></>) : (<><li>Fake or duplicate listings</li><li>Listings intended to scam or mislead users</li><li>Misrepresentation of ownership or authorization</li><li>Use of stolen images or content</li></>)}
            </ul>
            <p>{isFrTos ? 'PropSpera se réserve le droit de supprimer toute annonce sans préavis et de suspendre les comptes associés à des activités suspectes.' : 'PropSpera reserves the right to remove any listing without notice and suspend accounts associated with suspicious activity.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '4. Politique anti-fraude et sécurité' : '4. Anti-Fraud and Safety Policy'}</h3>
            <p className="mb-2">{isFrTos ? 'PropSpera prend la fraude très au sérieux. Vous vous engagez à NE PAS :' : 'PropSpera takes fraud seriously. You agree NOT to:'}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600 mb-3">
              {isFrTos ? (<><li>Publier de faux biens ou des annonces "appâts"</li><li>Demander ou accepter des paiements en dehors de canaux sécurisés sans documentation appropriée</li><li>Usurper l’identité d’un agent, d’une agence ou d’un propriétaire</li><li>Utiliser la plateforme pour tromper, exploiter ou escroquer des utilisateurs</li></>) : (<><li>Post fake properties or "bait" listings</li><li>Request or accept payments outside secure and verifiable channels without proper documentation</li><li>Impersonate another agent, agency, or property owner</li><li>Use the platform to deceive, exploit, or defraud users</li></>)}
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
              <p className="font-semibold text-amber-800 mb-1">{isFrTos ? '⚠️ Avertissement aux utilisateurs' : '⚠️ Warning to Users'}</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-amber-700 text-xs">
                {isFrTos ? (<><li>Vérifiez toujours la propriété et les documents</li><li>Ne faites pas de paiements sans accords en bonne et due forme</li><li>Méfiez-vous des offres qui semblent trop belles pour être vraies</li></>) : (<><li>Always verify property ownership and documents</li><li>Do not make payments without proper agreements</li><li>Be cautious of deals that seem too good to be true</li></>)}
              </ul>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">{isFrTos ? '4.1 Signaler une fraude' : '4.1 Reporting Fraud'}</h4>
            <p>{isFrTos ? 'Signalez toute activité suspecte à ' : 'Report suspicious activity to '}<a href="mailto:hello@propspera.com" className="text-blue-600 hover:underline">hello@propspera.com</a>{isFrTos ? '. PropSpera peut enquêter, suspendre ou bannir définitivement les contrevenants et coopérer avec les autorités si nécessaire.' : '. PropSpera may investigate, suspend or permanently ban offending users, and cooperate with law enforcement if necessary.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '5. Comptes utilisateurs' : '5. User Accounts'}</h3>
            <p>{isFrTos ? 'Vous êtes responsable de la confidentialité de votre compte et de toute activité qui y est liée. PropSpera peut suspendre ou résilier les comptes qui enfreignent ces Conditions ou adoptent un comportement frauduleux.' : 'You are responsible for maintaining the confidentiality of your account and all activity under it. PropSpera may suspend or terminate accounts that violate these Terms or engage in fraudulent or abusive behavior.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '6. Communications' : '6. Communications'}</h3>
            <p>{isFrTos ? 'En utilisant PropSpera, vous acceptez de recevoir des demandes liées à vos annonces et des communications relatives au service. Vous pouvez vous désabonner des communications marketing.' : 'By using PropSpera, you agree to receive inquiries related to your listings and consent to receiving service-related communications. You may opt out of marketing communications.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '7. Tarifs et monétisation' : '7. Fees and Monetization'}</h3>
            <p>{isFrTos ? 'PropSpera peut actuellement offrir un accès gratuit. Nous nous réservons le droit d’introduire des fonctionnalités payantes ou de modifier les tarifs avec un préavis.' : 'PropSpera may currently offer free access. We reserve the right to introduce paid features or modify pricing with prior notice.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '8. Propriété intellectuelle' : '8. Intellectual Property'}</h3>
            <p>{isFrTos ? 'Tout le contenu de la plateforme (hors annonces utilisateurs) est la propriété de PropSpera. Vous ne pouvez pas copier, distribuer ou reproduire le contenu sans autorisation.' : 'All platform content (excluding user listings) is owned by PropSpera. You may not copy, distribute, or reproduce platform content without permission.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '9. Licence sur le contenu utilisateur' : '9. User Content License'}</h3>
            <p>{isFrTos ? 'En publiant du contenu (annonces, images, descriptions), vous accordez à PropSpera le droit de les afficher, promouvoir et utiliser à des fins marketing. Vous conservez la propriété de votre contenu.' : 'By posting content (listings, images, descriptions), you grant PropSpera the right to display and promote your listings and use content for marketing purposes. You retain ownership of your content.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '10. Limitation de responsabilité' : '10. Limitation of Liability'}</h3>
            <p>{isFrTos ? 'PropSpera est une plateforme marketplace fournie "en l’état". Nous ne sommes pas responsables des transactions entre utilisateurs, des pertes liées aux annonces, ni des actions frauduleuses de tiers. Les utilisateurs interagissent à leurs propres risques.' : 'PropSpera is a marketplace platform provided "as is". We are not responsible for transactions between users, losses arising from reliance on listings, or fraudulent actions by third parties. Users engage with each other at their own risk.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '11. Résiliation' : '11. Termination'}</h3>
            <p>{isFrTos ? 'Nous pouvons suspendre ou résilier votre compte si vous enfreignez ces Conditions, commettez une fraude ou si votre activité présente un risque pour d’autres utilisateurs.' : 'We may suspend or terminate your account if you violate these Terms, engage in fraud or misuse the platform, or if your activity poses risk to other users.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '12. Modifications des Conditions' : '12. Changes to Terms'}</h3>
            <p>{isFrTos ? 'Nous pouvons mettre à jour ces Conditions périodiquement. Les utilisateurs seront informés des changements importants.' : 'We may update these Terms periodically. Users will be notified of significant changes.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '13. Droit applicable' : '13. Governing Law'}</h3>
            <p>{isFrTos ? 'Ces Conditions sont régies par les lois de la République du Rwanda.' : 'These Terms are governed by the laws of the Republic of Rwanda.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrTos ? '14. Contact' : '14. Contact'}</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p>📧 <a href="mailto:hello@propspera.com" className="text-blue-600 hover:underline font-medium">hello@propspera.com</a></p>
            </div>
            <p className="mt-3 text-xs text-gray-500">{isFrTos ? 'En utilisant PropSpera, vous reconnaissez avoir lu, compris et accepté ces Conditions.' : 'By using PropSpera, you acknowledge that you have read, understood, and agreed to these Terms.'}</p>
          </section>
 
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
 
// ── End TermsOfServiceModal ─────────────────────────────────────────── ───────────────────────────────────────────
 
// ── Inline PrivacyPolicyModal ────────────────────────────────────────
 
interface PrivacyPolicyModalProps { onClose: () => void; }
 
const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const isFrPp = language === 'fr';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden animate-slide-up flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('privacyPolicy')}</h2>
              <p className="text-blue-200 text-sm mt-0.5">{isFrPp ? 'Dernière mise à jour : 28 mars 2026' : 'Last updated: March 28, 2026'}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm text-gray-700 leading-relaxed">
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-1">{isFrPp ? '1. Introduction' : '1. Introduction'}</h3>
            <p>{isFrPp ? 'Bienvenue sur PropSpera ("nous", "notre", "nos"). PropSpera est une plateforme numérique qui met en relation acheteurs, vendeurs, propriétaires et agents immobiliers.' : 'Welcome to PropSpera ("we", "our", "us"). PropSpera is a digital platform that connects property buyers, sellers, landlords, and agents.'}</p>
            <p className="mt-2">{isFrPp ? 'Nous nous engageons à protéger vos données personnelles et à respecter votre vie privée. Cette Politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme.' : 'We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.'}</p>
            <p className="mt-2">{isFrPp ? 'En accédant à PropSpera ou en l’utilisant, vous acceptez les termes de cette Politique de confidentialité.' : 'By accessing or using PropSpera, you agree to the terms of this Privacy Policy.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '2. Informations que nous collectons' : '2. Information We Collect'}</h3>
            <h4 className="font-semibold text-gray-800 mb-1">{isFrPp ? '2.1 Informations que vous fournissez' : '2.1 Information You Provide'}</h4>
            <p className="mb-2">{isFrPp ? 'Nous pouvons collecter les informations personnelles suivantes :' : 'We may collect the following personal information:'}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              {isFrPp ? (<><li>Nom complet</li><li>Adresse e-mail</li><li>Numéro de téléphone</li><li>Identifiants de connexion</li><li>Annonces immobilières (descriptions, prix, images, localisation)</li><li>Messages envoyés via la plateforme</li><li>Toute autre information fournie volontairement</li></>) : (<><li>Full name</li><li>Email address</li><li>Phone number</li><li>Account login details</li><li>Property listings (descriptions, prices, images, location)</li><li>Messages sent through the platform</li><li>Any other information you voluntarily provide</li></>)}
            </ul>
            <h4 className="font-semibold text-gray-800 mt-3 mb-1">{isFrPp ? '2.2 Informations collectées automatiquement' : '2.2 Automatically Collected Information'}</h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              {isFrPp ? (<><li>Adresse IP</li><li>Type d’appareil et système d’exploitation</li><li>Type de navigateur</li><li>Pages visitées et interactions</li><li>Date et heure d’accès</li></>) : (<><li>IP address</li><li>Device type and operating system</li><li>Browser type</li><li>Pages visited and interactions</li><li>Date and time of access</li></>)}
            </ul>
            <h4 className="font-semibold text-gray-800 mt-3 mb-1">{isFrPp ? '2.3 Informations provenant de tiers' : '2.3 Information from Third Parties'}</h4>
            <p>{isFrPp ? 'Si vous vous connectez via des services tiers (ex. Google), nous pouvons recevoir votre nom, adresse e-mail et informations de profil.' : 'If you sign in using third-party services (e.g., Google), we may receive your name, email address, and profile information.'} <span className="text-gray-400 italic">({isFrPp ? 'Pas encore activé à cette date.' : 'Not yet activated as at this update.'})</span></p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '3. Comment nous utilisons vos informations' : '3. How We Use Your Information'}</h3>
            <p className="mb-2">{isFrPp ? 'Nous utilisons vos informations pour :' : 'We use your information to:'}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              {isFrPp ? (<><li>Créer et gérer votre compte</li><li>Faciliter les annonces et transactions immobilières</li><li>Mettre en relation acheteurs, vendeurs, propriétaires et agents</li><li>Permettre la communication entre utilisateurs</li><li>Fournir une assistance clientèle</li><li>Envoyer des notifications liées au service</li><li>Améliorer notre plateforme et l’expérience utilisateur</li><li>Détecter et prévenir la fraude ou les abus</li><li>Respecter les obligations légales</li></>) : (<><li>Create and manage your account</li><li>Facilitate property listings and transactions</li><li>Connect buyers, sellers, landlords, and agents</li><li>Enable communication between users</li><li>Provide customer support</li><li>Send service-related notifications</li><li>Improve our platform and user experience</li><li>Detect and prevent fraud or misuse</li><li>Comply with legal obligations</li></>)}
            </ul>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '4. Comment nous partageons vos informations' : '4. How We Share Your Information'}</h3>
            <p className="mb-2">{isFrPp ? 'Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations avec :' : 'We do not sell your personal data. We may share your information with:'}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              {isFrPp ? (<><li>Prestataires de services (ex. hébergement, analytique, stockage cloud)</li><li>Processeurs de paiement (le cas échéant)</li><li>Autres utilisateurs (ex. lors de la publication d’une annonce)</li><li>Autorités légales lorsque la loi l’exige</li></>) : (<><li>Service providers (e.g., hosting, analytics, cloud storage)</li><li>Payment processors (if applicable)</li><li>Other users (e.g., when you publish a listing or contact another user)</li><li>Legal authorities when required by law</li></>)}
            </ul>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '5. Cookies et technologies de suivi' : '5. Cookies and Tracking Technologies'}</h3>
            <p>{isFrPp ? 'Nous utilisons des cookies et technologies similaires pour améliorer l’expérience utilisateur, analyser l’utilisation de la plateforme et mémoriser les préférences. Vous pouvez contrôler les cookies via les paramètres de votre navigateur.' : 'We use cookies and similar technologies to enhance user experience, analyze platform usage, and remember user preferences. You can control cookies through your browser settings.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '6. Sécurité des données' : '6. Data Security'}</h3>
            <p className="mb-2">{isFrPp ? 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données, notamment des serveurs sécurisés, le chiffrement et des contrôles d’accès.' : 'We implement appropriate technical and organizational measures to protect your data, including secure servers, encryption where applicable, and access controls.'}</p>
            <p>{isFrPp ? 'Cependant, aucun système n’est totalement sécurisé et nous ne pouvons garantir une sécurité absolue.' : 'However, no system is completely secure, and we cannot guarantee absolute security.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '7. Conservation des données' : '7. Data Retention'}</h3>
            <p>{isFrPp ? 'Nous conservons vos données personnelles uniquement le temps nécessaire pour fournir nos services, respecter les obligations légales et résoudre les litiges. Vous pouvez demander la suppression de vos données à tout moment.' : 'We retain your personal data only as long as necessary to provide our services, comply with legal obligations, and resolve disputes. You may request deletion of your data at any time.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '8. Vos droits' : '8. Your Rights'}</h3>
            <p className="mb-2">{isFrPp ? 'Vous avez le droit de :' : 'You have the right to:'}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
              {isFrPp ? (<><li>Accéder à vos données personnelles</li><li>Corriger les informations inexactes</li><li>Demander la suppression de vos données</li><li>Vous opposer à certains traitements de données</li></>) : (<><li>Access your personal data</li><li>Correct inaccurate information</li><li>Request deletion of your data</li><li>Object to certain data processing</li></>)}
            </ul>
            <p className="mt-2">{isFrPp ? 'Pour exercer vos droits, contactez-nous à l’adresse ci-dessous.' : 'To exercise your rights, contact us at the email below.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '9. Transferts internationaux de données' : '9. International Data Transfers'}</h3>
            <p>{isFrPp ? 'Vos informations peuvent être stockées ou traitées sur des serveurs situés en dehors du Rwanda. Nous prenons des mesures raisonnables pour assurer la protection de vos données.' : 'Your information may be stored or processed on servers located outside Rwanda, including through third-party services. We take reasonable steps to ensure your data is protected.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '10. Confidentialité des enfants' : "10. Children’s Privacy"}</h3>
            <p>{isFrPp ? 'PropSpera n’est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données personnelles auprès des enfants.' : 'PropSpera is not intended for individuals under the age of 18. We do not knowingly collect personal data from children.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '11. Modifications de cette politique' : '11. Changes to This Privacy Policy'}</h3>
            <p>{isFrPp ? 'Nous pouvons mettre à jour cette Politique de confidentialité de temps à autre. Les modifications seront publiées sur cette page avec une date mise à jour.' : 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.'}</p>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '12. Nous contacter' : '12. Contact Us'}</h3>
            <p className="mb-2">{isFrPp ? 'Pour toute question concernant cette politique, veuillez nous contacter :' : 'If you have any questions or concerns about this Privacy Policy, please contact us at:'}</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p>📧 <a href="mailto:hello@propspera.com" className="text-blue-600 hover:underline font-medium">hello@propspera.com</a></p>
              <p>🌐 <a href="https://propspera.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">propspera.com</a></p>
            </div>
          </section>
 
          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{isFrPp ? '13. Consentement' : '13. Consent'}</h3>
            <p>{isFrPp ? 'En utilisant PropSpera, vous consentez aux termes de cette Politique de confidentialité.' : 'By using PropSpera, you consent to the terms of this Privacy Policy.'}</p>
          </section>
 
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
 
// ── End PrivacyPolicyModal ──────────────────────────────────────────── ────────────────────────────────────────────
 
// ── Inline PWA Install Prompt ──────────────────────────────────────────
const InstallPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = React.useState<any>(null);
  const [show, setShow] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
 
  React.useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios && !localStorage.getItem('pwa-dismissed')) {
      setTimeout(() => setShow(true), 4000);
    }
    const handler = (e: any) => {
      e.preventDefault();
      setInstallEvent(e);
      if (!localStorage.getItem('pwa-dismissed')) setTimeout(() => setShow(true), 4000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
 
  const handleInstall = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === 'accepted') setShow(false);
    }
    setShow(false);
  };
 
  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };
 
  if (!show) return null;
 
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">Install PropSpera</p>
            {isIOS ? (
              <p className="text-sm text-gray-500 mt-0.5">
                Tap <span className="font-medium">Share</span> then <span className="font-medium">"Add to Home Screen"</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-0.5">Add to your home screen for an app-like experience</p>
            )}
          </div>
          <button onClick={handleDismiss} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {!isIOS && (
          <div className="flex gap-2 mt-3">
            <button onClick={handleDismiss} className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">Not now</button>
            <button onClick={handleInstall} className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Install</button>
          </div>
        )}
        {isIOS && (
          <div className="mt-3 flex items-center gap-2 bg-blue-50 rounded-xl p-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            <p className="text-xs text-blue-700">Tap the share icon in Safari's bottom bar to install</p>
          </div>
        )}
      </div>
    </div>
  );
};
// ── End InstallPrompt ───────────────────────────────────────────────────
 
const AppLayout: React.FC = () => {
  // Auth state from context
  const { appUser, loading: authLoading, signOut, oauthError, clearOauthError } = useAuth();
  const { t } = useLanguage();
  
  // Secondary safety net: force the app to render after 10 seconds even if auth is stuck
  const [forceReady, setForceReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!forceReady) {
        console.warn('AppLayout safety timeout: forcing render after 10s');
        setForceReady(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);
  // Clear forceReady timer early if auth finishes
  useEffect(() => {
    if (!authLoading) setForceReady(true);
  }, [authLoading]);
  
  // Fetch properties and agents from database
  const { properties, loading: propertiesLoading, refetch: refetchProperties } = useProperties(appUser?.role);
  const { agents, loading: agentsLoading, refetch: refetchAgents } = useAgents();
  
  // Favorites from database
  const { 
    favoriteIds, 
    loading: favoritesLoading, 
    toggleFavorite, 
    isFavorite, 
    count: favoritesCount 
  } = useFavorites(appUser?.id || null);
 
  
  // Navigation state
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [currentView, setCurrentView] = useState<View>('home');
 
  // Conversations fetched from DB (replaces mockConversations)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  useEffect(() => {
    if (!appUser) return;
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${appUser.id},receiver_id.eq.${appUser.id}`)
        .order('created_at', { ascending: false });
 
      if (error || !data) return;
 
      // Collect unique other-person IDs (exclude self to avoid self-conversation entries)
      const otherIds = [...new Set(data.map((msg: any) =>
        msg.sender_id === appUser.id ? msg.receiver_id : msg.sender_id
      ).filter((id: string) => id !== appUser.id))];
 
      // Fetch all other users in one query
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, email, phone, avatar_url, role')
        .in('id', otherIds);
 
      const usersMap = new Map((usersData || []).map((u: any) => [u.id, u]));
 
      // Group messages into conversations keyed by the other person's id
      const convMap = new Map();
      for (const msg of data) {
        const otherId = msg.sender_id === appUser.id ? msg.receiver_id : msg.sender_id;
        const otherUser = usersMap.get(otherId);
        if (!convMap.has(otherId)) {
          const isAgentRole = appUser.role !== 'buyer';
          convMap.set(otherId, {
            id: `conv-${appUser.id}-${otherId}`,
            agent_id: isAgentRole ? appUser.id : otherId,
            buyer_id: isAgentRole ? otherId : appUser.id,
            // Attach full user objects so names/avatars show in panel
            agent: isAgentRole ? appUser : otherUser,
            buyer: isAgentRole ? otherUser : appUser,
            property_id: msg.property_id,
            last_message_at: msg.created_at,
            created_at: msg.created_at,
            // Store preview in unread_count sibling — rendered in MessagingPanel as conv.last_message
            last_message: msg.content,
            unread_count: (!msg.read && msg.receiver_id === appUser.id) ? 1 : 0,
          });
        } else {
          const conv = convMap.get(otherId);
          if (!msg.read && msg.receiver_id === appUser.id) {
            conv.unread_count = (conv.unread_count || 0) + 1;
          }
        }
      }
      setConversations(Array.from(convMap.values()));
    };
 
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [appUser]);
  
  // Property filter state
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    property_type: 'all',
    listing_type: 'all',
    bedrooms: 'any',
    neighborhood: '',
    verified_only: false
  });
 
  // Agent filter state
  const [agentFilters, setAgentFilters] = useState<AgentFilterState>(defaultAgentFilters);
  
  // Compare state
  const [compareIds, setCompareIds] = useState<string[]>([]);
 
  // Map view state
  const [searchViewMode, setSearchViewMode] = useState<SearchViewMode>('grid');
  const [hoveredMapProperty, setHoveredMapProperty] = useState<string | null>(null);
 
 
  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const [agentSignupIntent, setAgentSignupIntent] = useState(false);

  // When an OAuth error is set (e.g. Google sign-in provisioning failure),
  // automatically open the login modal so the user sees the error message.
  useEffect(() => {
    if (oauthError) {
      setAuthModalView('login');
      setAgentSignupIntent(false);
      setShowAuthModal(true);
    }
  }, [oauthError]);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAgentDashboard, setShowAgentDashboard] = useState(false);
  const [showAgentSignup, setShowAgentSignup] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messageContext, setMessageContext] = useState<{ agent: Agent; property?: Property } | null>(null);
  const [successModal, setSuccessModal] = useState<{ title: string; message: string; type: 'success' | 'pending' } | null>(null);
  const [inquiryProperty, setInquiryProperty] = useState<Property | null>(null);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
 
  
  // Refs
  const searchSectionRef = useRef<HTMLDivElement>(null);
 
 
  // Get all verified agents
  const verifiedAgents = useMemo(() => {
    return agents.filter(a => 
      a.verification_status === 'approved' && (a as any).is_active !== false
    );
  }, [agents]);
 
  // Extract unique specializations from all agents
  const availableSpecializations = useMemo(() => {
    const specSet = new Set<string>();
    verifiedAgents.forEach(agent => {
      agent.specializations.forEach(spec => specSet.add(spec));
    });
    return Array.from(specSet).sort();
  }, [verifiedAgents]);
 
  // Available locations (neighborhoods)
  const availableLocations = useMemo(() => {
    return [...neighborhoods].sort();
  }, []);
 
  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let result = verifiedAgents.filter(agent => {
      if (agentFilters.searchQuery) {
        const query = agentFilters.searchQuery.toLowerCase();
        const nameMatch = agent.user?.full_name?.toLowerCase().includes(query) || false;
        const companyMatch = agent.company_name?.toLowerCase().includes(query) || false;
        const bioMatch = agent.bio?.toLowerCase().includes(query) || false;
        const specMatch = agent.specializations.some(s => s.toLowerCase().includes(query));
        if (!nameMatch && !companyMatch && !bioMatch && !specMatch) return false;
      }
 
      if (agentFilters.specialization !== 'all') {
        if (!agent.specializations.some(s => 
          s.toLowerCase() === agentFilters.specialization.toLowerCase()
        )) return false;
      }
 
      if (agent.years_experience < agentFilters.minExperience) return false;
      if (agentFilters.maxExperience < 30 && agent.years_experience > agentFilters.maxExperience) return false;
 
      if (agentFilters.minRating > 0 && agent.rating < agentFilters.minRating) return false;
 
      if (agentFilters.location !== 'all') {
        const agentProperties = properties.filter(p => p.agent_id === agent.id);
        const hasLocationMatch = agentProperties.some(p => 
          p.neighborhood?.toLowerCase() === agentFilters.location.toLowerCase()
        );
        const companyLocationMatch = agent.company_name?.toLowerCase().includes(agentFilters.location.toLowerCase()) || false;
        const bioLocationMatch = agent.bio?.toLowerCase().includes(agentFilters.location.toLowerCase()) || false;
        if (!hasLocationMatch && !companyLocationMatch && !bioLocationMatch) {
          // If no direct match, still show agents (they may serve the area)
        }
      }
 
      return true;
    });
 
    switch (agentFilters.sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        result.sort((a, b) => b.years_experience - a.years_experience);
        break;
      case 'listings':
        result.sort((a, b) => b.total_listings - a.total_listings);
        break;
      case 'name':
        result.sort((a, b) => (a.user?.full_name || '').localeCompare(b.user?.full_name || ''));
        break;
    }
 
    return result;
  }, [verifiedAgents, agentFilters, properties]);
 
  // Filter properties
  // ── SEO: Sync title, meta, and URL on every filter/view change ────────────
  useEffect(() => {
    if (currentView === 'search') {
      applySEOMeta(buildSEOTitle(filters), buildSEOMeta(filters));
      applySEOUrl(filters);
    } else if (currentView === 'home') {
      document.title = 'PropSpera — Real Estate in Kigali, Rwanda';
      let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
      m.content = "PropSpera is Rwanda's leading real estate platform. Browse properties for sale and rent in Kigali. Connect with verified agents today.";
      window.history.replaceState({}, '', window.location.pathname.replace(/\?.*$/, ''));
    } else if (currentView === 'agents') {
      document.title = 'Verified Real Estate Agents in Kigali | PropSpera';
    }
  }, [currentView, filters]);
 
  // ── URL params → filter state on first mount ──────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const propertyType = params.get('propertyType');
    const location = params.get('location');
    if (type || propertyType || location) {
      setCurrentView('search');
      setFilters(prev => ({
        ...prev,
        ...(type ? { listing_type: type as any } : {}),
        ...(propertyType ? { property_type: propertyType as any } : {}),
        ...(location ? { neighborhood: decodeURIComponent(location) } : {}),
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
    const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      if (appUser?.role === 'admin') {
        // Admins see all properties
      } else if (appUser?.role === 'agent') {
        if (property.status !== 'approved') return false;
      } else {
        if (property.status !== 'approved') return false;
      }
      
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery = 
          property.title.toLowerCase().includes(query) ||
          property.neighborhood?.toLowerCase().includes(query) ||
          property.property_type.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      
      if (filters.property_type && filters.property_type !== 'all') {
        if (property.property_type !== filters.property_type) return false;
      }
      
      if (filters.listing_type && filters.listing_type !== 'all') {
        if (property.listing_type !== filters.listing_type) return false;
      }
      
      if (filters.bedrooms && filters.bedrooms !== 'any') {
        if ((property.bedrooms || 0) < filters.bedrooms) return false;
      }
      
      if (filters.neighborhood) {
        if (property.neighborhood !== filters.neighborhood) return false;
      }
      
      if (filters.min_price && property.price < filters.min_price) return false;
      if (filters.max_price && property.price > filters.max_price) return false;
      
      if (filters.verified_only) {
        if (property.agent?.verification_status !== 'approved') return false;
      }
      
      return true;
    });
  }, [properties, filters, appUser]);
 
  // Compare properties resolved
  const compareProperties = useMemo(() => {
    return compareIds
      .map(id => properties.find(p => p.id === id))
      .filter((p): p is Property => p !== undefined);
  }, [compareIds, properties]);
 
 
  // Handlers
  const openAuthModal = (view: 'login' | 'signup' = 'login', intent?: 'agent') => {
    setAuthModalView(view);
    setAgentSignupIntent(intent === 'agent');
    setShowAuthModal(true);
  };
 
  const handleLogout = async () => {
    await signOut();
    setActiveNav('home');
    setCurrentView('home');
  };
 
  const handleNavigation = (item: NavItem) => {
    setActiveNav(item);
    
    switch (item) {
      case 'home':
        setCurrentView('home');
        break;
      case 'search':
        setCurrentView('search');
        break;
      case 'messages':
        if (!appUser) {
          openAuthModal('login');
        } else {
          setShowMessaging(true);
        }
        break;
      case 'admin':
        if (appUser?.role === 'admin') {
          setShowAdminDashboard(true);
        }
        break;
      case 'add':
        if (appUser?.role === 'agent') {
          setShowAgentDashboard(true);
        }
        break;
      case 'profile':
        if (!appUser) {
          openAuthModal('login');
        }
        break;
    }
  };
 
  const handleHeaderNavigate = (view: string) => {
    switch (view) {
      case 'home':
        setCurrentView('home');
        setActiveNav('home');
        break;
      case 'search':
        setFilters(prev => ({ ...prev, listing_type: 'sale' }));
        setCurrentView('search');
        setActiveNav('search');
        break;
      case 'search-rent':
        setFilters(prev => ({ ...prev, listing_type: 'rent' }));
        setCurrentView('search');
        setActiveNav('search');
        break;
      case 'agents':
        setCurrentView('agents');
        setActiveNav('home');
        break;
      case 'favorites':
        handleFavoritesClick();
        break;
    }
  };
 
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    setCurrentView('search');
    setActiveNav('search');
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
 
  const handleBrowseListings = () => {
    setCurrentView('search');
    setActiveNav('search');
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
 
  const handleViewAllAgents = () => {
    setAgentFilters(defaultAgentFilters);
    setCurrentView('agents');
  };
 
  const handleSelectNeighborhood = (neighborhood: string) => {
    setFilters(prev => ({ ...prev, neighborhood }));
    setCurrentView('search');
    setActiveNav('search');
  };
 
  const handleToggleFavorite = async (propertyId: string) => {
    if (!appUser) {
      openAuthModal('login');
      return;
    }
    await toggleFavorite(propertyId);
  };
 
  const handleFavoritesClick = () => {
    if (!appUser) {
      openAuthModal('login');
      return;
    }
    setCurrentView('favorites');
    setActiveNav('home');
  };
 
  // Compare handlers
  const handleToggleCompare = (propertyId: string) => {
    setCompareIds(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev; // Don't add more than max
      }
      return [...prev, propertyId];
    });
  };
 
  const handleRemoveFromCompare = (propertyId: string) => {
    setCompareIds(prev => prev.filter(id => id !== propertyId));
  };
 
  const handleCompareClick = () => {
    if (compareIds.length > 0) {
      setCurrentView('compare');
    }
  };
 
  const handleCompareClose = () => {
    setCurrentView('search');
    setActiveNav('search');
  };
 
  const handleCompareAddMore = () => {
    setCurrentView('search');
    setActiveNav('search');
  };
 
 
  const handleContactProperty = (property: Property) => {
 
    //if (!appUser) {
    //  openAuthModal('login');
    //  return;
    //}
    setInquiryProperty(property);
    setSelectedProperty(null);
  };
 
 
  const handleInquirySuccess = () => {
    setInquiryProperty(null);
    setSuccessModal({
      title: 'Inquiry Sent!',
      message: 'Your message has been sent to the agent. They will contact you soon.',
      type: 'success'
    });
  };
 
  const handleContactAgent = (agent: Agent) => {
    //if (!appUser) {
    //  openAuthModal('login');
    //  return;
    //}
    setMessageContext({ agent });
    setShowMessaging(true);
    setSelectedAgent(null);
  };
 
  const handleBecomeAgent = () => {
    if (!appUser) {
      openAuthModal('signup', 'agent');
      return;
    }
    setShowAgentSignup(true);
  };
 
  const handleAgentSignupSuccess = () => {
    setShowAgentSignup(false);
    setSuccessModal({
      title: 'Application Submitted!',
      message: 'Your agent application is under review. We\'ll notify you within 24-48 hours.',
      type: 'pending'
    });
  };
 
  const handleAddPropertySuccess = () => {
    setShowAddProperty(false);
    setSuccessModal({
      title: 'Listing Submitted!',
      message: 'Your property listing is pending admin approval. It will be live once approved.',
      type: 'pending'
    });
    refetchProperties();
  };
 
  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
 
  const currentUser = appUser ? {
    ...appUser,
    avatar_url: appUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(appUser.full_name)}&background=2563eb&color=fff`
  } : null;
 
  // Show loading state while checking auth (but never permanently - forceReady is the safety net)
  if (authLoading && !forceReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
 
 
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        unreadMessages={unreadMessages}
        favoritesCount={favoritesCount}
        compareCount={compareIds.length}
        onMenuClick={() => {}}
        onMessagesClick={() => appUser ? setShowMessaging(true) : openAuthModal('login')}
        onFavoritesClick={handleFavoritesClick}
        onCompareClick={handleCompareClick}
        onProfileClick={handleLogout}
        onAccountSettingsClick={appUser ? () => setShowProfilePage(true) : undefined}
        onAdminClick={appUser?.role === 'admin' ? () => setShowAdminDashboard(true) : undefined}
        onAgentDashboardClick={appUser?.role === 'agent' ? () => setShowAgentDashboard(true) : undefined}
        onLoginClick={() => openAuthModal('login')}
        onNavigate={handleHeaderNavigate}
        onOpenNotificationPreferences={() => {
          if (!appUser) { openAuthModal('login'); return; }
          setShowNotificationPrefs(true);
        }}
        logoUrl={undefined}
      />
 
 
 
 
      {/* Main Content */}
      <main className="pb-20 lg:pb-0">
 
        {currentView === 'home' && (
          <>
            {/* Hero Section */}
            <HeroSection
              onSearch={handleSearch}
              onBrowseListings={handleBrowseListings}
              onBecomeAgent={handleBecomeAgent}
              agentCount={verifiedAgents.length}
              listingCount={properties.filter(p => p.status === 'approved').length}
            />
 
            {/* Featured Properties */}
            <FeaturedProperties
              properties={properties}
              favorites={favoriteIds}
              onSelectProperty={setSelectedProperty}
              onToggleFavorite={handleToggleFavorite}
              onViewAll={handleBrowseListings}
              onCompare={handleToggleCompare}
              compareIds={compareIds}
            />
 
            {/* Neighborhoods */}
            <NeighborhoodSection
              properties={properties}
              onSelectNeighborhood={handleSelectNeighborhood}
            />
 
            {/* Agents Section */}
            <AgentsSection
              agents={agents}
              onSelectAgent={setSelectedAgent}
              onContactAgent={handleContactAgent}
              onBecomeAgent={handleBecomeAgent}
              onViewAllAgents={handleViewAllAgents}
            />
 
            {/* Footer */}
            <Footer onNavigate={handleHeaderNavigate} onBecomeAgent={handleBecomeAgent} onLogin={() => openAuthModal("login")} onContact={() => setShowContact(true)} onPrivacyPolicy={() => setShowPrivacyPolicy(true)} onTermsOfService={() => setShowTermsOfService(true)} onFAQ={() => setShowFAQ(true)} onHelpCenter={() => setShowHelpCenter(true)} />
          </>
        )}
 
        {currentView === 'search' && (
          <div ref={searchSectionRef}>
            {/* Header & Filters */}
            <div className={searchViewMode === 'map' ? 'max-w-7xl mx-auto px-4 pt-6 pb-2' : 'max-w-7xl mx-auto px-4 py-6'}>
              <div className="flex items-center justify-between mb-4">
                {/* SEO H1 rendered below in SEOContentBlock */}
                <span className="sr-only">{t('propertiesInKigali')}</span>
                {/* View Toggle */}
                <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
                  <button
                    onClick={() => setSearchViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      searchViewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Grid View"
                  >
                    <GridIcon size={16} />
                    <span className="hidden md:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setSearchViewMode('map')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      searchViewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Map View"
                  >
                    <MapIcon size={16} />
                    <span className="hidden md:inline">Map</span>
                  </button>
                  <button
                    onClick={() => setSearchViewMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      searchViewMode === 'split' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Split View"
                  >
                    <SplitIcon size={16} />
                    <span className="hidden md:inline">Split</span>
                  </button>
                </div>
              </div>
 
              {/* Mobile view toggle */}
              <div className="flex sm:hidden items-center gap-2 mb-4">
                {(['grid', 'map', 'split'] as SearchViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSearchViewMode(mode)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      searchViewMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {mode === 'grid' && <GridIcon size={14} />}
                    {mode === 'map' && <MapIcon size={14} />}
                    {mode === 'split' && <SplitIcon size={14} />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
 
              <SearchFiltersComponent
                filters={filters}
                onFilterChange={setFilters}
                resultCount={filteredProperties.length}
              />
            </div>
 
            {/* SEO: Dynamic H1, paragraph, internal links (inlined to avoid TDZ) */}
            {(() => {
              const _lt = filters.listing_type;
              const _pt = filters.property_type;
              const _nb = filters.neighborhood;
              const _cnt = filteredProperties.length;
              const _typeMap: Record<string, string> = { house: 'Houses', apartment: 'Apartments', villa: 'Villas', commercial: 'Commercial Properties', land: 'Land', all: 'Properties' };
              const _type = _typeMap[_pt] ?? 'Properties';
              const _ll = _lt === 'rent' ? 'for Rent' : _lt === 'sale' ? 'for Sale' : '';
              const _loc = _nb || 'Kigali';
              const _h1 = [_type, _ll, `in ${_loc}`].filter(Boolean).join(' ');
              const _showP = _lt !== 'all' || _pt !== 'all' || _nb !== '';
              let _para: string | null = null;
              if (_nb && _lt === 'rent') _para = `Browse ${_cnt} verified ${_type.toLowerCase()} for rent in ${_nb}, Kigali. View photos, prices, and contact agents directly on PropSpera.`;
              else if (_nb && _lt === 'sale') _para = `Discover ${_cnt} ${_type.toLowerCase()} for sale in ${_nb}, Kigali. Compare listings and connect with verified agents on PropSpera.`;
              else if (_nb) _para = `Explore ${_cnt} properties in ${_nb}, Kigali — apartments, houses, villas and more. Find your next home or investment on PropSpera.`;
              else if (_lt === 'rent') _para = `Browse ${_cnt} verified ${_type.toLowerCase()} for rent across Kigali, including Kacyiru, Nyarutarama, Kimihurura and Gisozi. Find your next home on PropSpera.`;
              else if (_lt === 'sale') _para = `Discover ${_cnt} ${_type.toLowerCase()} for sale in Kigali. From starter homes to luxury villas — compare listings and contact agents on PropSpera.`;
              const _links = [
                { label: 'Apartments for Rent in Kigali', params: '?type=rent&propertyType=apartment' },
                { label: 'Houses for Sale in Kigali', params: '?type=sale&propertyType=house' },
                { label: 'Villas in Nyarutarama', params: '?location=Nyarutarama' },
                { label: 'Land for Sale in Kigali', params: '?type=sale&propertyType=land' },
                { label: 'Commercial Property in Kigali', params: '?propertyType=commercial' },
              ];
              return (
                <div className="max-w-7xl mx-auto px-4 pt-2 pb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{_h1}</h1>
                  {_showP && _para && (
                    <p className="text-sm text-gray-500 mb-3 max-w-2xl leading-relaxed">{_para}</p>
                  )}
                  {_lt === 'all' && _pt === 'all' && !_nb && (
                    <nav aria-label="Browse property categories" className="flex flex-wrap gap-2 mb-2">
                      {_links.map(link => (
                        <a key={link.params} href={link.params}
                          onClick={e => e.preventDefault()}
                          className="text-xs text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 transition-colors">
                          {link.label}
                        </a>
                      ))}
                    </nav>
                  )}
                </div>
              );
            })()}
 
            {/* Content based on view mode */}
            {propertiesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">{t('loadingProperties')}</p>
                </div>
              </div>
            ) : (
              <>
                {/* GRID VIEW */}
                {searchViewMode === 'grid' && (
                  <div className="max-w-7xl mx-auto px-4 pb-6">
                    {filteredProperties.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((property) => (
                          <PropertyCard
                            key={property.id}
                            property={property}
                            onSelect={setSelectedProperty}
                            onFavorite={handleToggleFavorite}
                            isFavorite={isFavorite(property.id)}
                            onCompare={handleToggleCompare}
                            isInCompare={compareIds.includes(property.id)}
                            compareCount={compareIds.length}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <SearchIcon size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noPropertiesFound')}</h3>
                        <p className="text-gray-500 mb-4">{t('tryAdjustingFilters')}</p>
                        <button
                          onClick={() => setFilters({ query: '', property_type: 'all', listing_type: 'all', bedrooms: 'any', neighborhood: '', verified_only: false })}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          {t('clearFilters')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
 
                {/* MAP VIEW */}
                {searchViewMode === 'map' && (
                  <div className="relative" style={{ height: 'calc(100vh - 220px)' }}>
                    <PropertyMap
                      properties={filteredProperties}
                      onSelectProperty={setSelectedProperty}
                      onFavorite={handleToggleFavorite}
                      isFavorite={isFavorite}
                      className="h-full"
                      highlightedPropertyId={hoveredMapProperty}
                    />
                  </div>
                )}
 
                {/* SPLIT VIEW */}
                {searchViewMode === 'split' && (
                  <div className="flex" style={{ height: 'calc(100vh - 220px)' }}>
                    {/* Left: Property List */}
                    <div className="w-full lg:w-[45%] overflow-y-auto border-r border-gray-200 bg-white">
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-gray-500 font-medium px-1">
                          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                        </p>
                        {filteredProperties.length > 0 ? (
                          filteredProperties.map((property) => (
                            <div
                              key={property.id}
                              className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                hoveredMapProperty === property.id
                                  ? 'border-blue-300 bg-blue-50 shadow-md'
                                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                              }`}
                              onClick={() => setSelectedProperty(property)}
                              onMouseEnter={() => setHoveredMapProperty(property.id)}
                              onMouseLeave={() => setHoveredMapProperty(null)}
                            >
                              <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-28 h-24 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    property.listing_type === 'sale' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {property.listing_type === 'sale' ? 'SALE' : 'RENT'}
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(property.id); }}
                                    className="flex-shrink-0"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite(property.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={isFavorite(property.id) ? 'text-pink-500' : 'text-gray-400'}>
                                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                  </button>
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm line-clamp-1 mt-1">{property.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{property.neighborhood}, Kigali</p>
                                <p className="text-sm font-bold text-blue-600 mt-1">
                                  {new Intl.NumberFormat('en-RW').format(property.price)} RWF
                                  {property.listing_type === 'rent' && <span className="text-gray-400 font-normal">/mo</span>}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  {property.bedrooms ? <span>{property.bedrooms} bed</span> : null}
                                  {property.bathrooms ? <span>{property.bathrooms} bath</span> : null}
                                  {property.area_sqm ? <span>{property.area_sqm} m²</span> : null}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-gray-500 text-sm">No properties match your filters</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Right: Map */}
                    <div className="hidden lg:block lg:w-[55%]">
                      <PropertyMap
                        properties={filteredProperties}
                        onSelectProperty={setSelectedProperty}
                        onFavorite={handleToggleFavorite}
                        isFavorite={isFavorite}
                        className="h-full"
                        highlightedPropertyId={hoveredMapProperty}
                        onPropertyHover={setHoveredMapProperty}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
 
 
        {currentView === 'agents' && (
          <div className="min-h-screen bg-gray-50">
            {/* Agent Page Hero */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>
 
              <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 relative">
                <div className="text-center max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <ShieldCheckIcon size={18} className="text-blue-200" />
                    <span className="text-blue-100 text-sm font-medium">All Agents Verified & Licensed</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Find Your Perfect Agent
                  </h1>
                  <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                    Browse our network of verified real estate professionals in Kigali. 
                    Filter by specialization, experience, and rating to find the right match.
                  </p>
 
                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <UsersIcon size={20} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-white">{verifiedAgents.length}</p>
                        <p className="text-xs text-blue-200">Verified Agents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <StarIcon size={20} filled className="text-amber-300" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-white">
                          {verifiedAgents.length > 0 
                            ? (verifiedAgents.reduce((sum, a) => sum + a.rating, 0) / verifiedAgents.length).toFixed(1) 
                            : '0'}
                        </p>
                        <p className="text-xs text-blue-200">Avg Rating</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <BuildingIcon size={20} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-white">
                          {verifiedAgents.reduce((sum, a) => sum + a.total_listings, 0)}
                        </p>
                        <p className="text-xs text-blue-200">Total Listings</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <MapPinIcon size={20} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-white">{neighborhoods.length}+</p>
                        <p className="text-xs text-blue-200">Areas Covered</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
 
            {/* Agent Search & Results */}
            <div className="max-w-7xl mx-auto px-4 py-8">
              {/* Search & Filters */}
              <AgentSearchFilters
                filters={agentFilters}
                onFilterChange={setAgentFilters}
                resultCount={filteredAgents.length}
                totalCount={verifiedAgents.length}
                availableSpecializations={availableSpecializations}
                availableLocations={availableLocations}
              />
 
              {/* Loading State */}
              {agentsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">{t('loadingAgents')}</p>
                  </div>
                </div>
              ) : filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                  {filteredAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onSelect={setSelectedAgent}
                      onContact={handleContactAgent}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UsersIcon size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    No agents match your current filters. Try adjusting your search criteria or clearing the filters.
                  </p>
                  <button
                    onClick={() => setAgentFilters(defaultAgentFilters)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
 
              {/* Become an Agent CTA */}
              <div className="mt-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      Are You a Real Estate Professional?
                    </h3>
                    <p className="text-emerald-100 max-w-xl">
                      Join PropSpera's network of verified agents. Get access to qualified leads, 
                      powerful listing tools, and a growing community of professionals.
                    </p>
                  </div>
                  <button
                    onClick={handleBecomeAgent}
                    className="px-8 py-3.5 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg whitespace-nowrap"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
 
            {/* Footer */}
            <Footer onNavigate={handleHeaderNavigate} onBecomeAgent={handleBecomeAgent} onLogin={() => openAuthModal("login")} onContact={() => setShowContact(true)} onPrivacyPolicy={() => setShowPrivacyPolicy(true)} onTermsOfService={() => setShowTermsOfService(true)} onFAQ={() => setShowFAQ(true)} onHelpCenter={() => setShowHelpCenter(true)} />
          </div>
        )}
 
        {currentView === 'favorites' && (
          <>
            <SavedProperties
              properties={properties}
              favoriteIds={favoriteIds}
              onSelectProperty={setSelectedProperty}
              onRemoveFavorite={handleToggleFavorite}
              onBrowseListings={handleBrowseListings}
              loading={favoritesLoading}
            />
            <Footer onNavigate={handleHeaderNavigate} onBecomeAgent={handleBecomeAgent} onLogin={() => openAuthModal("login")} onContact={() => setShowContact(true)} onPrivacyPolicy={() => setShowPrivacyPolicy(true)} onTermsOfService={() => setShowTermsOfService(true)} onFAQ={() => setShowFAQ(true)} onHelpCenter={() => setShowHelpCenter(true)} />
          </>
        )}
 
        {currentView === 'compare' && (
          <>
            <PropertyComparison
              properties={compareProperties}
              allProperties={properties}
              onRemove={handleRemoveFromCompare}
              onClose={handleCompareClose}
              onAddMore={handleCompareAddMore}
              onSelectProperty={setSelectedProperty}
            />
            <Footer onNavigate={handleHeaderNavigate} onBecomeAgent={handleBecomeAgent} onLogin={() => openAuthModal("login")} onContact={() => setShowContact(true)} onPrivacyPolicy={() => setShowPrivacyPolicy(true)} onTermsOfService={() => setShowTermsOfService(true)} onFAQ={() => setShowFAQ(true)} onHelpCenter={() => setShowHelpCenter(true)} />
          </>
        )}
      </main>
 
      {/* Floating Compare Bar */}
      {compareIds.length > 0 && currentView !== 'compare' && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4">
          <div className="bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-600/30 px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <ColumnsIcon size={20} />
              <span className="font-semibold text-sm sm:text-base">
                {compareIds.length} {compareIds.length === 1 ? 'property' : 'properties'} selected
              </span>
            </div>
            
            {/* Mini property thumbnails */}
            <div className="hidden sm:flex items-center gap-1">
              {compareProperties.slice(0, 3).map(p => (
                <div key={p.id} className="relative group">
                  <img 
                    src={p.images[0]} 
                    alt={p.title}
                    className="w-8 h-8 rounded-lg object-cover border-2 border-white/30"
                  />
                  <button
                    onClick={() => handleRemoveFromCompare(p.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XIcon size={8} />
                  </button>
                </div>
              ))}
            </div>
 
            <div className="flex items-center gap-2">
              <button
                onClick={handleCompareClick}
                disabled={compareIds.length < 2}
                className={`px-4 py-1.5 rounded-xl font-semibold text-sm transition-all ${
                  compareIds.length >= 2
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                    : 'bg-indigo-500 text-indigo-200 cursor-not-allowed'
                }`}
              >
                Compare{compareIds.length < 2 ? ` (${2 - compareIds.length} more)` : ''}
              </button>
              <button
                onClick={() => setCompareIds([])}
                className="w-8 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center transition-colors"
                title="Clear all"
              >
                <XIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Bottom Navigation (Mobile) */}
      <BottomNav
        activeItem={activeNav}
        onNavigate={handleNavigation}
        userRole={appUser?.role || null}
        unreadMessages={unreadMessages}
      />
 
      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => { setShowAuthModal(false); setAgentSignupIntent(false); clearOauthError(); }}
          initialView={authModalView}
          agentSignupIntent={agentSignupIntent}
          initialError={oauthError ?? undefined}
        />
      )}
 
      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onContact={handleContactProperty}
          onFavorite={handleToggleFavorite}
          isFavorite={isFavorite(selectedProperty.id)}
        />
      )}
 
      {/* Inquiry Modal */}
      {inquiryProperty && (
        <InquiryModal
          property={inquiryProperty}
          onClose={() => setInquiryProperty(null)}
          onSuccess={handleInquirySuccess}
        />
      )}
 
      {selectedAgent && (
        <AgentProfile
          agent={selectedAgent}
          properties={properties}
          onClose={() => setSelectedAgent(null)}
          onContact={handleContactAgent}
          onSelectProperty={(p) => {
            setSelectedAgent(null);
            setSelectedProperty(p);
          }}
          onLoginRequired={() => openAuthModal('login')}
        />
      )}
 
 
      {showMessaging && currentUser && (
        <MessagingPanel
          conversations={conversations}
          currentUser={currentUser}
          onClose={() => {
            setShowMessaging(false);
            setMessageContext(null);
          }}
          newMessageContext={messageContext}
        />
      )}
 
      {showAdminDashboard && (
        <AdminDashboard
          onClose={() => setShowAdminDashboard(false)}
        />
      )}
 
      {showAgentDashboard && (
        <AgentDashboard
          onClose={() => {
            setShowAgentDashboard(false);
            refetchProperties();
          }}
        />
      )}
 
      {showAgentSignup && (
        <AgentSignup
          onClose={() => setShowAgentSignup(false)}
          onSuccess={handleAgentSignupSuccess}
        />
      )}
 
      {showAddProperty && (
        <AddPropertyModal
          onClose={() => setShowAddProperty(false)}
          onSuccess={handleAddPropertySuccess}
        />
      )}
 
      {successModal && (
        <SuccessModal
          title={successModal.title}
          message={successModal.message}
          type={successModal.type}
          onClose={() => setSuccessModal(null)}
        />
      )}
 
      {/* Notification Preferences Modal */}
      {showNotificationPrefs && (
        <NotificationPreferences
          onClose={() => setShowNotificationPrefs(false)}
        />
      )}
 
      {/* User Profile / Account Settings Page */}
      {showProfilePage && (
        <UserProfilePage
          onClose={() => setShowProfilePage(false)}
          onLogout={handleLogout}
        />
      )}
      <InstallPrompt />
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showPrivacyPolicy && <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />}
      {showTermsOfService && <TermsOfServiceModal onClose={() => setShowTermsOfService(false)} />}
      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}
      {showHelpCenter && <HelpCenterModal onClose={() => setShowHelpCenter(false)} />}
    </div>
  );
};
 
export default AppLayout;