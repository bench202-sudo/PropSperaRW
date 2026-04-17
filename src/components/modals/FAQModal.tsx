import React from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { XIcon } from '@/components/icons/Icons';

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
 

export default FAQModal;
