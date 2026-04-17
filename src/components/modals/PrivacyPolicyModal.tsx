import React from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { XIcon } from '@/components/icons/Icons';

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
              <p>🌐 <a href="https://propspera.rw" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">propspera.rw</a></p>
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
 

export default PrivacyPolicyModal;
