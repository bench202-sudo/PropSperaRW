import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User as AppUser, UserRole } from '@/types';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
 
interface AuthContextType {
  user: SupabaseUser | null;
  appUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, full_name?: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resendVerificationEmail: () => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}
 
 
// ─── Language System ──────────────────────────────────────────────────────────
 
type Language = 'en' | 'fr';
 
const translations = {
  en: {
    // Common
    loading: 'Loading...', save: 'Save Changes', cancel: 'Cancel', close: 'Close',
    submit: 'Submit', retry: 'Retry', refresh: 'Refresh', search: 'Search',
    clear: 'Clear', view: 'View', hide: 'Hide', edit: 'Edit', approve: 'Approve',
    reject: 'Reject', back: 'Back', processing: 'Processing...', comingSoon: 'Coming Soon',
    error: 'An error occurred. Please try again.', noResults: 'No results found',
    perMonth: '/month', beds: 'Beds', bed: 'Bed', baths: 'Baths', bath: 'Bath', sqm: 'm²',
    // Nav
    home: 'Home', buy: 'Buy', rent: 'Rent', agents: 'Agents', compare: 'Compare',
    favorites: 'Saved Properties', messages: 'Messages', profile: 'Profile',
    // Header
    tagline_prop: 'PROPERTY', tagline_meets: 'meets', tagline_pros: 'PROSPERITY',
    signIn: 'Sign In', signUp: 'Sign Up', listProperty: 'List Property',
    becomeAgent: 'Become an Agent', notifications: 'Notifications',
    savedProperties: 'Saved Properties', compareProperties: 'Compare Properties',
    notificationSettings: 'Notification Settings', agentDashboard: 'Agent Dashboard',
    adminDashboard: 'Admin Dashboard', accountSettings: 'Account Settings', signOut: 'Sign Out',
    // Footer
    quickLinks: 'Quick Links', forAgents: 'For Agents', support: 'Support',
    browseProperties: 'Browse Properties', findAgents: 'Find Agents',
    forSale: 'For Sale', forRent: 'For Rent', newListings: 'New Listings',
    agentLogin: 'Agent Login', listAProperty: 'List a Property',
    agentResources: 'Agent Resources', successStories: 'Success Stories',
    helpCenter: 'Help Center', contactUs: 'Contact Us', privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service', faq: 'FAQ',
    footerDesc: "Kigali's trusted real estate marketplace connecting buyers with verified agents.",
    footerRights: '© 2026 PropSpera. All rights reserved.',
    // Property
    featured: 'Featured', furnished: 'Furnished', unfurnished: 'Unfurnished',
    pending: 'Pending', live: 'Live', rejected: 'Rejected', sold: 'Sold', rented: 'Rented',
    plotSize: 'Plot', builtArea: 'Built', views: 'views', listedBy: 'Listed by',
    description: 'Description', amenities: 'Amenities', address: 'Address',
    viewDetails: 'View Details', sendMessage: 'Send Message', comparing: 'Comparing',
    house: 'House', apartment: 'Apartment', villa: 'Villa', commercial: 'Commercial', land: 'Land',
    // Search
    searchTitle: 'Search Properties', allTypes: 'All Types', allListings: 'All Listings',
    allNeighborhoods: 'All Neighborhoods', minPrice: 'Min Price', maxPrice: 'Max Price',
    minBeds: 'Min Beds', sortBy: 'Sort By', newest: 'Newest First',
    priceAsc: 'Price: Low to High', priceDesc: 'Price: High to Low', mostViewed: 'Most Viewed',
    noProperties: 'No properties match your search', clearFilters: 'Clear all filters',
    gridView: 'Grid View', mapView: 'Map View', splitView: 'Split View',
    // Auth
    email: 'Email Address', password: 'Password', confirmPassword: 'Confirm Password',
    fullName: 'Full Name', phone: 'Phone Number', forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
    welcomeBack: 'Welcome back', createAccount: 'Create your account',
    signingIn: 'Signing in...', creatingAccount: 'Creating account...',
    // Contact
    contactTitle: 'Contact Us', contactSubtitle: "We'll get back to you within 24 hours",
    contactSend: 'Send Message', contactSending: 'Sending...',
    contactSuccess: 'Message Sent!', contactSuccessMsg: 'Thank you for reaching out. Our team will get back to you within 24 hours.',
    contactError: 'Failed to send message. Please try again or email hello@propspera.com.',
    contactOrEmail: 'Or email us directly at',
    messagePlaceholder: 'How can we help you? Tell us about your property needs, questions, or feedback...',
    // Profile
    personalInfo: 'Personal Info', changePassword: 'Password', activity: 'Activity',
    connected: 'Connected', dangerZone: 'Danger Zone', memberSince: 'Member Since',
    accountRole: 'Account Role', profileUpdated: 'Profile updated successfully!',
    passwordUpdated: 'Password changed successfully!', changePhoto: 'Change Photo',
    currentPassword: 'Current Password', newPassword: 'New Password',
    updatePassword: 'Update Password', exportData: 'Export Your Data',
    signOutAll: 'Sign Out Everywhere',
    // Coming soon modal
    // ─── Mortgage Calculator ────────────────────────────────────────────
    mortgageCalculator: 'Mortgage Calculator',
    yearsLabel: 'yr',
    mcPropertyPrice: 'Property Price',
    mcDownPayment: 'Down Payment',
    mcAnnualRate: 'Annual Interest Rate (%)',
    mcLoanTerm: 'Loan Term (Years)',
    mcMonthlyPayment: 'MONTHLY PAYMENT',
    mcTotalInterest: 'TOTAL INTEREST',
    mcLoanAmount: 'LOAN AMOUNT',
    mcTotalCost: 'TOTAL COST',
    mcMonthly: '/month',
    mcPaymentBreakdown: 'Payment Breakdown',
    mcPrincipal: 'Principal',
    mcInterest: 'Interest',
    mcSaveComparison: 'Save for Comparison',
    mcSaved: 'Saved!',
    mcViewSchedule: 'View Schedule',
    mcHideSchedule: 'Hide Schedule',
    mcCompare: 'Compare',
    mcAmortizationSchedule: 'Amortization Schedule',
    mcYearly: 'Yearly',
    mcMonthlyView: 'Monthly',
    mcYearLabel: 'Year',
    mcMonthLabel: 'Month',
    mcPayment: 'Payment',
    mcBalance: 'Balance',
    mcSavedComparisons: 'Saved Comparisons',
    mcCompareFinancing: 'Compare financing options across properties',
    mcCurrent: 'Current',
    mcDownShort: 'down',
    mcRateShort: 'rate',
    mcTermShort: 'yr term',
    mcDisclaimer: 'This calculator provides estimates only. Actual mortgage terms may vary based on your credit score, lender requirements, and market conditions.',
    mcShowingFirst: 'Showing first {count} of {total} months. Switch to yearly view for full overview.',
    // ─── Mortgage Calculator ────────────────────────────────────────────
    // ─── Hero Section ─────────────────────────────────────────────────────
    //heroBadge: 'Trusted by 500+ families in Kigali',
    heroTitle: 'Find Your Perfect',
    heroTitleHighlight: 'Property',
    heroTitleEnd: 'in Kigali',
    heroSubtitle: "Connect with verified real estate agents and discover premium properties across Rwanda's capital city.",
    heroSearchPlaceholder: 'Search by neighborhood, property type...',
    browseListings: 'Browse Listings',
    becomeVerifiedAgent: 'Become a Verified Agent',
    verifiedAgents: 'Verified Agents',
    activeListings: 'Active Listings',
    secure: 'Secure',
    // ─── Neighborhood Section ──────────────────────────────────────────────
    exploreNeighborhoods: 'Explore Kigali Neighborhoods',
    exploreNeighborhoodsSubtitle: "Discover properties in Kigali's most sought-after areas",
    property: 'property',
    properties: 'properties',
    // ─── Search Filters ────────────────────────────────────────────────────
    searchPlaceholder: 'Search properties in Kigali...',
    filtersBtn: 'Filters',
    forSaleChip: 'For Sale',
    forRentChip: 'For Rent',
    housesChip: 'Houses',
    apartmentsChip: 'Apartments',
    villasChip: 'Villas',
    verifiedOnlyChip: 'Verified Only',
    propertyFound: 'property found',
    propertiesFoundCount: 'properties found',
    filtersTitle: 'Filters',
    propertyTypeLabel: 'Property Type',
    allTypes: 'All Types',
    listingTypeLabel: 'Listing Type',
    allLabel: 'All',
    forSaleLabel: 'For Sale',
    forRentLabel: 'For Rent',
    bedroomsLabel: 'Bedrooms',
    anyLabel: 'Any',
    neighborhoodLabel: 'Neighborhood',
    priceRangeLabel: 'Price Range (RWF)',
    verifiedAgentsOnly: 'Verified Agents Only',
    verifiedAgentsOnlyDesc: 'Show only properties from verified agents',
    clearAll: 'Clear All',
    applyFilters: 'Apply Filters',
    // ─── Agents Section (home page) ──────────────────────────────────────
    verifiedProfessionals: 'Verified Professionals',
    meetTopAgents: 'Meet Our Top Agents',
    agentsSectionSubtitle: 'Work with trusted, verified real estate professionals in Kigali',
    findAgent: 'Find an Agent',
    viewAllAgents: 'View All Agents',
    whyVerifiedAgents: 'Why Choose Verified Agents?',
    whyVerifiedAgentsDesc: 'All PropSpera agents undergo thorough verification including RDB Certificate validation, ID verification, background checks, and professional assessment.',
    verified: 'Verified',
    response: 'Response',
    // ─── Featured / Latest Properties ────────────────────────────────────
    featuredProperties: 'Featured Properties',
    latestProperties: 'Latest Properties',
    featuredPropertiesSubtitle: 'Hand-picked premium listings in Kigali',
    latestPropertiesSubtitle: 'Browse our newest property listings',
    viewAll: 'View All',
    viewAllProperties: 'View All Properties',
    // ─── Agents page ──────────────────────────────────────────────────────
    allAgentsVerified: 'All Agents Verified & Licensed',
    realEstatePro: 'Are You a Real Estate Professional?',
    joinNetworkDesc: "Join PropSpera's network of verified agents. Get access to qualified leads, powerful listing tools, and a growing community of professionals.",
    applyNow: 'Apply Now',
    findAgentsTitle: 'Find Your Perfect Agent',
    agentsSubtitle: 'Browse our network of verified real estate professionals in Kigali. Filter by specialization, experience, and rating.',
    verifiedAgentsLabel: 'Verified Agents',
    totalListings: 'Total Listings',
    areasCovered: 'Areas Covered',
    noAgentsFound: 'No agents found',
    noAgentsMatch: 'No agents match your current filters. Try adjusting your search criteria or clearing the filters.',
    clearAllFilters: 'Clear All Filters',
    // ─── Homeowner ────────────────────────────────────────────────────────
    homeownerRole: 'Home Owner',
    homeownerDashboard: 'My Listings',
    addMyProperty: 'Add My Property',
    homeownerBadge: 'Home Owner',
    // ─── Favorites ────────────────────────────────────────────────────────
    myFavorites: 'My Favorites',
    noFavorites: 'No favorites yet',
    noFavoritesHint: 'Save properties you love and find them here',
    browsePropertiesBtn: 'Browse Properties',
    // ─── Search / Compare ─────────────────────────────────────────────────
    noPropertiesMatch: 'No properties match your filters',
    propertySelected: 'property selected',
    propertiesSelected: 'properties selected',
    // ─── Agent Dashboard ──────────────────────────────────────────────────
    agentDashboard: 'Agent Dashboard',
    manageListings: 'Manage your property listings',
    inquiries: 'Inquiries',
    activeLabel: 'Active',
    pendingLabel: 'Pending',
    addProperty: 'Add Property',
    noPropertiesYet: 'No properties yet',
    noFilteredProperties: 'No {status} properties',
    startByAdding: 'Start by adding your first property listing',
    tryDifferentFilter: 'Try selecting a different filter',
    addFirstProperty: 'Add Your First Property',
    loadingYourProperties: 'Loading your properties...',
    markSold: 'Mark Sold',
    markRented: 'Mark Rented',
    contactAdminDetails: 'Contact admin for details',
    forSaleTag: 'For Sale',
    forRentTag: 'For Rent',
    updating: 'Updating...',
    // ─── Property Comparison ──────────────────────────────────────────────
    backToListings: 'Back to Listings',
    compareUpTo: 'Compare up to {max} properties side by side. Differences are highlighted in yellow.',
    noPropertiesToCompare: 'No Properties to Compare',
    noPropertiesCompareHint: 'Select 2-3 properties from the listings to compare them side by side.',
    addAnotherProperty: 'Add Another Property',
    clearAll2: 'Clear All',
    pricePerSqm: 'Price/m²',
    amenitiesSection: 'Amenities',
    agentInfo: 'Agent Information',
    agent: 'Agent',
    rating: 'Rating',
    experience: 'Experience',
    bedroom: 'Bedroom',
    bathroom: 'Bathroom',
    year: 'year',
    valuesDiffer: 'Values differ between properties',
    bestValue: 'Best value in category',
    forSaleBadge: 'For Sale',
    forRentBadge: 'For Rent',
    // ─── User Profile Page ────────────────────────────────────────────────
    manageProfile: 'Manage your profile and preferences',
    personalInfoDesc: 'Update your personal details and profile photo.',
    profilePhoto: 'Profile Photo',
    uploading: 'Uploading...',
    saving: 'Saving...',
    confirmNewPassword: 'Confirm New Password',
    passwordDesc: 'Ensure your account stays secure by using a strong password.',
    weakPw: 'Weak',
    fairPw: 'Fair',
    goodPw: 'Good',
    strongPw: 'Strong',
    veryStrongPw: 'Very Strong',
    atLeast6: 'At least 6 characters',
    oneUppercase: 'One uppercase letter',
    oneNumber: 'One number',
    oneSpecial: 'One special character',
    passwordsMatch: 'Passwords match',
    passwordsMismatch: 'Passwords do not match',
    activityDesc: 'Recent actions and login history for your account.',
    noActivity: 'No activity yet',
    noActivityHint: 'Your account activity will appear here as you use the platform.',
    connectedDesc: 'Link your social accounts for faster sign-in and enhanced security.',
    comingSoonSocial: 'Social Sign-In Coming Soon',
    comingSoonSocialDesc: 'We are working on adding Google, Facebook and other social sign-in options to make logging in faster and more secure.',
    notAvailableYet: 'Not available yet',
    currentSignInMethod: 'Your current sign-in method',
    dangerZoneDesc: 'Irreversible actions that affect your account.',
    exportDataDesc: 'Download a copy of all your data including profile, saved properties, and activity history.',
    signOutAllDesc: 'Sign out of all active sessions on all devices. You will need to sign in again.',
    signOutAllBtn: 'Sign Out All',
    // ─── Admin Dashboard ──────────────────────────────────────────────────────
    adminTitle: 'Admin Dashboard',
    totalAgents: 'Total Agents',
    totalListingsLabel: 'Total Listings',
    totalViews: 'Total Views',
    acrossAllListings: 'Across all listings',
    verifiedCount: 'verified',
    pendingCount: 'pending',
    inactiveCount: 'inactive',
    liveCount: 'live',
    deactivatedCount: 'deactivated',
    requiresAttention: 'Requires your attention',
    pendingReview: 'Pending review',
    newNotifications: 'new notifications',
    noPendingItems: 'No pending items',
    allCaughtUp: 'All caught up!',
    approve: 'Approve',
    approveAgent: 'Approve Agent',
    deactivateAgent: 'Deactivate Agent',
    reactivateAgent: 'Reactivate',
    markFeatured: 'Mark as Featured',
    removeFeatured: 'Remove from Featured',
    hide: 'Hide',
    view: 'View',
    contactInfo: 'Contact Info',
    pendingStatus: 'Pending',
    rejectedStatus: 'Rejected',
    liveStatus: 'Live',
    deactivated: 'Deactivated',
    processing: 'Processing...',
    propertyDetails: 'Property Details',
    unknownAgent: 'Unknown Agent',
    noPropertyListings: 'No property listings',
    refresh: 'Refresh',
    comingSoonMsg: "This feature is coming soon. We're working hard to bring it to you. Stay tuned!",
    gotIt: 'Got it',
    // Search & Filters
    propertiesInKigali: 'Properties in Kigali', searchPlaceholder: 'Search properties in Kigali...',
    filters: 'Filters', forSaleFilter: 'For Sale', forRentFilter: 'For Rent',
    houses: 'Houses', apartments: 'Apartments', villas: 'Villas', verifiedOnly: 'Verified Only',
    propertiesFound: 'properties found', propertyFound: 'property found',
    noPropertiesFound: 'No properties found', tryAdjustingFilters: 'Try adjusting your filters or search criteria',
    loadingProperties: 'Loading properties...', loadingAgents: 'Loading agents...',
    // Property Card & Detail
    furnished: 'Furnished', unfurnished: 'Unfurnished',
    comparing: 'Comparing', sendMessageBtn: 'Send Message',
    plot: 'Plot', builtLabel: 'Built',
    approvedStatus: 'Approved', pendingStatus: 'Pending', rejectedStatus: 'Rejected',
    // Agent Card & Profile
    verifiedAgent: 'Verified Agent', pendingVerification: 'Pending Verification',
    listingsLabel: 'listings', yrsExp: 'yrs exp', contactAgentBtn: 'Contact Agent',
    aboutTab: 'About', reviewsTab: 'Reviews',
    specializationsLabel: 'Specializations', contactInfoLabel: 'Contact Information',
    memberSinceLabel: 'Member since', activeListingsLabel: 'Active Listings',
    // Agent Dashboard
    inquiriesLabel: 'Inquiries', totalListingsLabel: 'Total Listings',
    awaitingApproval: 'Awaiting admin approval', contactAdminDetails: 'Contact admin for details',
    accountPendingApproval: 'Account Pending Approval',
    accountPendingMsg: "Your agent account is currently under review. You'll be able to access your dashboard once approved.",
    updatingStatus: 'Updating...',
    // Admin Dashboard
    totalAgentsLabel: 'Total Agents', totalListingsLabel2: 'Total Listings',
    pendingReviewLabel: 'Pending Review', requiresAttention: 'Requires your attention',
    totalViewsLabel2: 'Total Views', acrossAllListings: 'Across all listings',
    actionRequired: 'Action Required', allCaughtUp: 'All Caught Up!',
    allCaughtUpMsg: 'No pending items require your attention.',
    noAgentApplications: 'No Agent Applications', noPropertyListings: 'No Property Listings',
    deactivatedBadge: 'Deactivated', liveBadge: 'Live', adminFeedbackLabel: 'Admin Feedback',
    verificationDocsLabel: 'Verification Documents', approveAgentBtn: 'Approve Agent',
    deactivateAgentBtn: 'Deactivate Agent', reactivateAgentBtn: 'Reactivate Agent',
    processingBtn: 'Processing...', removeFromFeatured: 'Remove from Featured',
    markAsFeatured: 'Mark as Featured', inactiveLabel: 'inactive',
    deactivatedLabel: 'deactivated', verifiedLabel: 'verified', pendingLabel: 'pending',
    documentLabel: 'Document', viewAllCount: 'View All {count} Agents',
  },
  fr: {
    // Common
    loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', close: 'Fermer',
    submit: 'Soumettre', retry: 'Réessayer', refresh: 'Actualiser', search: 'Rechercher',
    clear: 'Effacer', view: 'Voir', hide: 'Masquer', edit: 'Modifier', approve: 'Approuver',
    reject: 'Rejeter', back: 'Retour', processing: 'En cours...', comingSoon: 'Bientôt',
    error: "Une erreur s'est produite. Veuillez réessayer.', noResults: 'Aucun résultat",
    perMonth: '/mois', beds: 'Chambres', bed: 'Chambre', baths: 'Salles de bain', bath: 'Salle de bain', sqm: 'm²',
    // Nav
    home: 'Accueil', buy: 'Acheter', rent: 'Louer', agents: 'Agents', compare: 'Comparer',
    favorites: 'Favoris', messages: 'Messages', profile: 'Profil',
    // Header
    tagline_prop: 'PROPRIÉTÉ', tagline_meets: 'rencontre la', tagline_pros: 'PROSPÉRITÉ',
    signIn: 'Se connecter', signUp: "S'inscrire", listProperty: 'Publier un bien',
    becomeAgent: 'Devenir agent', notifications: 'Notifications',
    savedProperties: 'Biens sauvegardés', compareProperties: 'Comparer les biens',
    notificationSettings: 'Paramètres de notification', agentDashboard: 'Tableau de bord agent',
    adminDashboard: 'Tableau de bord admin', accountSettings: 'Paramètres du compte', signOut: 'Se déconnecter',
    // Footer
    quickLinks: 'Liens rapides', forAgents: 'Pour les agents', support: 'Assistance',
    browseProperties: 'Parcourir les biens', findAgents: 'Trouver un agent',
    forSale: 'À vendre', forRent: 'À louer', newListings: 'Nouvelles annonces',
    agentLogin: 'Connexion agent', listAProperty: 'Publier un bien',
    agentResources: 'Ressources agents', successStories: 'Témoignages',
    helpCenter: "Centre d'aide", contactUs: 'Nous contacter', privacyPolicy: 'Confidentialité',
    termsOfService: "Conditions d'utilisation", faq: 'FAQ',
    footerDesc: "La marketplace immobilière de confiance à Kigali, mettant en relation acheteurs et agents vérifiés.",
    footerRights: '© 2026 PropSpera. Tous droits réservés.',
    // Property
    featured: 'En vedette', furnished: 'Meublé', unfurnished: 'Non meublé',
    pending: 'En attente', live: 'En ligne', rejected: 'Refusé', sold: 'Vendu', rented: 'Loué',
    plotSize: 'Terrain', builtArea: 'Construit', views: 'vues', listedBy: 'Publié par',
    description: 'Description', amenities: 'Équipements', address: 'Adresse',
    viewDetails: 'Voir les détails', sendMessage: 'Envoyer un message', comparing: 'Comparaison',
    house: 'Maison', apartment: 'Appartement', villa: 'Villa', commercial: 'Commercial', land: 'Terrain',
    // Search
    searchTitle: 'Rechercher des biens', allTypes: 'Tous les types', allListings: 'Toutes les annonces',
    allNeighborhoods: 'Tous les quartiers', minPrice: 'Prix min.', maxPrice: 'Prix max.',
    minBeds: 'Chambres min.', sortBy: 'Trier par', newest: 'Plus récent',
    priceAsc: 'Prix croissant', priceDesc: 'Prix décroissant', mostViewed: 'Plus vus',
    noProperties: 'Aucun bien ne correspond à votre recherche', clearFilters: 'Effacer les filtres',
    gridView: 'Vue grille', mapView: 'Vue carte', splitView: 'Vue partagée',
    // Auth
    email: 'Adresse e-mail', password: 'Mot de passe', confirmPassword: 'Confirmer le mot de passe',
    fullName: 'Nom complet', phone: 'Numéro de téléphone', forgotPassword: 'Mot de passe oublié ?',
    noAccount: "Vous n'avez pas de compte ?", hasAccount: 'Vous avez déjà un compte ?',
    welcomeBack: 'Bon retour', createAccount: 'Créer votre compte',
    signingIn: 'Connexion...', creatingAccount: 'Création du compte...',
    // Contact
    contactTitle: 'Nous contacter', contactSubtitle: 'Nous vous répondrons dans les 24 heures',
    contactSend: 'Envoyer le message', contactSending: 'Envoi...',
    contactSuccess: 'Message envoyé !', contactSuccessMsg: 'Merci de nous avoir contactés. Notre équipe vous répondra dans les 24 heures.',
    contactError: "Échec de l'envoi. Veuillez réessayer ou écrire à hello@propspera.com.",
    contactOrEmail: 'Ou écrivez-nous directement à',
    messagePlaceholder: 'Comment pouvons-nous vous aider ? Parlez-nous de vos besoins...',
    // Profile
    personalInfo: 'Informations personnelles', changePassword: 'Mot de passe', activity: 'Activité',
    connected: 'Connecté', dangerZone: 'Zone dangereuse', memberSince: 'Membre depuis',
    accountRole: 'Rôle du compte', profileUpdated: 'Profil mis à jour !',
    passwordUpdated: 'Mot de passe modifié !', changePhoto: 'Changer la photo',
    currentPassword: 'Mot de passe actuel', newPassword: 'Nouveau mot de passe',
    updatePassword: 'Mettre à jour', exportData: 'Exporter vos données',
    signOutAll: 'Se déconnecter partout',
    // Coming soon modal
    // ─── Mortgage Calculator ────────────────────────────────────────────
    mortgageCalculator: 'Calculateur de prêt',
    yearsLabel: 'ans',
    mcPropertyPrice: 'Prix du bien',
    mcDownPayment: 'Apport',
    mcAnnualRate: "Taux d'intérêt annuel (%)",
    mcLoanTerm: 'Durée du prêt (années)',
    mcMonthlyPayment: 'MENSUALITÉ',
    mcTotalInterest: 'INTÉRÊTS TOTAUX',
    mcLoanAmount: 'MONTANT DU PRÊT',
    mcTotalCost: 'COÛT TOTAL',
    mcMonthly: '/mois',
    mcPaymentBreakdown: 'Répartition du paiement',
    mcPrincipal: 'Capital',
    mcInterest: 'Intérêts',
    mcSaveComparison: 'Sauvegarder pour comparaison',
    mcSaved: 'Sauvegardé !',
    mcViewSchedule: 'Voir le tableau',
    mcHideSchedule: 'Masquer le tableau',
    mcCompare: 'Comparer',
    mcAmortizationSchedule: "Tableau d'amortissement",
    mcYearly: 'Annuel',
    mcMonthlyView: 'Mensuel',
    mcYearLabel: 'Année',
    mcMonthLabel: 'Mois',
    mcPayment: 'Paiement',
    mcBalance: 'Solde',
    mcSavedComparisons: 'Comparaisons sauvegardées',
    mcCompareFinancing: 'Comparer les options de financement',
    mcCurrent: 'Actuel',
    mcDownShort: 'apport',
    mcRateShort: 'taux',
    mcTermShort: 'ans',
    mcDisclaimer: 'Ce calculateur fournit des estimations uniquement. Les conditions réelles du prêt peuvent varier selon votre score de crédit et les conditions du marché.',
    mcShowingFirst: 'Affichage des {count} premiers sur {total} mois. Passez en vue annuelle pour un aperçu complet.',
    // ─── Hero Section ─────────────────────────────────────────────────────
    //heroBadge: '500+ familles nous font confiance à Kigali',
    heroTitle: 'Trouvez votre bien',
    heroTitleHighlight: 'idéal',
    heroTitleEnd: 'à Kigali',
    heroSubtitle: "Connectez-vous avec des agents immobiliers vérifiés et découvrez des biens premium dans la capitale du Rwanda.",
    heroSearchPlaceholder: 'Rechercher par quartier, type de bien...',
    browseListings: 'Voir les annonces',
    becomeVerifiedAgent: 'Devenir agent vérifié',
    verifiedAgents: 'Agents vérifiés',
    activeListings: 'Annonces actives',
    secure: 'Sécurisé',
    // ─── Neighborhood Section ──────────────────────────────────────────────
    exploreNeighborhoods: 'Explorer les quartiers de Kigali',
    exploreNeighborhoodsSubtitle: "Découvrez des biens dans les quartiers les plus prisés de Kigali",
    property: 'bien',
    properties: 'biens',
    // ─── Search Filters ────────────────────────────────────────────────────
    searchPlaceholder: 'Rechercher des biens à Kigali...',
    filtersBtn: 'Filtres',
    forSaleChip: 'À vendre',
    forRentChip: 'À louer',
    housesChip: 'Maisons',
    apartmentsChip: 'Appartements',
    villasChip: 'Villas',
    verifiedOnlyChip: 'Agents vérifiés',
    propertyFound: 'bien trouvé',
    propertiesFoundCount: 'biens trouvés',
    filtersTitle: 'Filtres',
    propertyTypeLabel: 'Type de bien',
    allTypes: 'Tous les types',
    listingTypeLabel: "Type d'annonce",
    allLabel: 'Tout',
    forSaleLabel: 'À vendre',
    forRentLabel: 'À louer',
    bedroomsLabel: 'Chambres',
    anyLabel: 'Tout',
    neighborhoodLabel: 'Quartier',
    priceRangeLabel: 'Fourchette de prix (RWF)',
    verifiedAgentsOnly: 'Agents vérifiés uniquement',
    verifiedAgentsOnlyDesc: "Afficher uniquement les biens d'agents vérifiés",
    clearAll: 'Tout effacer',
    applyFilters: 'Appliquer les filtres',
    // ─── Agents Section (home page) ──────────────────────────────────────
    verifiedProfessionals: 'Professionnels vérifiés',
    meetTopAgents: 'Nos meilleurs agents',
    agentsSectionSubtitle: 'Travaillez avec des professionnels immobiliers de confiance à Kigali',
    findAgent: 'Trouver un agent',
    viewAllAgents: 'Voir tous les agents',
    whyVerifiedAgents: 'Pourquoi choisir des agents vérifiés ?',
    whyVerifiedAgentsDesc: "Tous les agents PropSpera sont soumis à une vérification rigoureuse incluant la validation du certificat RDB, de la carte d'identité, des antécédents et une évaluation professionnelle.",
    verified: 'Vérifiés',
    response: 'Réponse',
    // ─── Featured / Latest Properties ────────────────────────────────────
    featuredProperties: 'Biens en vedette',
    latestProperties: 'Dernières annonces',
    featuredPropertiesSubtitle: 'Sélection premium de biens à Kigali',
    latestPropertiesSubtitle: 'Découvrez nos dernières annonces immobilières',
    viewAll: 'Voir tout',
    viewAllProperties: 'Voir tous les biens',
    // ─── Agents page ──────────────────────────────────────────────────────
    allAgentsVerified: 'Tous les agents vérifiés et agréés',
    realEstatePro: "Vous êtes un professionnel de l'immobilier ?",
    joinNetworkDesc: "Rejoignez le réseau d'agents vérifiés de PropSpera. Accédez à des prospects qualifiés, des outils de publication puissants et une communauté professionnelle grandissante.",
    applyNow: 'Postuler maintenant',
    findAgentsTitle: 'Trouvez votre agent idéal',
    agentsSubtitle: 'Parcourez notre réseau de professionnels immobiliers vérifiés à Kigali. Filtrez par spécialisation, expérience et note.',
    verifiedAgentsLabel: 'Agents vérifiés',
    totalListings: 'Total annonces',
    areasCovered: 'Zones couvertes',
    noAgentsFound: 'Aucun agent trouvé',
    noAgentsMatch: "Aucun agent ne correspond à vos filtres. Essayez d'ajuster vos critères ou effacez les filtres.",
    clearAllFilters: 'Effacer tous les filtres',
    // ─── Homeowner ────────────────────────────────────────────────────────
    homeownerRole: 'Propriétaire',
    homeownerDashboard: 'Mes annonces',
    addMyProperty: 'Ajouter mon bien',
    homeownerBadge: 'Propriétaire',
    // ─── Favorites ────────────────────────────────────────────────────────
    myFavorites: 'Mes favoris',
    noFavorites: 'Aucun favori',
    noFavoritesHint: 'Sauvegardez vos biens préférés et retrouvez-les ici',
    browsePropertiesBtn: 'Parcourir les biens',
    // ─── Search / Compare ─────────────────────────────────────────────────
    noPropertiesMatch: 'Aucun bien ne correspond à vos filtres',
    propertySelected: 'bien sélectionné',
    propertiesSelected: 'biens sélectionnés',
    // ─── Agent Dashboard ──────────────────────────────────────────────────
    agentDashboard: 'Tableau de bord agent',
    manageListings: 'Gérez vos annonces immobilières',
    inquiries: 'Demandes',
    activeLabel: 'Actif',
    pendingLabel: 'En attente',
    addProperty: 'Ajouter un bien',
    noPropertiesYet: 'Aucun bien encore',
    noFilteredProperties: 'Aucun bien {status}',
    startByAdding: 'Commencez par ajouter votre première annonce',
    tryDifferentFilter: 'Essayez un autre filtre',
    addFirstProperty: 'Ajouter votre premier bien',
    loadingYourProperties: 'Chargement de vos biens...',
    markSold: 'Marquer vendu',
    markRented: 'Marquer loué',
    contactAdminDetails: "Contacter l'admin pour les détails",
    forSaleTag: 'À vendre',
    forRentTag: 'À louer',
    updating: 'Mise à jour...',
    // ─── Property Comparison ──────────────────────────────────────────────
    backToListings: 'Retour aux annonces',
    compareUpTo: "Comparez jusqu'à {max} biens côte à côte. Les différences sont surlignées en jaune.",
    noPropertiesToCompare: 'Aucun bien à comparer',
    noPropertiesCompareHint: 'Sélectionnez 2-3 biens dans les annonces pour les comparer côte à côte.',
    addAnotherProperty: 'Ajouter un autre bien',
    clearAll2: 'Tout effacer',
    pricePerSqm: 'Prix/m²',
    amenitiesSection: 'Équipements',
    agentInfo: "Informations sur l'agent",
    agent: 'Agent',
    rating: 'Note',
    experience: 'Expérience',
    bedroom: 'Chambre',
    bathroom: 'Salle de bain',
    year: 'an',
    valuesDiffer: 'Les valeurs diffèrent entre les biens',
    bestValue: 'Meilleure valeur dans la catégorie',
    forSaleBadge: 'À vendre',
    forRentBadge: 'À louer',
    // ─── User Profile Page ────────────────────────────────────────────────
    manageProfile: 'Gérez votre profil et vos préférences',
    personalInfoDesc: 'Mettez à jour vos informations personnelles et votre photo de profil.',
    profilePhoto: 'Photo de profil',
    uploading: 'Téléchargement...',
    saving: 'Enregistrement...',
    confirmNewPassword: 'Confirmer le nouveau mot de passe',
    passwordDesc: 'Assurez-vous que votre compte reste sécurisé avec un mot de passe fort.',
    weakPw: 'Faible',
    fairPw: 'Passable',
    goodPw: 'Bon',
    strongPw: 'Fort',
    veryStrongPw: 'Très fort',
    atLeast6: 'Au moins 6 caractères',
    oneUppercase: 'Une lettre majuscule',
    oneNumber: 'Un chiffre',
    oneSpecial: 'Un caractère spécial',
    passwordsMatch: 'Les mots de passe correspondent',
    passwordsMismatch: 'Les mots de passe ne correspondent pas',
    activityDesc: 'Actions récentes et historique de connexion de votre compte.',
    noActivity: 'Aucune activité',
    noActivityHint: "L'activité de votre compte apparaîtra ici au fur et à mesure de votre utilisation.",
    connectedDesc: 'Liez vos comptes sociaux pour une connexion plus rapide et sécurisée.',
    comingSoonSocial: 'Connexion sociale bientôt disponible',
    comingSoonSocialDesc: "Nous travaillons à l'ajout de Google, Facebook et d'autres options de connexion sociale.",
    notAvailableYet: 'Pas encore disponible',
    currentSignInMethod: 'Votre méthode de connexion actuelle',
    dangerZoneDesc: 'Actions irréversibles qui affectent votre compte.',
    exportDataDesc: 'Téléchargez une copie de toutes vos données incluant profil, biens sauvegardés et historique.',
    signOutAllDesc: 'Déconnectez-vous de toutes les sessions actives sur tous les appareils.',
    signOutAllBtn: 'Déconnecter partout',
    // ─── Admin Dashboard ──────────────────────────────────────────────────────
    adminTitle: 'Tableau de bord Admin',
    totalAgents: 'Total Agents',
    totalListingsLabel: 'Total Annonces',
    totalViews: 'Total Vues',
    acrossAllListings: 'Sur toutes les annonces',
    verifiedCount: 'vérifiés',
    pendingCount: 'en attente',
    inactiveCount: 'inactifs',
    liveCount: 'actives',
    deactivatedCount: 'désactivées',
    requiresAttention: 'Nécessite votre attention',
    pendingReview: 'En attente de révision',
    newNotifications: 'nouvelles notifications',
    noPendingItems: 'Aucun élément en attente',
    allCaughtUp: 'Tout est à jour !',
    approve: 'Approuver',
    approveAgent: "Approuver l’agent",
    deactivateAgent: "Désactiver l’agent",
    reactivateAgent: 'Réactiver',
    markFeatured: 'Mettre en vedette',
    removeFeatured: 'Retirer des vedettes',
    hide: 'Masquer',
    view: 'Voir',
    contactInfo: 'Informations de contact',
    pendingStatus: 'En attente',
    rejectedStatus: 'Rejeté',
    liveStatus: 'Actif',
    deactivated: 'Désactivé',
    processing: 'Traitement...',
    propertyDetails: 'Détails du bien',
    unknownAgent: 'Agent inconnu',
    noPropertyListings: 'Aucune annonce',
    refresh: 'Actualiser',
    comingSoonMsg: "Cette fonctionnalité arrive bientôt. Nous travaillons dur pour vous l'apporter !",
    gotIt: 'Compris',
    // Search & Filters
    propertiesInKigali: 'Propriétés à Kigali', searchPlaceholder: 'Rechercher des propriétés à Kigali...',
    filters: 'Filtres', forSaleFilter: 'À vendre', forRentFilter: 'À louer',
    houses: 'Maisons', apartments: 'Appartements', villas: 'Villas', verifiedOnly: 'Agents vérifiés',
    propertiesFound: 'propriétés trouvées', propertyFound: 'propriété trouvée',
    noPropertiesFound: 'Aucune propriété trouvée', tryAdjustingFilters: 'Essayez de modifier vos filtres ou critères de recherche',
    loadingProperties: 'Chargement des propriétés...', loadingAgents: 'Chargement des agents...',
    // Property Card & Detail
    furnished: 'Meublé', unfurnished: 'Non meublé',
    comparing: 'Comparaison', sendMessageBtn: 'Envoyer un message',
    plot: 'Terrain', builtLabel: 'Construit',
    approvedStatus: 'Approuvé', pendingStatus: 'En attente', rejectedStatus: 'Rejeté',
    // Agent Card & Profile
    verifiedAgent: 'Agent vérifié', pendingVerification: 'Vérification en cours',
    listingsLabel: 'annonces', yrsExp: 'ans exp.', contactAgentBtn: 'Contacter l\'agent',
    aboutTab: 'À propos', reviewsTab: 'Avis',
    specializationsLabel: 'Spécialisations', contactInfoLabel: 'Coordonnées',
    memberSinceLabel: 'Membre depuis', activeListingsLabel: 'Annonces actives',
    // Agent Dashboard
    inquiriesLabel: 'Demandes', totalListingsLabel: 'Total annonces',
    awaitingApproval: "En attente d'approbation admin", contactAdminDetails: "Contactez l'admin pour les détails",
    accountPendingApproval: 'Compte en attente d\'approbation',
    accountPendingMsg: "Votre compte agent est en cours d'examen. Vous pourrez accéder à votre tableau de bord une fois approuvé.",
    updatingStatus: 'Mise à jour...',
    // Admin Dashboard
    totalAgentsLabel: 'Total agents', totalListingsLabel2: 'Total annonces',
    pendingReviewLabel: 'En attente de révision', requiresAttention: 'Nécessite votre attention',
    totalViewsLabel2: 'Vues totales', acrossAllListings: 'Sur toutes les annonces',
    actionRequired: 'Action requise', allCaughtUp: 'Tout est à jour !',
    allCaughtUpMsg: "Aucun élément en attente ne nécessite votre attention.",
    noAgentApplications: 'Aucune candidature d\'agent', noPropertyListings: 'Aucune annonce immobilière',
    deactivatedBadge: 'Désactivé', liveBadge: 'En ligne', adminFeedbackLabel: 'Retour admin',
    verificationDocsLabel: 'Documents de vérification', approveAgentBtn: 'Approuver l\'agent',
    deactivateAgentBtn: 'Désactiver l\'agent', reactivateAgentBtn: 'Réactiver l\'agent',
    processingBtn: 'Traitement...', removeFromFeatured: 'Retirer des vedettes',
    markAsFeatured: 'Mettre en vedette', inactiveLabel: 'inactif(s)',
    deactivatedLabel: 'désactivé(s)', verifiedLabel: 'vérifié(s)', pendingLabel: 'en attente',
    documentLabel: 'Document', viewAllCount: 'Voir les {count} agents',
  },
} as const;
 
