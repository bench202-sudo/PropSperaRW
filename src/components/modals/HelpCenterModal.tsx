import React from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { XIcon } from '@/components/icons/Icons';

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
 

export default HelpCenterModal;
