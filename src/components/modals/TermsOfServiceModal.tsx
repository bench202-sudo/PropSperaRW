import React from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { XIcon } from '@/components/icons/Icons';

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
 

export default TermsOfServiceModal;