type TranslationKey = keyof typeof translations.en;
 
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}
 
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
 
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within AuthProvider');
  return context;
};
 
// ─── End Language System ──────────────────────────────────────────────────────
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
 
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  const timeout = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms));
  return Promise.race([promise, timeout]);
};
 
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('propspera_lang');
    return (saved === 'fr' ? 'fr' : 'en') as Language;
  });
 
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('propspera_lang', lang);
  };
 
  const t = (key: TranslationKey): string => translations[language][key] as string;
 
  const fetchAppUser = async (authId: string): Promise<AppUser | null> => {
    try {
      const result = await withTimeout(
        supabase.from('users').select('*').eq('auth_id', authId).single(),
        5000,
        { data: null, error: { message: 'Profile fetch timed out' } as any }
      );
      if (result.error) {
        console.warn('Error fetching user profile:', result.error.message || result.error);
        return null;
      }
      return result.data as AppUser;
    } catch (error) {
      console.warn('Error fetching user profile:', error);
      return null;
    }
  };
 
  useEffect(() => {
    let mounted = true;
 
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialLoadDone.current) {
        console.warn('Auth initialization safety timeout reached');
        initialLoadDone.current = true;
        setLoading(false);
      }
    }, 8000);
 
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('🔐 Auth event:', event, '| Session:', newSession ? 'active' : 'null');
      if (!mounted) return;
 
      // When a password-reset link is clicked the user lands anywhere in the app
      // (depending on Supabase Site URL config). Redirect them to /reset-password
      // so they can set a new password regardless of which page they landed on.
      if (event === 'PASSWORD_RECOVERY') {
        if (window.location.pathname !== '/reset-password') {
          window.location.href = '/reset-password';
        }
        return;
      }

 
      setSession(newSession);
      setUser(newSession?.user ?? null);
 
      if (newSession?.user) {
        try {
          if (event === 'SIGNED_IN') {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          if (!mounted) return;
          const profile = await fetchAppUser(newSession.user.id);
          if (mounted && profile) {
            setAppUser(profile);
          } else if (event === 'SIGNED_IN' && !profile) {
            // New OAuth user — no public.users row yet. Auto-create with role buyer.
            const { user } = newSession;
            const isOAuth = user.app_metadata?.provider !== 'email';
            if (isOAuth && mounted) {
              try {
                const fullName =
                  user.user_metadata?.full_name ??
                  user.user_metadata?.name ??
                  user.email?.split('@')[0] ??
                  'User';
                await supabase.from('users').upsert(
                  { auth_id: user.id, email: user.email, full_name: fullName, role: 'buyer' },
                  { onConflict: 'auth_id' }
                );
                const newProfile = await fetchAppUser(user.id);
                if (mounted && newProfile) setAppUser(newProfile);
              } catch (oauthErr) {
                console.warn('Could not auto-create OAuth user profile:', oauthErr);
              }
            }
          }
        } catch (err) {
          console.warn('Error fetching profile after auth change:', err);
        }
      } else {
        if (mounted) setAppUser(null);
      }
 
      if (mounted) {
        initialLoadDone.current = true;
        setLoading(false);
      }
    });
 
    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);
 
  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
 
      if (error) return { error };
 
      // Set up user profile
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          const { data: existingUser } = await supabase
            .from('users').select('id').eq('auth_id', data.user.id).single();
 
          if (existingUser) {
            await supabase.from('users')
              .update({ role, full_name: fullName })
              .eq('auth_id', data.user.id);
          } else {
            await supabase.from('users')
              .insert({ auth_id: data.user.id, email, full_name: fullName, role });
          }
        } catch (profileErr) {
          console.warn('Error setting up user profile during signup:', profileErr);
        }
 
        // Send branded verification email via Resend
        try {
          await supabase.functions.invoke('send-verification-email', {
            body: { email, full_name: fullName }
          });
          console.log('✅ Verification email sent via Resend');
        } catch (emailErr) {
          console.warn('Could not send custom verification email:', emailErr);
        }
      }
 
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
 
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
 
  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch (err) { console.warn('Error during sign out:', err); }
    setUser(null);
    setAppUser(null);
    setSession(null);
  };
 
  const resetPassword = async (email: string, full_name?: string) => {
    try {
      // The edge function always returns HTTP 200 — errors are signalled via
      // data.success === false so we can read the actual message.
      const { data, error } = await supabase.functions.invoke('reset-or-invite', {
        body: { email, full_name: full_name ?? '' },
      });
      if (error) {
        // Unexpected HTTP error (network, DNS, etc.) — surface raw message.
        return { error: new Error((error as Error).message ?? 'Failed to reach email service') };
      }
      if (data && data.success === false) {
        console.error('reset-or-invite error detail:', data.detail ?? data.error);
        return { error: new Error(data.error ?? 'Failed to send reset email') };
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };
 
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
 
  const resendVerificationEmail = async () => {
    if (!user?.email) return { error: new Error('No email address found') };
    try {
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { 
          email: user.email, 
          full_name: user.user_metadata?.full_name || '' 
        }
      });
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
 
  const refreshUser = async () => {
    if (user) {
      try {
        const profile = await fetchAppUser(user.id);
        setAppUser(profile);
      } catch (err) {
        console.warn('Error refreshing user:', err);
      }
    }
  };
 
  const value = { user, appUser, session, loading, signUp, signIn, signOut, resetPassword, updatePassword, resendVerificationEmail, refreshUser, signInWithGoogle };
 
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </LanguageContext.Provider>
  );
};
 
export default AuthContext;
 