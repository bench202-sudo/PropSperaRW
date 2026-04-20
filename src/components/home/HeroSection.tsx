import React from 'react';
import { SearchIcon, CheckCircleIcon, ShieldCheckIcon, BuildingIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';
 
interface HeroSectionProps {
  onSearch: (query: string) => void;
  onBrowseListings: () => void;
  onBecomeAgent: () => void;
  agentCount?: number;
  listingCount?: number;
}
 
const formatCount = (count: number): string => {
  if (count >= 200) return '200+';
  if (count >= 100) return '100+';
  if (count >= 50) return '50+';
  if (count >= 20) return '20+';
  if (count >= 10) return '10+';
  return count.toString();
};
 
const HeroSection: React.FC<HeroSectionProps> = ({ 
  onSearch, 
  onBrowseListings, 
  onBecomeAgent,
  agentCount = 0,
  listingCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { t } = useLanguage();
 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
 
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&h=1080&fit=crop"
          alt="Kigali skyline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />
      </div>
 
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          {/* Badge — hidden */}
 
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            <span className="sm:hidden">{t('heroTitle')}<span className="text-blue-400"> {t('heroTitleHighlight')}</span><br />{t('heroTitleEnd')}</span>
            <span className="hidden sm:inline whitespace-nowrap">{t('heroTitle')}<span className="text-blue-400"> {t('heroTitleHighlight')}</span> {t('heroTitleEnd')}</span>
          </h1>
 
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl">
            {t('heroSubtitle')}
          </p>
 
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('heroSearchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <button 
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('search')}
              </button>
            </div>
          </form>
 
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onBrowseListings}
              className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <BuildingIcon size={20} />
              {t('browseListings')}
            </button>
            <button 
              onClick={onBecomeAgent}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircleIcon size={20} />
              {t('becomeVerifiedAgent')}
            </button>
          </div>
 
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-6 mt-10 pt-10 border-t border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                <CheckCircleIcon size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{formatCount(agentCount)}</p>
                <p className="text-gray-400 text-sm">{t('verifiedAgents')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
                <BuildingIcon size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{formatCount(listingCount)}</p>
                <p className="text-gray-400 text-sm">{t('activeListings')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
                <ShieldCheckIcon size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-semibold">100%</p>
                <p className="text-gray-400 text-sm">{t('secure')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
 
export default HeroSection;

