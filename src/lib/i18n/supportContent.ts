import { Language } from './translations';

export interface HelpCenterBlock {
  title: string;
  body?: string;
  items?: string[];
  ordered?: boolean;
  footnote?: string;
  tone?: 'default' | 'warning';
}

export interface HelpCenterSection {
  icon: string;
  title: string;
  blocks: HelpCenterBlock[];
}

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subSections?: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
    note?: string;
  }>;
  links?: Array<{
    icon: string;
    label: string;
    href: string;
  }>;
  note?: string;
  warningTitle?: string;
  warningBullets?: string[];
}

export interface FAQSection {
  icon: string;
  title: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export interface SupportContent {
  helpCenter: {
    subtitle: string;
    intro: string;
    outro: string;
    sections: HelpCenterSection[];
  };
  privacyPolicy: {
    updatedLabel: string;
    sections: LegalSection[];
  };
  termsOfService: {
    updatedLabel: string;
    intro: string;
    sections: LegalSection[];
  };
  faq: {
    subtitle: string;
    intro: string;
    outro: string;
    sections: FAQSection[];
  };
}

export const supportContentByLanguage: Record<Language, SupportContent> = {
  en: {
    helpCenter: {
      subtitle: 'PropSpera Guides & Support',
      intro:
        'Welcome to the PropSpera Help Center. Here you will find guides to help you get started, list properties, and connect with agents or buyers.',
      outro:
        'PropSpera is designed to make real estate in Rwanda simple and efficient. If you need help at any step, we are here for you.',
      sections: [
        {
          icon: '🧭',
          title: 'Getting Started',
          blocks: [
            {
              title: 'How to create an account',
              ordered: true,
              items: [
                'Click Sign Up',
                'Choose Email or Google (COMING SOON)',
                'Enter your details',
                'Confirm your account',
              ],
              footnote:
                'To list properties, you must register as a Homeowner or Agent at account creation.',
            },
            {
              title: 'Do I need an account?',
              body:
                'You can browse properties without an account. However, you need an account to save listings, list properties, and access agent features.',
            },
          ],
        },
        {
          icon: '🏡',
          title: 'Listing Properties',
          blocks: [
            {
              title: 'How to list a property',
              ordered: true,
              items: [
                'Log in to your Agent account',
                'Go to Agent Dashboard',
                'Click Add Property',
                'Fill in title, price, location, and description',
                'Upload clear photos',
                'Click Publish',
              ],
              footnote: 'Your listing will appear once reviewed and approved.',
            },
            {
              title: 'Tips to get more inquiries',
              tone: 'warning',
              items: [
                'High-quality photos that are bright, clear, and show multiple angles',
                'A clear and detailed description',
                'Accurate pricing',
                'Fast responses to messages',
              ],
            },
            {
              title: 'Can I edit or delete my listing?',
              body:
                'Yes. Go to your dashboard, select your property, and click Edit or Delete.',
            },
          ],
        },
        {
          icon: '📲',
          title: 'Contacting Agents',
          blocks: [
            {
              title: 'How to contact an agent',
              ordered: true,
              items: [
                'Open a property listing',
                'Click Send Message for a direct message',
                'Click the WhatsApp icon to chat',
              ],
            },
            {
              title: 'What should I ask an agent?',
              items: [
                'Is the property still available?',
                'Can I schedule a visit?',
                'What are the payment terms?',
                'Are there additional costs?',
              ],
            },
          ],
        },
        {
          icon: '❤️',
          title: 'Saving & Comparing',
          blocks: [
            {
              title: 'How to save a property',
              ordered: true,
              items: [
                'Click the heart icon on the listing',
                'Access saved properties from your account',
              ],
            },
            {
              title: 'How to compare properties',
              ordered: true,
              items: [
                'Click the compare icon',
                'Add up to 3 properties',
                'View them side by side',
              ],
            },
          ],
        },
        {
          icon: '🔒',
          title: 'Safety & Trust',
          blocks: [
            {
              title: 'How to stay safe',
              items: [
                'Always visit the property in person',
                'Verify ownership and documentation',
                'Avoid sending money without a written agreement',
                'Be cautious of deals that seem too good to be true',
              ],
            },
            {
              title: 'How to report a listing or user',
              body:
                'If you suspect fraud or misleading information, contact us at hello@propspera.com.',
            },
          ],
        },
        {
          icon: '⚙️',
          title: 'Account & Technical Help',
          blocks: [
            {
              title: 'Forgot my password',
              ordered: true,
              items: [
                'Click Forgot Password on the login page',
                'Enter your email',
                'Follow the reset instructions',
              ],
            },
            {
              title: 'I am not receiving emails',
              body:
                'Check your spam or junk folder and confirm your email address is correct. If the issue continues, contact support.',
            },
            {
              title: 'How to contact support',
              body: 'Email: hello@propspera.com',
            },
          ],
        },
      ],
    },
    privacyPolicy: {
      updatedLabel: 'Last updated: March 28, 2026',
      sections: [
        {
          title: '1. Introduction',
          paragraphs: [
            'Welcome to PropSpera ("we", "our", "us"). PropSpera is a digital platform that connects property buyers, sellers, landlords, and agents.',
            'We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.',
            'By accessing or using PropSpera, you agree to the terms of this Privacy Policy.',
          ],
        },
        {
          title: '2. Information We Collect',
          subSections: [
            {
              title: '2.1 Information You Provide',
              paragraphs: ['We may collect the following personal information:'],
              bullets: [
                'Full name',
                'Email address',
                'Phone number',
                'Account login details',
                'Property listings (descriptions, prices, images, location)',
                'Messages sent through the platform',
                'Any other information you voluntarily provide',
              ],
            },
            {
              title: '2.2 Automatically Collected Information',
              bullets: [
                'IP address',
                'Device type and operating system',
                'Browser type',
                'Pages visited and interactions',
                'Date and time of access',
              ],
            },
            {
              title: '2.3 Information from Third Parties',
              paragraphs: [
                'If you sign in using third-party services such as Google, we may receive your name, email address, and profile information.',
              ],
              note: 'Not yet activated as at this update.',
            },
          ],
        },
        {
          title: '3. How We Use Your Information',
          paragraphs: ['We use your information to:'],
          bullets: [
            'Create and manage your account',
            'Facilitate property listings and transactions',
            'Connect buyers, sellers, landlords, and agents',
            'Enable communication between users',
            'Provide customer support',
            'Send service-related notifications',
            'Improve our platform and user experience',
            'Detect and prevent fraud or misuse',
            'Comply with legal obligations',
          ],
        },
        {
          title: '4. How We Share Your Information',
          paragraphs: ['We do not sell your personal data. We may share your information with:'],
          bullets: [
            'Service providers such as hosting, analytics, and cloud storage vendors',
            'Payment processors if applicable',
            'Other users when you publish a listing or contact another user',
            'Legal authorities when required by law',
          ],
        },
        {
          title: '5. Cookies and Tracking Technologies',
          paragraphs: [
            'We use cookies and similar technologies to enhance user experience, analyze platform usage, and remember user preferences. You can control cookies through your browser settings.',
          ],
        },
        {
          title: '6. Data Security',
          paragraphs: [
            'We implement appropriate technical and organizational measures to protect your data, including secure servers, encryption where applicable, and access controls.',
            'However, no system is completely secure, and we cannot guarantee absolute security.',
          ],
        },
        {
          title: '7. Data Retention',
          paragraphs: [
            'We retain your personal data only as long as necessary to provide our services, comply with legal obligations, and resolve disputes. You may request deletion of your data at any time.',
          ],
        },
        {
          title: '8. Your Rights',
          paragraphs: [
            'You have the right to:',
            'To exercise your rights, contact us at the email below.',
          ],
          bullets: [
            'Access your personal data',
            'Correct inaccurate information',
            'Request deletion of your data',
            'Object to certain data processing',
          ],
        },
        {
          title: '9. International Data Transfers',
          paragraphs: [
            'Your information may be stored or processed on servers located outside Rwanda, including through third-party services. We take reasonable steps to ensure your data is protected.',
          ],
        },
        {
          title: '10. Children\'s Privacy',
          paragraphs: [
            'PropSpera is not intended for individuals under the age of 18. We do not knowingly collect personal data from children.',
          ],
        },
        {
          title: '11. Changes to This Privacy Policy',
          paragraphs: [
            'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.',
          ],
        },
        {
          title: '12. Contact Us',
          paragraphs: ['If you have any questions or concerns about this Privacy Policy, please contact us at:'],
          links: [
            { icon: '📧', label: 'hello@propspera.com', href: 'mailto:hello@propspera.com' },
            { icon: '🌐', label: 'propspera.rw', href: 'https://propspera.rw' },
          ],
        },
        {
          title: '13. Consent',
          paragraphs: ['By using PropSpera, you consent to the terms of this Privacy Policy.'],
        },
      ],
    },
    termsOfService: {
      updatedLabel: 'Last updated: March 28, 2026',
      intro:
        'Welcome to PropSpera. These Terms of Service govern your access to and use of the PropSpera platform. By using PropSpera, you agree to these Terms.',
      sections: [
        {
          title: '1. Overview of the Platform',
          paragraphs: [
            'PropSpera is a digital marketplace that connects:',
            'PropSpera facilitates connections but is not a party to any transaction between users.',
          ],
          bullets: ['Real estate agents', 'Property owners', 'Buyers and tenants'],
        },
        {
          title: '2. User Roles and Responsibilities',
          subSections: [
            {
              title: '2.1 Agents and Property Owners',
              paragraphs: [
                'If you are listing a property, you agree to:',
                'You are solely responsible for the legality of your listings and any agreements made with buyers or tenants.',
              ],
              bullets: [
                'Provide accurate, complete, and up-to-date information',
                'Only list properties you are authorized to represent or sell',
                'Ensure property details such as price, location, and features are truthful',
                'Ensure images reflect the actual property',
                'Respond to inquiries in a professional manner',
              ],
            },
            {
              title: '2.2 Buyers and Tenants',
              paragraphs: [
                'If you are using PropSpera to search for property, you agree to provide accurate information when contacting agents and conduct your own due diligence before entering any transaction.',
                'PropSpera does not guarantee property availability, accuracy of listings, or the outcome of negotiations.',
              ],
            },
          ],
        },
        {
          title: '3. Property Listings Policy',
          paragraphs: [
            'All listings must be genuine, represent real existing properties, and include accurate pricing and location. The following are strictly prohibited:',
            'PropSpera reserves the right to remove any listing without notice and suspend accounts associated with suspicious activity.',
          ],
          bullets: [
            'Fake or duplicate listings',
            'Listings intended to scam or mislead users',
            'Misrepresentation of ownership or authorization',
            'Use of stolen images or content',
          ],
        },
        {
          title: '4. Anti-Fraud and Safety Policy',
          paragraphs: ['PropSpera takes fraud seriously. You agree not to:'],
          bullets: [
            'Post fake properties or bait listings',
            'Request or accept payments outside secure and verifiable channels without proper documentation',
            'Impersonate another agent, agency, or property owner',
            'Use the platform to deceive, exploit, or defraud users',
          ],
          warningTitle: 'Warning to Users',
          warningBullets: [
            'Always verify property ownership and documents',
            'Do not make payments without proper agreements',
            'Be cautious of deals that seem too good to be true',
          ],
        },
        {
          title: '4.1 Reporting Fraud',
          paragraphs: [
            'Report suspicious activity to hello@propspera.com. PropSpera may investigate, suspend or permanently ban offending users, and cooperate with law enforcement if necessary.',
          ],
        },
        {
          title: '5. User Accounts',
          paragraphs: [
            'You are responsible for maintaining the confidentiality of your account and all activity under it. PropSpera may suspend or terminate accounts that violate these Terms or engage in fraudulent or abusive behavior.',
          ],
        },
        {
          title: '6. Communications',
          paragraphs: [
            'By using PropSpera, you agree to receive inquiries related to your listings and consent to receiving service-related communications. You may opt out of marketing communications.',
          ],
        },
        {
          title: '7. Fees and Monetization',
          paragraphs: [
            'PropSpera may currently offer free access. We reserve the right to introduce paid features or modify pricing with prior notice.',
          ],
        },
        {
          title: '8. Intellectual Property',
          paragraphs: [
            'All platform content excluding user listings is owned by PropSpera. You may not copy, distribute, or reproduce platform content without permission.',
          ],
        },
        {
          title: '9. User Content License',
          paragraphs: [
            'By posting content such as listings, images, and descriptions, you grant PropSpera the right to display and promote your listings and use the content for marketing purposes. You retain ownership of your content.',
          ],
        },
        {
          title: '10. Limitation of Liability',
          paragraphs: [
            'PropSpera is a marketplace platform provided as is. We are not responsible for transactions between users, losses arising from reliance on listings, or fraudulent actions by third parties. Users engage with each other at their own risk.',
          ],
        },
        {
          title: '11. Termination',
          paragraphs: [
            'We may suspend or terminate your account if you violate these Terms, engage in fraud or misuse the platform, or if your activity poses risk to other users.',
          ],
        },
        {
          title: '12. Changes to Terms',
          paragraphs: [
            'We may update these Terms periodically. Users will be notified of significant changes.',
          ],
        },
        {
          title: '13. Governing Law',
          paragraphs: ['These Terms are governed by the laws of the Republic of Rwanda.'],
        },
        {
          title: '14. Contact',
          links: [{ icon: '📧', label: 'hello@propspera.com', href: 'mailto:hello@propspera.com' }],
          note:
            'By using PropSpera, you acknowledge that you have read, understood, and agreed to these Terms.',
        },
      ],
    },
    faq: {
      subtitle: 'Frequently Asked Questions',
      intro:
        'Welcome to PropSpera! Below are answers to the most common questions from buyers, tenants, agents, and property owners.',
      outro:
        'PropSpera is built to make real estate in Rwanda simpler, faster, and more transparent.',
      sections: [
        {
          icon: '🏡',
          title: 'General Questions',
          items: [
            {
              question: 'What is PropSpera?',
              answer:
                'PropSpera is a digital real estate platform that helps people in Rwanda discover properties, connect with agents, and close deals faster. Whether buying, renting, or listing, PropSpera makes the process easier and more transparent.',
            },
            {
              question: 'Is PropSpera free to use?',
              answer:
                'Yes. Browsing properties and contacting agents is completely free. For agents and property owners, listing properties is currently free during our early launch phase.',
            },
            {
              question: 'Where does PropSpera operate?',
              answer:
                'PropSpera is currently focused on Kigali and surrounding areas, with plans to expand across Rwanda.',
            },
          ],
        },
        {
          icon: '🔍',
          title: 'For Buyers & Tenants',
          items: [
            {
              question: 'How do I find a property?',
              answer:
                'Browse properties using filters such as location, price, and property type. Click on a listing to view details and contact the agent directly.',
            },
            {
              question: 'How do I contact an agent?',
              answer:
                'Each listing includes a Send Message button and a WhatsApp icon. Click whichever you prefer to reach the agent.',
            },
            {
              question: 'Are the properties verified?',
              answer:
                'We encourage agents to provide accurate listings and monitor for suspicious activity. Always visit in person, verify ownership and documents, and avoid payments without proper agreements.',
            },
            {
              question: 'Can I save properties?',
              answer: 'Yes. Save your favorite listings and come back to them later from your account.',
            },
            {
              question: 'How do I know if a property is still available?',
              answer:
                'Contact the agent directly via WhatsApp or message to confirm availability.',
            },
          ],
        },
        {
          icon: '🧑‍💼',
          title: 'For Agents & Property Owners',
          items: [
            {
              question: 'How do I list a property?',
              answer:
                'Create an account and click List a Property. Fill in the details, upload images, and publish your listing.',
            },
            {
              question: 'How do buyers contact me?',
              answer:
                'Buyers can contact you via WhatsApp or through the platform. You will receive inquiries from interested clients.',
            },
            {
              question: 'Is listing a property free?',
              answer:
                'Yes, listing is currently free during our early stage. Premium features may be introduced later.',
            },
            {
              question: 'How can I get more visibility?',
              answer:
                'Upload high-quality photos, write clear and detailed descriptions, and respond quickly to inquiries.',
            },
            {
              question: 'Can I list multiple properties?',
              answer: 'Yes. Agents and property owners can list multiple properties on PropSpera.',
            },
          ],
        },
        {
          icon: '🔒',
          title: 'Trust & Safety',
          items: [
            {
              question: 'Is PropSpera safe?',
              answer:
                'We are committed to creating a safe marketplace. Always verify property details, meet agents in person, and avoid sending money without proper documentation.',
            },
            {
              question: 'How do you prevent scams?',
              answer:
                'We actively monitor listings and user activity. Suspicious listings may be removed and accounts suspended.',
            },
            {
              question: 'How can I report a suspicious listing?',
              answer:
                'Contact us at hello@propspera.com. We will investigate and take appropriate action.',
            },
          ],
        },
        {
          icon: '⚙️',
          title: 'Account & Support',
          items: [
            {
              question: 'Do I need an account to use PropSpera?',
              answer:
                'You can browse without an account, but you need one to save listings, list properties, and access additional features.',
            },
            {
              question: 'I forgot my password. What should I do?',
              answer:
                'Click Forgot Password on the login page and follow the instructions to reset your password.',
            },
            {
              question: 'How can I contact PropSpera?',
              answer: 'You can reach us at hello@propspera.com. We are happy to help.',
            },
          ],
        },
      ],
    },
  },
  fr: {
    helpCenter: {
      subtitle: 'Guides et assistance PropSpera',
      intro:
        'Bienvenue dans le Centre d\'aide PropSpera. Vous trouverez ici des guides pour démarrer, publier des biens et vous connecter avec des agents ou des acheteurs.',
      outro:
        'PropSpera est conçu pour rendre l\'immobilier au Rwanda simple et efficace. Si vous avez besoin d\'aide à une étape quelconque, nous sommes là pour vous.',
      sections: [
        {
          icon: '🧭',
          title: 'Premiers pas',
          blocks: [
            {
              title: 'Comment créer un compte',
              ordered: true,
              items: [
                'Cliquez sur S\'inscrire',
                'Choisissez E-mail ou Google (BIENTOT DISPONIBLE)',
                'Saisissez vos informations',
                'Confirmez votre compte',
              ],
              footnote:
                'Pour publier des biens, vous devez vous inscrire en tant que Propriétaire ou Agent lors de la création du compte.',
            },
            {
              title: 'Ai-je besoin d\'un compte ?',
              body:
                'Vous pouvez parcourir les biens sans compte. Cependant, un compte est nécessaire pour sauvegarder des annonces, publier des biens et accéder aux fonctionnalités agent.',
            },
          ],
        },
        {
          icon: '🏡',
          title: 'Publier des biens',
          blocks: [
            {
              title: 'Comment publier un bien',
              ordered: true,
              items: [
                'Connectez-vous à votre compte Agent',
                'Accédez au Tableau de bord Agent',
                'Cliquez sur Ajouter un bien',
                'Remplissez le titre, le prix, la localisation et la description',
                'Téléchargez des photos claires',
                'Cliquez sur Publier',
              ],
              footnote: 'Votre annonce apparaitra une fois examinée et approuvée.',
            },
            {
              title: 'Conseils pour obtenir plus de demandes',
              tone: 'warning',
              items: [
                'Des photos de haute qualité, lumineuses, nettes et prises sous plusieurs angles',
                'Une description claire et détaillée',
                'Un prix précis',
                'Des réponses rapides aux messages',
              ],
            },
            {
              title: 'Puis-je modifier ou supprimer mon annonce ?',
              body:
                'Oui. Accédez à votre tableau de bord, sélectionnez votre bien et cliquez sur Modifier ou Supprimer.',
            },
          ],
        },
        {
          icon: '📲',
          title: 'Contacter les agents',
          blocks: [
            {
              title: 'Comment contacter un agent',
              ordered: true,
              items: [
                'Ouvrez une annonce immobilière',
                'Cliquez sur Envoyer un message pour un message direct',
                'Cliquez sur l\'icone WhatsApp pour discuter',
              ],
            },
            {
              title: 'Que demander à un agent ?',
              items: [
                'Le bien est-il encore disponible ?',
                'Puis-je planifier une visite ?',
                'Quelles sont les conditions de paiement ?',
                'Y a-t-il des frais supplémentaires ?',
              ],
            },
          ],
        },
        {
          icon: '❤️',
          title: 'Sauvegarder et comparer',
          blocks: [
            {
              title: 'Comment sauvegarder un bien',
              ordered: true,
              items: [
                'Cliquez sur l\'icone coeur sur l\'annonce',
                'Retrouvez vos biens sauvegardés depuis votre compte',
              ],
            },
            {
              title: 'Comment comparer des biens',
              ordered: true,
              items: [
                'Cliquez sur l\'icone comparer',
                'Ajoutez jusqu\'à 3 biens',
                'Visualisez-les cote à cote',
              ],
            },
          ],
        },
        {
          icon: '🔒',
          title: 'Sécurité et confiance',
          blocks: [
            {
              title: 'Comment rester en sécurité',
              items: [
                'Visitez toujours le bien en personne',
                'Vérifiez la propriété et la documentation',
                'Evitez d\'envoyer de l\'argent sans accord écrit',
                'Méfiez-vous des offres trop belles pour être vraies',
              ],
            },
            {
              title: 'Comment signaler une annonce ou un utilisateur',
              body:
                'Si vous soupçonnez une fraude ou des informations trompeuses, contactez-nous à hello@propspera.com.',
            },
          ],
        },
        {
          icon: '⚙️',
          title: 'Compte et aide technique',
          blocks: [
            {
              title: 'Mot de passe oublié',
              ordered: true,
              items: [
                'Cliquez sur Mot de passe oublié sur la page de connexion',
                'Saisissez votre e-mail',
                'Suivez les instructions de réinitialisation',
              ],
            },
            {
              title: 'Je ne reçois pas d\'e-mails',
              body:
                'Vérifiez votre dossier spam ou courrier indésirable et assurez-vous que votre adresse e-mail est correcte. Si le problème persiste, contactez le support.',
            },
            {
              title: 'Comment contacter le support',
              body: 'E-mail : hello@propspera.com',
            },
          ],
        },
      ],
    },
    privacyPolicy: {
      updatedLabel: 'Dernière mise à jour : 28 mars 2026',
      sections: [
        {
          title: '1. Introduction',
          paragraphs: [
            'Bienvenue sur PropSpera ("nous", "notre", "nos"). PropSpera est une plateforme numérique qui met en relation acheteurs, vendeurs, propriétaires et agents immobiliers.',
            'Nous nous engageons à protéger vos données personnelles et à respecter votre vie privée. Cette Politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme.',
            'En accédant à PropSpera ou en l\'utilisant, vous acceptez les termes de cette Politique de confidentialité.',
          ],
        },
        {
          title: '2. Informations que nous collectons',
          subSections: [
            {
              title: '2.1 Informations que vous fournissez',
              paragraphs: ['Nous pouvons collecter les informations personnelles suivantes :'],
              bullets: [
                'Nom complet',
                'Adresse e-mail',
                'Numéro de téléphone',
                'Identifiants de connexion',
                'Annonces immobilières (descriptions, prix, images, localisation)',
                'Messages envoyés via la plateforme',
                'Toute autre information fournie volontairement',
              ],
            },
            {
              title: '2.2 Informations collectées automatiquement',
              bullets: [
                'Adresse IP',
                'Type d\'appareil et système d\'exploitation',
                'Type de navigateur',
                'Pages visitées et interactions',
                'Date et heure d\'accès',
              ],
            },
            {
              title: '2.3 Informations provenant de tiers',
              paragraphs: [
                'Si vous vous connectez via des services tiers tels que Google, nous pouvons recevoir votre nom, adresse e-mail et informations de profil.',
              ],
              note: 'Pas encore activé à cette date.',
            },
          ],
        },
        {
          title: '3. Comment nous utilisons vos informations',
          paragraphs: ['Nous utilisons vos informations pour :'],
          bullets: [
            'Créer et gérer votre compte',
            'Faciliter les annonces et transactions immobilières',
            'Mettre en relation acheteurs, vendeurs, propriétaires et agents',
            'Permettre la communication entre utilisateurs',
            'Fournir une assistance clientèle',
            'Envoyer des notifications liées au service',
            'Améliorer notre plateforme et l\'expérience utilisateur',
            'Détecter et prévenir la fraude ou les abus',
            'Respecter les obligations légales',
          ],
        },
        {
          title: '4. Comment nous partageons vos informations',
          paragraphs: ['Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations avec :'],
          bullets: [
            'Des prestataires de services tels que l\'hébergement, l\'analytique et le stockage cloud',
            'Des processeurs de paiement le cas échéant',
            'D\'autres utilisateurs lorsque vous publiez une annonce ou contactez un autre utilisateur',
            'Les autorités légales lorsque la loi l\'exige',
          ],
        },
        {
          title: '5. Cookies et technologies de suivi',
          paragraphs: [
            'Nous utilisons des cookies et des technologies similaires pour améliorer l\'expérience utilisateur, analyser l\'utilisation de la plateforme et mémoriser les préférences. Vous pouvez contrôler les cookies via les paramètres de votre navigateur.',
          ],
        },
        {
          title: '6. Sécurité des données',
          paragraphs: [
            'Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour protéger vos données, notamment des serveurs sécurisés, le chiffrement lorsque cela est applicable et des contrôles d\'accès.',
            'Cependant, aucun système n\'est totalement sécurisé et nous ne pouvons garantir une sécurité absolue.',
          ],
        },
        {
          title: '7. Conservation des données',
          paragraphs: [
            'Nous conservons vos données personnelles uniquement le temps nécessaire pour fournir nos services, respecter les obligations légales et résoudre les litiges. Vous pouvez demander la suppression de vos données à tout moment.',
          ],
        },
        {
          title: '8. Vos droits',
          paragraphs: [
            'Vous avez le droit de :',
            'Pour exercer vos droits, contactez-nous à l\'adresse e-mail ci-dessous.',
          ],
          bullets: [
            'Accéder à vos données personnelles',
            'Corriger les informations inexactes',
            'Demander la suppression de vos données',
            'Vous opposer à certains traitements de données',
          ],
        },
        {
          title: '9. Transferts internationaux de données',
          paragraphs: [
            'Vos informations peuvent être stockées ou traitées sur des serveurs situés en dehors du Rwanda, y compris via des services tiers. Nous prenons des mesures raisonnables pour assurer la protection de vos données.',
          ],
        },
        {
          title: '10. Confidentialité des enfants',
          paragraphs: [
            'PropSpera n\'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données personnelles auprès des enfants.',
          ],
        },
        {
          title: '11. Modifications de cette politique',
          paragraphs: [
            'Nous pouvons mettre à jour cette Politique de confidentialité de temps à autre. Les modifications seront publiées sur cette page avec une date mise à jour.',
          ],
        },
        {
          title: '12. Nous contacter',
          paragraphs: ['Pour toute question ou préoccupation concernant cette Politique de confidentialité, veuillez nous contacter :'],
          links: [
            { icon: '📧', label: 'hello@propspera.com', href: 'mailto:hello@propspera.com' },
            { icon: '🌐', label: 'propspera.rw', href: 'https://propspera.rw' },
          ],
        },
        {
          title: '13. Consentement',
          paragraphs: ['En utilisant PropSpera, vous consentez aux termes de cette Politique de confidentialité.'],
        },
      ],
    },
    termsOfService: {
      updatedLabel: 'Dernière mise à jour : 28 mars 2026',
      intro:
        'Bienvenue sur PropSpera. Ces Conditions d\'utilisation régissent votre accès et votre utilisation de la plateforme PropSpera. En utilisant PropSpera, vous acceptez ces Conditions.',
      sections: [
        {
          title: '1. Aperçu de la plateforme',
          paragraphs: [
            'PropSpera est une marketplace numérique qui met en relation :',
            'PropSpera facilite les mises en relation mais n\'est pas partie à une transaction entre utilisateurs.',
          ],
          bullets: ['Les agents immobiliers', 'Les propriétaires', 'Les acheteurs et locataires'],
        },
        {
          title: '2. Rôles et responsabilités des utilisateurs',
          subSections: [
            {
              title: '2.1 Agents et propriétaires',
              paragraphs: [
                'Si vous publiez un bien, vous vous engagez à :',
                'Vous êtes seul responsable de la légalité de vos annonces et de tout accord conclu avec les acheteurs ou locataires.',
              ],
              bullets: [
                'Fournir des informations exactes, complètes et à jour',
                'Ne lister que des biens que vous êtes autorisé à représenter ou vendre',
                'S\'assurer que les détails du bien comme le prix, la localisation et les caractéristiques sont véridiques',
                'S\'assurer que les images reflètent le bien réel',
                'Répondre aux demandes de manière professionnelle',
              ],
            },
            {
              title: '2.2 Acheteurs et locataires',
              paragraphs: [
                'Si vous utilisez PropSpera pour rechercher un bien, vous vous engagez à fournir des informations exactes lorsque vous contactez des agents et à effectuer votre propre vérification avant toute transaction.',
                'PropSpera ne garantit pas la disponibilité des biens, l\'exactitude des annonces ni l\'issue des négociations.',
              ],
            },
          ],
        },
        {
          title: '3. Politique des annonces immobilières',
          paragraphs: [
            'Toutes les annonces doivent être authentiques, représenter des biens réels existants et inclure des prix et localisations exacts. Les pratiques suivantes sont strictement interdites :',
            'PropSpera se réserve le droit de supprimer toute annonce sans préavis et de suspendre les comptes associés à des activités suspectes.',
          ],
          bullets: [
            'Les annonces fausses ou dupliquées',
            'Les annonces visant à escroquer ou induire en erreur',
            'La déformation de la propriété ou de l\'autorisation',
            'L\'utilisation d\'images ou de contenus volés',
          ],
        },
        {
          title: '4. Politique anti-fraude et sécurité',
          paragraphs: ['PropSpera prend la fraude très au sérieux. Vous vous engagez à ne pas :'],
          bullets: [
            'Publier de faux biens ou des annonces appâts',
            'Demander ou accepter des paiements en dehors de canaux sécurisés et vérifiables sans documentation appropriée',
            'Usurper l\'identité d\'un autre agent, d\'une agence ou d\'un propriétaire',
            'Utiliser la plateforme pour tromper, exploiter ou escroquer des utilisateurs',
          ],
          warningTitle: 'Avertissement aux utilisateurs',
          warningBullets: [
            'Vérifiez toujours la propriété et les documents',
            'Ne faites pas de paiements sans accords appropriés',
            'Méfiez-vous des offres qui semblent trop belles pour être vraies',
          ],
        },
        {
          title: '4.1 Signaler une fraude',
          paragraphs: [
            'Signalez toute activité suspecte à hello@propspera.com. PropSpera peut enquêter, suspendre ou bannir définitivement les utilisateurs fautifs et coopérer avec les autorités si nécessaire.',
          ],
        },
        {
          title: '5. Comptes utilisateurs',
          paragraphs: [
            'Vous êtes responsable de la confidentialité de votre compte et de toute activité qui y est liée. PropSpera peut suspendre ou résilier les comptes qui enfreignent ces Conditions ou adoptent un comportement frauduleux ou abusif.',
          ],
        },
        {
          title: '6. Communications',
          paragraphs: [
            'En utilisant PropSpera, vous acceptez de recevoir des demandes liées à vos annonces et des communications relatives au service. Vous pouvez vous désabonner des communications marketing.',
          ],
        },
        {
          title: '7. Tarifs et monétisation',
          paragraphs: [
            'PropSpera peut actuellement offrir un accès gratuit. Nous nous réservons le droit d\'introduire des fonctionnalités payantes ou de modifier les tarifs avec un préavis.',
          ],
        },
        {
          title: '8. Propriété intellectuelle',
          paragraphs: [
            'Tout le contenu de la plateforme, hors annonces utilisateurs, est la propriété de PropSpera. Vous ne pouvez pas copier, distribuer ou reproduire le contenu de la plateforme sans autorisation.',
          ],
        },
        {
          title: '9. Licence sur le contenu utilisateur',
          paragraphs: [
            'En publiant du contenu tel que des annonces, images et descriptions, vous accordez à PropSpera le droit d\'afficher et de promouvoir vos annonces et d\'utiliser ce contenu à des fins marketing. Vous conservez la propriété de votre contenu.',
          ],
        },
        {
          title: '10. Limitation de responsabilité',
          paragraphs: [
            'PropSpera est une plateforme marketplace fournie en l\'état. Nous ne sommes pas responsables des transactions entre utilisateurs, des pertes liées à la confiance accordée aux annonces ou des actions frauduleuses de tiers. Les utilisateurs interagissent entre eux à leurs propres risques.',
          ],
        },
        {
          title: '11. Résiliation',
          paragraphs: [
            'Nous pouvons suspendre ou résilier votre compte si vous enfreignez ces Conditions, commettez une fraude ou faites un usage abusif de la plateforme, ou si votre activité présente un risque pour d\'autres utilisateurs.',
          ],
        },
        {
          title: '12. Modifications des Conditions',
          paragraphs: [
            'Nous pouvons mettre à jour ces Conditions périodiquement. Les utilisateurs seront informés des changements importants.',
          ],
        },
        {
          title: '13. Droit applicable',
          paragraphs: ['Ces Conditions sont régies par les lois de la République du Rwanda.'],
        },
        {
          title: '14. Contact',
          links: [{ icon: '📧', label: 'hello@propspera.com', href: 'mailto:hello@propspera.com' }],
          note:
            'En utilisant PropSpera, vous reconnaissez avoir lu, compris et accepté ces Conditions.',
        },
      ],
    },
    faq: {
      subtitle: 'Questions fréquemment posées',
      intro:
        'Bienvenue sur PropSpera ! Vous trouverez ci-dessous les réponses aux questions les plus fréquentes des acheteurs, locataires, agents et propriétaires.',
      outro:
        'PropSpera est conçu pour rendre l\'immobilier au Rwanda plus simple, plus rapide et plus transparent.',
      sections: [
        {
          icon: '🏡',
          title: 'Questions générales',
          items: [
            {
              question: 'Qu\'est-ce que PropSpera ?',
              answer:
                'PropSpera est une plateforme immobilière numérique qui aide les personnes au Rwanda à découvrir des biens, se connecter avec des agents et conclure des transactions plus rapidement. Que vous achetiez, louiez ou mettiez en vente, PropSpera rend le processus plus simple et plus transparent.',
            },
            {
              question: 'PropSpera est-il gratuit ?',
              answer:
                'Oui. La consultation des biens et le contact avec les agents sont entièrement gratuits. Pour les agents et propriétaires, la publication d\'annonces est actuellement gratuite pendant notre phase de lancement.',
            },
            {
              question: 'Où PropSpera opère-t-il ?',
              answer:
                'PropSpera est actuellement concentré sur Kigali et ses environs, avec des projets d\'expansion à travers le Rwanda.',
            },
          ],
        },
        {
          icon: '🔍',
          title: 'Pour les acheteurs et locataires',
          items: [
            {
              question: 'Comment trouver un bien ?',
              answer:
                'Parcourez les biens avec des filtres tels que la localisation, le prix et le type de bien. Cliquez sur une annonce pour voir les détails et contacter directement l\'agent.',
            },
            {
              question: 'Comment contacter un agent ?',
              answer:
                'Chaque annonce inclut un bouton Envoyer un message et une icone WhatsApp. Cliquez sur l\'option qui vous convient pour joindre l\'agent.',
            },
            {
              question: 'Les biens sont-ils vérifiés ?',
              answer:
                'Nous encourageons les agents à fournir des annonces exactes et nous surveillons les activités suspectes. Visitez toujours le bien en personne, vérifiez la propriété et les documents, et évitez les paiements sans accord approprié.',
            },
            {
              question: 'Puis-je sauvegarder des biens ?',
              answer:
                'Oui. Sauvegardez vos annonces favorites et retrouvez-les plus tard depuis votre compte.',
            },
            {
              question: 'Comment savoir si un bien est toujours disponible ?',
              answer:
                'Contactez directement l\'agent via WhatsApp ou message pour confirmer la disponibilité.',
            },
          ],
        },
        {
          icon: '🧑‍💼',
          title: 'Pour les agents et propriétaires',
          items: [
            {
              question: 'Comment publier un bien ?',
              answer:
                'Créez un compte puis cliquez sur Publier un bien. Remplissez les détails, téléchargez des images et publiez votre annonce.',
            },
            {
              question: 'Comment les acheteurs me contactent-ils ?',
              answer:
                'Les acheteurs peuvent vous contacter via WhatsApp ou via la plateforme. Vous recevrez des demandes de clients intéressés.',
            },
            {
              question: 'La publication est-elle gratuite ?',
              answer:
                'Oui, la publication est actuellement gratuite pendant notre phase de démarrage. Des fonctionnalités premium peuvent être introduites plus tard.',
            },
            {
              question: 'Comment obtenir plus de visibilité ?',
              answer:
                'Téléchargez des photos de haute qualité, rédigez des descriptions claires et détaillées, et répondez rapidement aux demandes.',
            },
            {
              question: 'Puis-je publier plusieurs biens ?',
              answer:
                'Oui. Les agents et propriétaires peuvent publier plusieurs biens sur PropSpera.',
            },
          ],
        },
        {
          icon: '🔒',
          title: 'Confiance et sécurité',
          items: [
            {
              question: 'PropSpera est-il sûr ?',
              answer:
                'Nous nous engageons à créer un marché sécurisé. Vérifiez toujours les détails des biens, rencontrez les agents en personne et évitez d\'envoyer de l\'argent sans documentation appropriée.',
            },
            {
              question: 'Comment prévenez-vous les arnaques ?',
              answer:
                'Nous surveillons activement les annonces et l\'activité des utilisateurs. Les annonces suspectes peuvent être supprimées et les comptes suspendus.',
            },
            {
              question: 'Comment signaler une annonce suspecte ?',
              answer:
                'Contactez-nous à hello@propspera.com. Nous enquêterons et prendrons les mesures appropriées.',
            },
          ],
        },
        {
          icon: '⚙️',
          title: 'Compte et support',
          items: [
            {
              question: 'Ai-je besoin d\'un compte pour utiliser PropSpera ?',
              answer:
                'Vous pouvez parcourir les biens sans compte, mais vous en avez besoin pour sauvegarder des annonces, publier des biens et accéder à des fonctionnalités supplémentaires.',
            },
            {
              question: 'J\'ai oublié mon mot de passe. Que dois-je faire ?',
              answer:
                'Cliquez sur Mot de passe oublié sur la page de connexion et suivez les instructions pour réinitialiser votre mot de passe.',
            },
            {
              question: 'Comment puis-je contacter PropSpera ?',
              answer: 'Vous pouvez nous joindre à hello@propspera.com. Nous serons ravis de vous aider.',
            },
          ],
        },
      ],
    },
  },
  rw: {
    helpCenter: {
      subtitle: 'Inyobora n\'Ubufasha bya PropSpera',
      intro:
        'Murakaza neza mu Kigo Gifasha Abakoresha cya PropSpera. Hano murahasanga inyobora zibafasha gutangira gukoresha urubuga, gushyiraho imitungo no kuvugana n\'aba agenti cyangwa abakiriya.',
      outro:
        'PropSpera yagenewe koroshya no kunoza ibijyanye n\'imitungo itimukanwa mu Rwanda. Niba hari aho mukeneye ubufasha, turi kumwe namwe.',
      sections: [
        {
          icon: '🧭',
          title: 'Gutangira gukoresha urubuga',
          blocks: [
            {
              title: 'Uko wafungura konti',
              ordered: true,
              items: [
                'Kanda kuri Iyandikishe',
                'Hitamo gukoresha imeli cyangwa Google (BIRACYAZA)',
                'Andika amakuru yawe',
                'Emeza konti yawe',
              ],
              footnote:
                'Niba ushaka gushyira umutungo ku rubuga, ugomba kwiyandikisha nk\'Umukoresha ushyira umutungo cyangwa nk\'Umu Agenti igihe ufungura konti.',
            },
            {
              title: 'Ese ni ngombwa kugira konti?',
              body:
                'Mushobora kureba imitungo mutagize konti. Ariko konti irakenewe kugira ngo mubike amatangazo, mushyire imitungo ku rubuga kandi mukoreshe serivisi zigenewe aba agenti.',
            },
          ],
        },
        {
          icon: '🏡',
          title: 'Gushyira umutungo ku rubuga',
          blocks: [
            {
              title: 'Uko washyira umutungo ku rubuga',
              ordered: true,
              items: [
                'Injira muri konti yawe y\'Umu Agenti',
                'Jya ku Kibaho cy\'Umu Agenti',
                'Kanda kuri Ongeraho Umutungo',
                'Uzuza umutwe, igiciro, aho uherereye n\'ibisobanuro',
                'Ohereza amafoto asobanutse neza',
                'Kanda kuri Ohereza cyangwa Tangaza',
              ],
              footnote: 'Itangazo ryawe rizagaragara nyuma yo gusuzumwa no kwemezwa.',
            },
            {
              title: 'Inama zagufasha kubona abashaka umutungo benshi',
              tone: 'warning',
              items: [
                'Koresha amafoto meza, amurika neza kandi agaragaza impande zitandukanye',
                'Andika ibisobanuro bisobanutse kandi birambuye',
                'Shyiraho igiciro gihamye kandi gikosoye',
                'Subiza ubutumwa bw\'abakiliya vuba',
              ],
            },
            {
              title: 'Ese nshobora guhindura cyangwa gusiba itangazo ryanjye?',
              body:
                'Yego. Jya ku kibaho cyawe, hitamo umutungo wawe hanyuma ukande kuri Hindura cyangwa Siba.',
            },
          ],
        },
        {
          icon: '📲',
          title: 'Kuvugana n\'aba agenti',
          blocks: [
            {
              title: 'Uko wavugana n\'umu agenti',
              ordered: true,
              items: [
                'Fungura itangazo ry\'umutungo',
                'Kanda kuri Ohereza ubutumwa kugira ngo umwandikire',
                'Kanda ku kimenyetso cya WhatsApp kugira ngo muganire',
              ],
            },
            {
              title: 'Ni ibihe bibazo wabaza umu agenti?',
              items: [
                'Ese uwo mutungo uracyaboneka?',
                'Nshobora guteganya igihe cyo kuwusura?',
                'Ni ayahe mabwiriza yo kwishyura?',
                'Hari andi mafaranga y\'inyongera asabwa?',
              ],
            },
          ],
        },
        {
          icon: '❤️',
          title: 'Kubika no kugereranya imitungo',
          blocks: [
            {
              title: 'Uko wabika umutungo',
              ordered: true,
              items: [
                'Kanda ku kimenyetso cy\'umutima kiri ku itangazo',
                'Imitungo wabitse uzayisanga muri konti yawe',
              ],
            },
            {
              title: 'Uko wagereranya imitungo',
              ordered: true,
              items: [
                'Kanda ku kimenyetso cyo kugereranya',
                'Ongeramo imitungo igera kuri 3',
                'Uyirebere hamwe ku rupapuro rumwe',
              ],
            },
          ],
        },
        {
          icon: '🔒',
          title: 'Umutekano n\'icyizere',
          blocks: [
            {
              title: 'Uko wakomeza kuba mu mutekano',
              items: [
                'Buri gihe jya gusura umutungo imbonankubone',
                'Genzura nyir\'umutungo n\'inyandiko ziwemeza',
                'Irinde kohereza amafaranga nta masezerano yanditse',
                'Witondera amatangazo asa n\'aryoshye cyane kurusha ukuri',
              ],
            },
            {
              title: 'Uko watanga amakuru ku itangazo cyangwa umukoresha uteye inkeke',
              body:
                'Niba ukeka uburiganya cyangwa amakuru ayobya, twandikire kuri hello@propspera.com.',
            },
          ],
        },
        {
          icon: '⚙️',
          title: 'Konti n\'ubufasha bwa tekiniki',
          blocks: [
            {
              title: 'Nibagiwe ijambo ry\'ibanga',
              ordered: true,
              items: [
                'Kanda kuri Wibagiwe ijambo ry\'ibanga ku rupapuro rwo kwinjira',
                'Andika aderesi imeli yawe',
                'Kurikiza amabwiriza yo kongera gushyiraho ijambo ry\'ibanga',
              ],
            },
            {
              title: 'Ntabwo ndimo kwakira ubutumwa bwo kuri imeli',
              body:
                'Reba muri spam cyangwa ahandi ubutumwa bushobora kujya, kandi wemeze ko aderesi imeli yawe ari yo. Niba ikibazo gikomeje, twandikire.',
            },
            {
              title: 'Uko wavugana n\'inkunganire',
              body: 'Imeli: hello@propspera.com',
            },
          ],
        },
      ],
    },
    privacyPolicy: {
      updatedLabel: 'Byavuguruwe bwa nyuma: 28 Werurwe 2026',
      sections: [
        {
          title: '1. Intangiriro',
          paragraphs: [
            'Murakaza neza kuri PropSpera ("twe", "ibyacu"). PropSpera ni urubuga rwa digitale ruhuza abaguzi, abagurisha, abakodesha, ba nyir\'imitungo n\'aba agenti b\'imitungo itimukanwa.',
            'Twiyemeje kurinda amakuru bwite yanyu no kubaha ubuzima bwite bwanyu. Iyi Politiki y\'Ubwirinzi bw\'Amakuru isobanura uko dukusanya, dukoresha, dusangiza kandi turinda amakuru yanyu igihe mukoresha urubuga rwacu.',
            'Iyo winjiye cyangwa ukoresha PropSpera, uba wemeye amabwiriza ari muri iyi Politiki y\'Ubwirinzi bw\'Amakuru.',
          ],
        },
        {
          title: '2. Amakuru dukusanya',
          subSections: [
            {
              title: '2.1 Amakuru mutanga ubwanyu',
              paragraphs: ['Dushobora gukusanya aya makuru bwite akurikira:'],
              bullets: [
                'Amazina yuzuye',
                'Aderesi imeli',
                'Nimero ya telefoni',
                'Amakuru yo kwinjira muri konti',
                'Amatangazo y\'umutungo harimo ibisobanuro, ibiciro, amafoto n\'aho uherereye',
                'Ubutumwa bwoherezwa binyuze ku rubuga',
                'Andi makuru yose mutanga ku bushake',
              ],
            },
            {
              title: '2.2 Amakuru akusanywa mu buryo bwikora',
              bullets: [
                'Aderesi ya IP',
                'Ubwoko bw\'igikoresho na sisitemu ikoresha',
                'Ubwoko bwa mushakiro',
                'Amapaji mwasuye n\'ibyo mwakozeho',
                'Itariki n\'igihe by\'uko mwakoresheje urubuga',
              ],
            },
            {
              title: '2.3 Amakuru aturuka ku bandi',
              paragraphs: [
                'Niba winjiye ukoresheje serivisi z\'abandi nka Google, dushobora kwakira izina ryawe, aderesi imeli n\'amakuru y\'umwirondoro wawe.',
              ],
              note: 'Ibi ntibiratangira gukoreshwa kugeza ubu.',
            },
          ],
        },
        {
          title: '3. Uko dukoresha amakuru yanyu',
          paragraphs: ['Dukoresha amakuru yanyu kugira ngo:'],
          bullets: [
            'Dufungure kandi ducunge konti yanyu',
            'Dufashe mu gushyira imitungo ku rubuga no mu bikorwa by\'ubucuruzi bw\'imitungo',
            'Duhuza abaguzi, abagurisha, ba nyir\'imitungo n\'aba agenti',
            'Dushoboze itumanaho hagati y\'abakoresha',
            'Dutanga ubufasha ku bakiriya',
            'Twohereze amatangazo ajyanye na serivisi',
            'Tunagure urubuga n\'ubunararibonye bw\'abakoresha',
            'Dutahure kandi duhoshe uburiganya cyangwa ikoreshwa nabi',
            'Twubahirize amategeko adusaba ibi n\'ibi',
          ],
        },
        {
          title: '4. Uko dusangiza amakuru yanyu',
          paragraphs: ['Ntabwo tugurisha amakuru yanyu bwite. Dushobora kuyasangiza aba bakurikira:'],
          bullets: [
            'Abatanga serivisi nko kubika urubuga, gusesengura imibare no kubika amakuru mu bicu',
            'Abatunganya ubwishyu aho bibaye ngombwa',
            'Abandi bakoresha igihe mushyize itangazo ku rubuga cyangwa muvuganye nabo',
            'Inzego z\'amategeko igihe bisabwe n\'amategeko',
          ],
        },
        {
          title: '5. Cookies n\'ubundi buryo bwo gukurikirana ikoreshwa',
          paragraphs: [
            'Dukoresha cookies n\'ubundi buryo busa na bwo kugira ngo tunoze ubunararibonye bw\'abakoresha, dusesengure uko urubuga rukoreshwa kandi twibuke ibyo mukunda. Mushobora kugenzura cookies binyuze mu igenamiterere rya mushakiro yanyu.',
          ],
        },
        {
          title: '6. Umutekano w\'amakuru',
          paragraphs: [
            'Dushyiraho ingamba za tekiniki n\'iz\'ubuyobozi zikwiriye kurinda amakuru yanyu, harimo seriveri zitekanye, ububiko bw\'ibanga n\'ubugenzuzi bwo kuyageraho.',
            'Ariko nta sisitemu n\'imwe iba ifite umutekano ku rugero rwa 100%, bityo ntidushobora gusezeranya umutekano udakuka burundu.',
          ],
        },
        {
          title: '7. Igihe tubika amakuru',
          paragraphs: [
            'Tubika amakuru yanyu bwite mu gihe gikenewe kugira ngo dutange serivisi, twubahirize amategeko kandi dukemure amakimbirane. Mushobora gusaba ko amakuru yanyu asibwa igihe icyo ari cyo cyose.',
          ],
        },
        {
          title: '8. Uburenganzira bwanyu',
          paragraphs: [
            'Mufite uburenganzira bwo:',
            'Kugira ngo mukoreshe ubu burenganzira bwanyu, twandikire kuri imeli iri hepfo.',
          ],
          bullets: [
            'Kubona amakuru yanyu bwite',
            'Gukosora amakuru atari yo',
            'Gusaba ko amakuru yanyu asibwa',
            'Kwanga uburyo bumwe na bumwe bwo gutunganywa kw\'amakuru',
          ],
        },
        {
          title: '9. Kohereza amakuru mu mahanga',
          paragraphs: [
            'Amakuru yanyu ashobora kubikwa cyangwa gutunganyirizwa kuri seriveri ziri hanze y\'u Rwanda, harimo n\'iz\'abandi dukorana nabo. Dufata ingamba zifatika kugira ngo amakuru yanyu arindwe.',
          ],
        },
        {
          title: '10. Ubwirinzi bw\'abana',
          paragraphs: [
            'PropSpera ntiyagenewe abantu bari munsi y\'imyaka 18. Ntabwo dukusanya ku bushake amakuru bwite y\'abana.',
          ],
        },
        {
          title: '11. Impinduka kuri iyi politiki',
          paragraphs: [
            'Dushobora kuvugurura iyi Politiki y\'Ubwirinzi bw\'Amakuru rimwe na rimwe. Impinduka zose zizashyirwa kuri uru rupapuro hamwe n\'itariki nshya yo kuvugurura.',
          ],
        },
        {
          title: '12. Twandikire',
          paragraphs: ['Niba mufite ikibazo cyangwa impungenge zijyanye n\'iyi Politiki y\'Ubwirinzi bw\'Amakuru, mutwandikire kuri:'],
          links: [
            { icon: '📧', label: 'hello@propspera.com', href: 'mailto:hello@propspera.com' },
            { icon: '🌐', label: 'propspera.rw', href: 'https://propspera.rw' },
          ],
        },
        {
          title: '13. Ukwemera',
          paragraphs: ['Ukoresheje PropSpera, uba wemeye ibisobanuro n\'amabwiriza ari muri iyi Politiki y\'Ubwirinzi bw\'Amakuru.'],
        },
      ],
    },
    termsOfService: {
      updatedLabel: 'Byavuguruwe bwa nyuma: 28 Werurwe 2026',
      intro:
        'Murakaza neza kuri PropSpera. Aya Mabwiriza yo Gukoresha Serivisi agenga uko winjira no ukoresha urubuga rwa PropSpera. Ukoresheje PropSpera, uba wemeye aya mabwiriza.',
      sections: [
        {
          title: '1. Incamake y\'urubuga',
          paragraphs: [
            'PropSpera ni isoko rya digitale rihuza:',
            'PropSpera ifasha abantu guhura ariko si yo iba igize uruhande mu masezerano cyangwa mu bucuruzi bukorwa hagati y\'abakoresha.',
          ],
          bullets: ['Aba agenti b\'imitungo itimukanwa', 'Ba nyir\'imitungo', 'Abaguzi n\'abakodesha'],
        },
        {
          title: '2. Inshingano z\'abakoresha',
          subSections: [
            {
              title: '2.1 Aba agenti na ba nyir\'imitungo',
              paragraphs: [
                'Niba ushyira umutungo ku rubuga, wemera ibi bikurikira:',
                'Ufite inshingano zose ku bijyanye n\'ukuri, ubuziranenge n\'amategeko agenga amatangazo yawe, ndetse n\'amasezerano ugirana n\'abaguzi cyangwa abakodesha.',
              ],
              bullets: [
                'Gutanga amakuru yukuri, yuzuye kandi avuguruye',
                'Gushyira ku rubuga imitungo wemerewe guhagararira cyangwa kugurisha gusa',
                'Kwemeza ko ibisobanuro by\'umutungo birimo igiciro, aho uherereye n\'ibiranga ari ukuri',
                'Kwemeza ko amafoto agaragaza neza umutungo nyawo',
                'Gusubiza ibibazo by\'abakiriya mu buryo bw\'umwuga',
              ],
            },
            {
              title: '2.2 Abaguzi n\'abakodesha',
              paragraphs: [
                'Niba ukoresha PropSpera ushaka umutungo, wemera gutanga amakuru yukuri igihe uvugana n\'aba agenti no gukora igenzura ryawe bwite mbere yo kugirana amasezerano n\'undi muntu.',
                'PropSpera ntiyemeza ko umutungo ugihari, ko itangazo ari ukuri rwose cyangwa ko ibiganiro bizagera ku musaruro runaka.',
              ],
            },
          ],
        },
        {
          title: '3. Politiki y\'amatangazo y\'imitungo',
          paragraphs: [
            'Amatangazo yose agomba kuba ari ay\'ukuri, agahagararira imitungo nyakuri kandi akagaragaza ibiciro n\'aho iherereye mu buryo bukosoye. Ibi bikurikira birabujijwe rwose:',
            'PropSpera ifite uburenganzira bwo gukuraho itangazo iryo ari ryo ryose nta nteguza no guhagarika konti ifitanye isano n\'ibikorwa biteye inkeke.',
          ],
          bullets: [
            'Amatangazo y\'ibinyoma cyangwa asubirwamo',
            'Amatangazo agamije gushuka cyangwa kuyobya abakoresha',
            'Kwigaragaza nk\'ufite umutungo cyangwa uburenganzira bwo kuwugurisha utabufite',
            'Gukoresha amafoto cyangwa ibindi bikoresho byibwe',
          ],
        },
        {
          title: '4. Politiki yo kurwanya uburiganya n\'umutekano',
          paragraphs: ['PropSpera ifata uburiganya nk\'ikibazo gikomeye. Wemera kutazakora ibi bikurikira:'],
          bullets: [
            'Gushyiraho imitungo y\'ibinyoma cyangwa amatangazo yo kureshya abantu',
            'Gusaba cyangwa kwakira amafaranga hanze y\'inzira zizewe kandi zigaragaza ibimenyetso, nta nyandiko zibihamya',
            'Kwiyitirira undi mu agenti, ikigo cyangwa nyir\'umutungo',
            'Gukoresha urubuga mu gushuka, gukandamiza cyangwa kuriganya abakoresha',
          ],
          warningTitle: 'Iburira ku bakoresha',
          warningBullets: [
            'Buri gihe genzura nyir\'umutungo n\'inyandiko zibihamya',
            'Ntutange amafaranga nta masezerano cyangwa inyandiko ziboneye',
            'Witondere amatangazo agaragara nk\'aryoshye cyane kurusha uko bikwiye',
          ],
        },
        {
          title: '4.1 Gutanga amakuru ku buriganya',
          paragraphs: [
            'Mumenyeshe ibikorwa biteye inkeke kuri hello@propspera.com. PropSpera ishobora gukora iperereza, guhagarika cyangwa kwirukana burundu abakoresha barenze ku mabwiriza kandi ikakorana n\'inzego zishinzwe kubahiriza amategeko igihe bibaye ngombwa.',
          ],
        },
        {
          title: '5. Konti z\'abakoresha',
          paragraphs: [
            'Ufite inshingano zo kubika ibanga rya konti yawe no ku byo ikora byose. PropSpera ishobora guhagarika cyangwa gufunga konti zica aya mabwiriza cyangwa zikora ibikorwa by\'uburiganya cyangwa ihohoterwa ry\'urubuga.',
          ],
        },
        {
          title: '6. Itumanaho',
          paragraphs: [
            'Ukoresheje PropSpera, wemera kwakira ubutumwa bw\'abashaka umutungo bujyanye n\'amatangazo yawe ndetse n\'andi matangazo ajyanye na serivisi. Ushobora kwikuramo ubutumwa bwo kwamamaza.',
          ],
        },
        {
          title: '7. Ibiciro n\'uburyo bwo kwinjiza amafaranga',
          paragraphs: [
            'Kugeza ubu PropSpera ishobora gutanga serivisi z\'ubuntu. Dufite uburenganzira bwo gushyiraho serivisi zishyurwa cyangwa guhindura ibiciro tubanje kubimenyesha.',
          ],
        },
        {
          title: '8. Uburenganzira ku mutungo bwite mu by\'ubwenge',
          paragraphs: [
            'Ibikubiye ku rubuga, uretse amatangazo y\'abakoresha, ni umutungo wa PropSpera. Ntabwo wemerewe kubikoporora, kubikwirakwiza cyangwa kubyongera utabiherewe uburenganzira.',
          ],
        },
        {
          title: '9. Uruhushya ku byo umukoresha ashyiraho',
          paragraphs: [
            'Iyo ushyize ku rubuga ibintu nka matangazo, amafoto n\'ibisobanuro, uba uhaye PropSpera uburenganzira bwo kubigaragaza, kubimenyekanisha no kubikoresha mu kwamamaza. Ariko ugumana uburenganzira bwawe kuri ibyo washyizeho.',
          ],
        },
        {
          title: '10. Imipaka y\'uburyozwe',
          paragraphs: [
            'PropSpera ni urubuga rw\'isoko rutangwa uko ruri. Ntidushinzwe amasezerano hagati y\'abakoresha, igihombo giterwa no kwiringira amatangazo cyangwa ibikorwa by\'uburiganya by\'abandi. Abakoresha bagirana ibikorwa ku bw\'ingaruka zabo bwite.',
          ],
        },
        {
          title: '11. Guhagarika serivisi cyangwa konti',
          paragraphs: [
            'Dushobora guhagarika cyangwa gufunga konti yawe niba urenze kuri aya mabwiriza, ukoze uburiganya cyangwa ukoresheje urubuga nabi, cyangwa niba ibikorwa byawe biteza abandi bakoresha ibyago.',
          ],
        },
        {
          title: '12. Impinduka kuri aya mabwiriza',
          paragraphs: [
            'Dushobora kuvugurura aya mabwiriza rimwe na rimwe. Abakoresha bazamenyeshwa impinduka zikomeye.',
          ],
        },
        {
          title: '13. Amategeko abigenga',
          paragraphs: ['Aya mabwiriza agengwa n\'amategeko ya Repubulika y\'u Rwanda.'],
        },
        {
          title: '14. Twandikire',
          links: [{ icon: '📧', label: 'hello@propspera.com', href: 'mailto:hello@propspera.com' }],
          note:
            'Ukoresheje PropSpera, uba wemeye ko wasomye, wasobanukiwe kandi wemeye aya Mabwiriza yo Gukoresha Serivisi.',
        },
      ],
    },
    faq: {
      subtitle: 'Ibibazo Bikunze Kubazwa',
      intro:
        'Murakaza neza kuri PropSpera! Hano hasi hari ibisubizo ku bibazo bikunze kubazwa n\'abaguzi, abakodesha, aba agenti na ba nyir\'imitungo.',
      outro:
        'PropSpera yubatswe kugira ngo ibikorwa by\'imitungo itimukanwa mu Rwanda birusheho koroshya, kwihuta no gukorera mu mucyo.',
      sections: [
        {
          icon: '🏡',
          title: 'Ibibazo rusange',
          items: [
            {
              question: 'PropSpera ni iki?',
              answer:
                'PropSpera ni urubuga rwa digitale rw\'imitungo itimukanwa rufasha abantu bo mu Rwanda kubona imitungo, kuvugana n\'aba agenti no kurangiza amasezerano vuba. Waba ushaka kugura, gukodesha cyangwa gushyira umutungo ku rubuga, PropSpera ibyoroshya kandi ikabikora mu mucyo.',
            },
            {
              question: 'Ese PropSpera ikoreshwa ku buntu?',
              answer:
                'Yego. Kureba imitungo no kuvugana n\'aba agenti ni ubuntu bwose. Ku ba agenti na ba nyir\'imitungo, gushyira imitungo ku rubuga na byo ubu ni ubuntu mu gihe cy\'itangizwa ry\'urubuga.',
            },
            {
              question: 'PropSpera ikorera hehe?',
              answer:
                'Ubu PropSpera yibanze cyane kuri Kigali n\'utundi duce tuyikikije, ariko dufite gahunda yo kwagukira mu Rwanda hose.',
            },
          ],
        },
        {
          icon: '🔍',
          title: 'Ku bagura n\'abakodesha',
          items: [
            {
              question: 'Nabona nte umutungo nshaka?',
              answer:
                'Reba imitungo ukoresheje ibisungura nka ahantu, igiciro n\'ubwoko bw\'umutungo. Kanda ku itangazo kugira ngo ubone ibisobanuro birambuye no kuvugana n\'umu agenti ako kanya.',
            },
            {
              question: 'Nabasha nte kuvugana n\'umu agenti?',
              answer:
                'Buri tangazo rigira buto ya Ohereza ubutumwa n\'ikimenyetso cya WhatsApp. Kanda icyo ushaka kugira ngo umuvugishe.',
            },
            {
              question: 'Ese imitungo iba yaragenzuwe?',
              answer:
                'Dushishikariza aba agenti gutanga amatangazo y\'ukuri kandi tugakurikirana ibikorwa biteye inkeke. Buri gihe jya gusura umutungo imbonankubone, genzura nyir\'umutungo n\'inyandiko ziwemeza, kandi wirinde kohereza amafaranga nta nyandiko zibihamya.',
            },
            {
              question: 'Nshobora kubika imitungo nkiri kureba?',
              answer:
                'Yego. Mushobora kubika amatangazo mukunda hanyuma mukazayasubiraho nyuma muri konti yanyu.',
            },
            {
              question: 'Namenya nte niba umutungo ugihari?',
              answer:
                'Vugana n\'umu agenti binyuze kuri WhatsApp cyangwa ubutumwa kugira ngo yemeze ko ugihari.',
            },
          ],
        },
        {
          icon: '🧑‍💼',
          title: 'Ku ba agenti na ba nyir\'imitungo',
          items: [
            {
              question: 'Nashyira nte umutungo ku rubuga?',
              answer:
                'Fungura konti hanyuma ukande kuri Shyira umutungo. Uzuza amakuru yose, ohereze amafoto maze utangaze itangazo ryawe.',
            },
            {
              question: 'Abakiliya banjya bategeka kumbona?',
              answer:
                'Abashaka umutungo bashobora kukuvugisha kuri WhatsApp cyangwa binyuze ku rubuga. Uzajya wakira ibibazo n\'ubusabe bw\'abakiliya babishaka.',
            },
            {
              question: 'Gushyira umutungo ku rubuga ni ubuntu?',
              answer:
                'Yego, ubu ni ubuntu mu gihe cya mbere cy\'iterambere ryacu. Mu bihe bizaza hashobora kuza serivisi z\'inyongera zishyurwa.',
            },
            {
              question: 'Nakora iki kugira ngo itangazo ryanjye ribonwe cyane?',
              answer:
                'Shyiraho amafoto meza, andika ibisobanuro bisobanutse kandi birambuye, kandi usubize ibibazo by\'abakiliya vuba.',
            },
            {
              question: 'Nshobora gushyira ku rubuga imitungo myinshi?',
              answer:
                'Yego. Aba agenti na ba nyir\'imitungo bashobora gushyira imitungo myinshi kuri PropSpera.',
            },
          ],
        },
        {
          icon: '🔒',
          title: 'Icyizere n\'umutekano',
          items: [
            {
              question: 'Ese PropSpera ifite umutekano?',
              answer:
                'Twiyemeje gukora isoko rifite umutekano. Buri gihe genzura amakuru y\'umutungo, muhure n\'aba agenti imbonankubone kandi wirinde kohereza amafaranga nta nyandiko zibihamya.',
            },
            {
              question: 'Mukora iki mu gukumira uburiganya?',
              answer:
                'Dukurikirana amatangazo n\'ibikorwa by\'abakoresha. Amatangazo ateye inkeke ashobora gukurwaho kandi konti zikagahagarikwa.',
            },
            {
              question: 'Nabigenza nte nbonye itangazo riteye inkeke?',
              answer:
                'Twandikire kuri hello@propspera.com. Tuzabikurikirana kandi dufate ingamba zikwiye.',
            },
          ],
        },
        {
          icon: '⚙️',
          title: 'Konti n\'ubufasha',
          items: [
            {
              question: 'Ese kugira konti ni ngombwa kugira ngo nkoreshe PropSpera?',
              answer:
                'Mushobora kureba imitungo mudafite konti, ariko konti irakenewe kugira ngo mubike amatangazo, mushyire imitungo ku rubuga no gukoresha ibindi biranga by\'inyongera.',
            },
            {
              question: 'Nibagiwe ijambo ry\'ibanga. Nakora iki?',
              answer:
                'Kanda kuri Wibagiwe ijambo ry\'ibanga ku rupapuro rwo kwinjira hanyuma ukurikize amabwiriza yo kurisubiramo.',
            },
            {
              question: 'Nabasha nte kuvugana na PropSpera?',
              answer: 'Mushobora kutwandikira kuri hello@propspera.com. Twiteguye kubafasha.',
            },
          ],
        },
      ],
    },
  },
};
