import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabasePublic } from '@/lib/supabase';
import { Property } from '@/types';
import { extractIdFromSlug } from '@/utils/seo';
import { formatPropertyPrice } from '@/components/property/PropertyCard';
import InquiryModal from '@/components/property/InquiryModal';
import MortgageCalculator from '@/components/mortgage/MortgageCalculator';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MapPinIcon,
  BedIcon,
  BathIcon,
  AreaIcon,
  PlotSizeIcon,
  CheckCircleIcon,
  PhoneIcon,
  MessageIcon,
  StarIcon,
  CalendarIcon,
} from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import SuccessModal from '@/components/SuccessModal';

// ── Helper: format date ───────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ── Helper: WhatsApp ──────────────────────────────────────────────────────────
function getWhatsAppNumber(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('250') && digits.length >= 12) return digits;
  if (digits.length >= 12) return digits;
  return '250' + digits;
}

// ── PropertyPage ─────────────────────────────────────────────────────────────
const PropertyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { appUser } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites(appUser?.id ?? null);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  // ── Fetch property ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const id = extractIdFromSlug(slug);
    // Basic UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      setLoading(true);

      // Fetch property
      const { data: propData, error: propError } = await supabasePublic
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('hidden', false)
        .single();

      if (propError || !propData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch agent info if present
      let agentInfo: Property['agent'] | undefined;
      if (propData.agent_id) {
        const { data: agentData } = await supabasePublic
          .from('agents')
          .select('id, user_id, company_name, bio, years_experience, specializations, verification_status, total_listings, rating')
          .eq('id', propData.agent_id)
          .single();

        if (agentData?.user_id) {
          const { data: userData } = await supabasePublic
            .from('users')
            .select('id, full_name, email, phone, avatar_url, created_at')
            .eq('id', agentData.user_id)
            .single();

          if (userData) {
            agentInfo = {
              id: agentData.id,
              full_name: userData.full_name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              avatar_url:
                userData.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || 'Agent')}&background=2563eb&color=fff`,
              company_name: agentData.company_name || '',
              verification_status: agentData.verification_status,
              total_listings: agentData.total_listings || 0,
              rating: agentData.rating || 0,
              user: {
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                phone: userData.phone,
                role: 'agent' as const,
                avatar_url:
                  userData.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || 'Agent')}&background=2563eb&color=fff`,
                created_at: userData.created_at,
              },
            } as Property['agent'];
          }
        }
      }

      const p: Property = {
        id: propData.id,
        agent_id: propData.agent_id || '',
        agent: agentInfo,
        title: propData.title,
        description: propData.description || undefined,
        property_type: propData.property_type,
        listing_type: propData.listing_type,
        price: propData.price,
        currency: propData.currency,
        bedrooms: propData.bedrooms || undefined,
        bathrooms: propData.bathrooms || undefined,
        area_sqm: propData.area_sqm || undefined,
        location: propData.location,
        neighborhood: propData.neighborhood || undefined,
        address: propData.address || undefined,
        latitude: propData.latitude || undefined,
        longitude: propData.longitude || undefined,
        images: propData.images || [],
        video_url: propData.video_url ?? null,
        amenities: propData.amenities || [],
        status: propData.status,
        featured: propData.featured,
        views: propData.views,
        created_at: propData.created_at,
      } as Property;

      // Silently increment views
      supabasePublic.rpc('increment_property_views', { property_id: id }).then(({ error: rpcErr }) => {
        if (rpcErr) {
          supabasePublic
            .from('properties')
            .update({ views: (propData.views || 0) + 1 })
            .eq('id', id);
        }
      });

      setProperty(p);
      setLoading(false);
    };

    fetchProperty();
  }, [slug]);

  // ── SEO / Open Graph ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!property) return;

    const beds = property.bedrooms && property.bedrooms > 0 ? `${property.bedrooms} Bedroom ` : '';
    const typeLabel =
      property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1);
    const listingLabel = property.listing_type === 'rent' ? 'for Rent' : 'for Sale';
    const loc = property.neighborhood || 'Kigali';
    const titleStr = `${beds}${typeLabel} ${listingLabel} in ${loc} | PropSpera`;
    document.title = titleStr;

    const priceStr =
      property.currency === 'USD'
        ? `$${property.price.toLocaleString()}`
        : `${property.price.toLocaleString()} RWF`;
    const description = `${beds}${typeLabel.toLowerCase()} ${listingLabel} in ${loc}, Kigali — ${priceStr}${property.listing_type === 'rent' ? '/month' : ''}. Browse verified listings and contact agents on PropSpera.`;

    const upsertMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const upsertOG = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    upsertMeta('description', description);
    upsertOG('og:title', titleStr);
    upsertOG('og:description', description);
    upsertOG('og:type', 'article');
    upsertOG('og:url', window.location.href);
    upsertOG('og:site_name', 'PropSpera');
    if (property.images[0]) upsertOG('og:image', property.images[0]);

    // Twitter card
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', titleStr);
    upsertMeta('twitter:description', description);
    if (property.images[0]) upsertMeta('twitter:image', property.images[0]);
  }, [property]);

  // ── Media carousel ──────────────────────────────────────────────────────────
  const videoUrl: string | null = property ? (property as any).video_url ?? null : null;
  const mediaItems = property
    ? [
        ...(videoUrl ? [{ type: 'video' as const, src: videoUrl }] : []),
        ...property.images.map((src) => ({ type: 'image' as const, src })),
      ]
    : [];
  const totalMedia = mediaItems.length;
  const currentMedia = mediaItems[currentMediaIndex] ?? null;

  const nextMedia = () =>
    setCurrentMediaIndex((prev) => (prev === totalMedia - 1 ? 0 : prev + 1));
  const prevMedia = () =>
    setCurrentMediaIndex((prev) => (prev === 0 ? totalMedia - 1 : prev - 1));

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const isFav = property ? favoriteIds.includes(property.id) : false;

  const handleToggleFavorite = () => {
    if (!property) return;
    toggleFavorite(property.id);
  };

  const getWhatsAppMessage = (): string => {
    if (!property) return '';
    const listingType = property.listing_type === 'rent' ? 'for rent' : 'for sale';
    const price =
      property.currency === 'USD'
        ? `$${property.price.toLocaleString()}`
        : `${property.price.toLocaleString()} RWF`;
    const priceLabel = property.listing_type === 'rent' ? `${price}/month` : price;
    const beds = property.bedrooms && property.bedrooms > 0 ? `${property.bedrooms} bedroom(s), ` : '';
    const baths =
      property.bathrooms && property.bathrooms > 0 ? `${property.bathrooms} bathroom(s), ` : '';
    const area = property.area_sqm ? `${property.area_sqm} sqm, ` : '';
    const location = property.address || `${property.neighborhood}, ${property.location}`;
    return [
      `Hello, I found your listing on PropSpera and I'm interested in the following property:`,
      ``,
      `🏠 *${property.title}*`,
      `📍 Location: ${location}`,
      `💰 Price: ${priceLabel}`,
      `🛏 ${`${beds}${baths}${area}`.replace(/,\s*$/, '')}`,
      `📋 Listing type: ${listingType}`,
      ``,
      `Could you please provide more details and arrange a visit?`,
      ``,
      `Thank you!`,
    ].join('\n');
  };

  const builtArea = property ? (property as any).built_area : undefined;
  const furnished = property ? (property as any).furnished as string | undefined : undefined;
  const showMortgageCalculator =
    property && property.listing_type === 'sale' && property.price > 0;

  // ── Share helpers ──────────────────────────────────────────────────────────
  const pageUrl = window.location.href;

  const handleCopyLink = async () => {
    if (!navigator.clipboard) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2500);
      return;
    }
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2500);
    }
  };

  const buildShareMessage = (): string => {
    if (!property) return pageUrl;
    const price =
      property.currency === 'USD'
        ? `$${property.price.toLocaleString()}`
        : `${property.price.toLocaleString()} RWF`;
    const priceLabel =
      property.listing_type === 'rent' ? `${price}/month` : price;
    const location =
      property.address || [property.neighborhood, property.location].filter(Boolean).join(', ');
    return [
      `Check out this property on PropSpera:`,
      ``,
      `\uD83C\uDFE0 *${property.title}*`,
      `\uD83D\uDCCD ${location}`,
      `\uD83D\uDCB0 ${priceLabel}`,
      ``,
      pageUrl,
    ].join('\n');
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(buildShareMessage())}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleNativeShare = async () => {
    if (!property) return;
    const price =
      property.currency === 'USD'
        ? `$${property.price.toLocaleString()}`
        : `${property.price.toLocaleString()} RWF`;
    const priceLabel =
      property.listing_type === 'rent' ? `${price}/month` : price;
    const location =
      property.address || [property.neighborhood, property.location].filter(Boolean).join(', ');
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `${property.title} \u2014 ${priceLabel} in ${location}`,
          url: pageUrl,
        });
      } catch { /* user cancelled */ }
    } else {
      handleShareWhatsApp();
    }
  };

  // ── Render: loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('loadingProperties')}</p>
        </div>
      </div>
    );
  }

  // ── Render: 404 ─────────────────────────────────────────────────────────────
  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 rounded-xl border border-gray-200 bg-white shadow-md max-w-md w-full mx-4">
          <h1 className="text-5xl font-bold mb-4 text-blue-600">404</h1>
          <p className="text-xl text-gray-700 mb-2 font-semibold">Property Not Found</p>
          <p className="text-gray-500 mb-6">
            This listing may have been removed or the link is invalid.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse all listings
          </Link>
        </div>
      </div>
    );
  }

  // ── Render: property page ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky back-navigation bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium shrink-0"
          >
            <ChevronLeftIcon size={18} />
            Back
          </button>
          <span className="text-gray-300">|</span>
          <Link to="/" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors shrink-0">
            PropSpera
          </Link>
          <span className="ml-auto text-sm text-gray-400 truncate max-w-[140px] hidden sm:block">
            {property.neighborhood || property.location}
          </span>

          {/* Compact share buttons */}
          <div className="flex items-center gap-0.5 ml-auto sm:ml-2">
            {/* WhatsApp share */}
            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              aria-label="Share on WhatsApp"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              title="Copy link"
              aria-label="Copy link"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              {copyStatus === 'copied' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </button>

            {/* Native share — shown only when supported */}
            {'share' in navigator && (
              <button
                onClick={handleNativeShare}
                title="Share"
                aria-label="Share"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Copy-link toast */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ${
          copyStatus !== 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-medium text-white whitespace-nowrap ${
          copyStatus === 'copied' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {copyStatus === 'copied' ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Link copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Clipboard not supported
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Media Carousel */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[16/10] mb-6 shadow-md">
          {currentMedia?.type === 'video' ? (
            <video
              key={currentMedia.src}
              src={currentMedia.src}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : currentMedia ? (
            <img
              src={currentMedia.src}
              alt={`${property.bedrooms ? property.bedrooms + ' bedroom ' : ''}${property.property_type} in ${property.neighborhood || 'Kigali'}`}
              className="w-full h-full object-cover"
            />
          ) : null}

          {/* Navigation arrows */}
          {totalMedia > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRightIcon size={20} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {totalMedia > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`rounded-full transition-all ${
                    index === currentMediaIndex ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {property.featured && (
              <span className="bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                {t('featured')}
              </span>
            )}
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                property.listing_type === 'sale'
                  ? 'bg-terracotta-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {property.listing_type === 'sale' ? t('forSaleFilter') : t('forRentFilter')}
            </span>
            {property.listing_type === 'rent' && furnished && (
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  furnished === 'furnished' ? 'bg-violet-600 text-white' : 'bg-gray-600 text-white'
                }`}
              >
                {furnished === 'furnished' ? t('furnished') : t('unfurnished')}
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <HeartIcon size={18} filled={isFav} className={isFav ? 'text-red-500' : 'text-gray-600'} />
          </button>

          {/* Photo count */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            {currentMediaIndex + 1} / {totalMedia}
          </div>
        </div>

        {/* Price & Title */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <span className="text-3xl font-bold text-gray-900">
                {formatPropertyPrice(property.price, property.currency)}
              </span>
              {property.listing_type === 'rent' && (
                <span className="text-gray-500 ml-1 text-base">{t('perMonth')}</span>
              )}
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h1>

          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <MapPinIcon size={15} />
            <span>{property.address || `${property.neighborhood}, ${property.location}`}</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 py-4 border-y border-gray-100 mt-4 flex-wrap">
            {property.property_type !== 'land' &&
              property.bedrooms !== undefined &&
              property.bedrooms > 0 && (
                <div className="flex flex-col items-center">
                  <BedIcon size={22} className="text-blue-600 mb-1" />
                  <span className="text-sm font-medium">
                    {property.bedrooms} {property.bedrooms === 1 ? t('bed') : t('beds')}
                  </span>
                </div>
              )}
            {property.property_type !== 'land' &&
              property.bathrooms !== undefined &&
              property.bathrooms > 0 && (
                <div className="flex flex-col items-center">
                  <BathIcon size={22} className="text-blue-600 mb-1" />
                  <span className="text-sm font-medium">
                    {property.bathrooms} {property.bathrooms === 1 ? t('bath') : t('baths')}
                  </span>
                </div>
              )}
            {property.area_sqm && (
              <div className="flex flex-col items-center">
                <PlotSizeIcon size={22} className="text-blue-600 mb-1" />
                <span className="text-sm font-medium">{property.area_sqm} {t('sqm')}</span>
                <span className="text-xs text-gray-400">{t('plot')}</span>
              </div>
            )}
            {property.property_type !== 'land' && builtArea && (
              <div className="flex flex-col items-center">
                <AreaIcon size={22} className="text-blue-600 mb-1" />
                <span className="text-sm font-medium">{builtArea} {t('sqm')}</span>
                <span className="text-xs text-gray-400">{t('builtLabel')}</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <CalendarIcon size={22} className="text-blue-600 mb-1" />
              <span className="text-sm font-medium">{formatDate(property.created_at)}</span>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mt-4">
              <h2 className="font-semibold text-gray-900 mb-2">{t('description')}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
            </div>
          )}
        </div>

        {/* Mortgage Calculator */}
        {showMortgageCalculator && (
          <div className="mb-4">
            <MortgageCalculator
              propertyId={property.id}
              propertyPrice={property.price}
              propertyTitle={property.title}
              currency={property.currency || 'RWF'}
            />
          </div>
        )}

        {/* Amenities */}
        {property.property_type !== 'land' && property.amenities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">{t('amenities')}</h2>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Agent Card */}
        {property.agent && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">{t('listedBy')}</h2>
            <div className="flex items-center gap-3">
              <img
                src={property.agent.avatar_url}
                alt={property.agent.full_name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {(property.agent as any).company_name || property.agent.user?.full_name}
                  </span>
                  {property.agent.verification_status === 'approved' && (
                    <CheckCircleIcon size={16} className="text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{property.agent.user?.full_name}</p>
                {property.agent.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <StarIcon size={14} filled className="text-amber-400" />
                    <span className="text-sm font-medium">{property.agent.rating}</span>
                    <span className="text-sm text-gray-500">
                      · {property.agent.total_listings} {t('listingsLabel')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share this property */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Share this property</p>
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm border ${
                copyStatus === 'copied'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : copyStatus === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              {copyStatus === 'copied' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : copyStatus === 'error' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Failed
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Copy link
                </>
              )}
            </button>

            {/* Native share pill — only when supported */}
            {'share' in navigator && (
              <button
                onClick={handleNativeShare}
                title="More sharing options"
                aria-label="More sharing options"
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 transition-colors shadow-sm border border-gray-200 shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={() => setShowInquiry(true)}
            className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <MessageIcon size={20} />
            {t('sendMessageBtn')}
          </button>

          {property.agent?.user?.phone ? (
            <a
              href={`https://wa.me/${getWhatsAppNumber(property.agent.user.phone)}?text=${encodeURIComponent(getWhatsAppMessage())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md"
              title="WhatsApp"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <InquiryModal
          property={property}
          onClose={() => setShowInquiry(false)}
          onSuccess={() => {
            setShowInquiry(false);
            setSuccessModal({
              title: t('inquirySent'),
              message: t('inquirySentMsg'),
            });
          }}
        />
      )}

      {/* Success Modal */}
      {successModal && (
        <SuccessModal
          title={successModal.title}
          message={successModal.message}
          type="success"
          onClose={() => setSuccessModal(null)}
        />
      )}
    </div>
  );
};

export default PropertyPage;
