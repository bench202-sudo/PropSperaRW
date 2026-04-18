import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Property, Agent, SearchFilters, Conversation } from '@/types';
 
import { neighborhoods } from '@/data/mockData';
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
import { ShieldCheckIcon, SearchIcon, UsersIcon, StarIcon, BuildingIcon, MapPinIcon, ColumnsIcon, XIcon, GridIcon, MapIcon, SplitIcon } from '@/components/icons/Icons';

// Extracted utilities and hooks
import { buildSEOTitle, buildSEOMeta, applySEOMeta, applySEOUrl } from '@/utils/seo';
import { useConversations } from '@/hooks/useConversations';

// Extracted modal components
import ContactModal from '@/components/modals/ContactModal';
import FAQModal from '@/components/modals/FAQModal';
import HelpCenterModal from '@/components/modals/HelpCenterModal';
import TermsOfServiceModal from '@/components/modals/TermsOfServiceModal';
import PrivacyPolicyModal from '@/components/modals/PrivacyPolicyModal';
import InstallPrompt from '@/components/modals/InstallPrompt';
 
 
// ─────────────────────────────────────────────────────────────────────────────
 
 
 
type NavItem = 'home' | 'search' | 'add' | 'messages' | 'profile' | 'admin';
type View = 'home' | 'search' | 'agents' | 'favorites' | 'compare';
type SearchViewMode = 'grid' | 'map' | 'split';
 
const MAX_COMPARE = 3;
 
 
 
 
 
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

  // Conversations — fetched and polled by dedicated hook
  const { conversations, unreadCount: unreadMessages } = useConversations(appUser);

  
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
  const [localAuthError, setLocalAuthError] = useState<string | null>(null);

  // When an OAuth error is set (e.g. Google sign-in provisioning failure),
  // automatically open the login modal so the user sees the error message.
  useEffect(() => {
    if (oauthError) {
      setAuthModalView('login');
      setAgentSignupIntent(false);
      setShowAuthModal(true);
    }
  }, [oauthError]);

  // AuthCallback page passes errors via ?auth_error= query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authErr = params.get('auth_error');
    if (authErr) {
      const msg = decodeURIComponent(authErr);
      setLocalAuthError(msg);
      setAuthModalView('login');
      setAgentSignupIntent(false);
      setShowAuthModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
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
  const [successModal, setSuccessModal] = useState<{ title: string; message: string; type: 'success' | 'pending'; actionLabel?: string; onAction?: () => void } | null>(null);
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
    if (appUser.role === 'agent' || appUser.role === 'admin') {
      setSuccessModal({
        title: 'You\'re Already a Verified Agent',
        message: 'Your account is already registered as an agent. To update your profile or details, please go to Account Settings.',
        type: 'success',
        actionLabel: 'Go to Account Settings',
        onAction: () => setShowProfilePage(true),
      });
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
          onClose={() => { setShowAuthModal(false); setAgentSignupIntent(false); clearOauthError(); setLocalAuthError(null); }}
          initialView={authModalView}
          agentSignupIntent={agentSignupIntent}
          initialError={oauthError ?? localAuthError ?? undefined}
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
          actionLabel={successModal.actionLabel}
          onAction={successModal.onAction}
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