import React, { useState } from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { User } from '@/types';
import { MenuIcon, MessageIcon, UserIcon, ShieldCheckIcon, ChevronDownIcon, BuildingIcon, HeartIcon, ColumnsIcon, BellIcon, SettingsIcon } from '@/components/icons/Icons';
import NotificationBell from '@/components/notifications/NotificationBell';
 
interface HeaderProps {
  currentUser: User | null;
  unreadMessages: number;
  favoritesCount: number;
  compareCount?: number;
  onMenuClick: () => void;
  onMessagesClick: () => void;
  onFavoritesClick: () => void;
  onCompareClick?: () => void;
  onProfileClick: () => void;
  onAccountSettingsClick?: () => void;
  onAdminClick?: () => void;
  onAgentDashboardClick?: () => void;
  onLoginClick: () => void;
  onNavigate?: (view: string) => void;
  onOpenNotificationPreferences?: () => void;
  logoUrl?: string;
}
 
const PropSperaLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="200" height="60" viewBox="0 0 560 110" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="hIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#2563eb'}}/>
        <stop offset="100%" style={{stopColor:'#1d4ed8'}}/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="100" height="100" rx="20" fill="url(#hIconGrad)"/>
    <polygon points="52,18 102,52 2,52" fill="white" opacity="0.95"/>
    <rect x="16" y="52" width="72" height="46" rx="3" fill="white" opacity="0.95"/>
    <rect x="38" y="68" width="28" height="30" rx="4" fill="#2563eb"/>
    <rect x="20" y="58" width="14" height="14" rx="2" fill="#93c5fd"/>
    <rect x="70" y="58" width="14" height="14" rx="2" fill="#93c5fd"/>
    <rect x="41" y="78" width="5" height="16" rx="1" fill="white" opacity="0.7"/>
    <rect x="50" y="74" width="5" height="20" rx="1" fill="white" opacity="0.85"/>
    <rect x="59" y="70" width="5" height="24" rx="1" fill="white"/>
    <text x="118" y="62"
      fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
      fontSize="46" fontWeight="700" fill="#1e3a8a"
      textLength="112" lengthAdjust="spacingAndGlyphs">Prop</text>
    <text x="230" y="62"
      fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
      fontSize="46" fontWeight="700" fill="#2563eb"
      textLength="130" lengthAdjust="spacingAndGlyphs">Spera</text>
  </svg>
);
 
const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadMessages,
  favoritesCount,
  compareCount = 0,
  onMenuClick,
  onMessagesClick,
  onFavoritesClick,
  onCompareClick,
  onProfileClick,
  onAccountSettingsClick,
  onAdminClick,
  onAgentDashboardClick,
  onLoginClick,
  onNavigate,
  onOpenNotificationPreferences,
  logoUrl
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { language, setLanguage, t } = useLanguage();
 
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
 
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate?.('home')}
            >
              <PropSperaLogo />
              <p className="hidden sm:block text-xs text-gray-500 leading-tight max-w-[130px]">
                {t('tagline_where')} <span className="font-semibold text-gray-700">{t('tagline_prop')}</span> {t('tagline_meets')} <span className="font-semibold text-gray-700">{t('tagline_pros')}</span>
              </p>
            </div>
          </div>
 
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => onNavigate?.('home')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">{t('home')}</button>
            <button onClick={() => onNavigate?.('search')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">{t('buy')}</button>
            <button onClick={() => onNavigate?.('search-rent')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">{t('rent')}</button>
            <button onClick={() => onNavigate?.('agents')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">{t('agents')}</button>
          </nav>
 
          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Language Switcher — always visible */}
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
              {(['en', 'fr', 'rw'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex items-center gap-1 px-2 py-1.5 text-xs font-semibold transition-colors ${
                    language === lang
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'Kinyarwanda'}
                >
                  <span>{lang === 'en' ? '🇬🇧' : lang === 'fr' ? '🇫🇷' : '🇷🇼'}</span>
                  <span className="hidden sm:inline">{lang.toUpperCase()}</span>
                </button>
              ))}
            </div>
 
            {compareCount > 0 && onCompareClick && (
              <button onClick={onCompareClick}
                className="relative flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                title="Compare Properties">
                <ColumnsIcon size={18} />
                <span className="hidden sm:inline">{t('compare')}</span>
                <span className="min-w-[20px] h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold">{compareCount}</span>
              </button>
            )}
 
            {currentUser ? (
              <>
                <button onClick={onFavoritesClick}
                  className="relative w-10 h-10 rounded-full hidden sm:flex items-center justify-center hover:bg-pink-50 transition-colors group"
                  title="Saved Properties">
                  <HeartIcon size={21} filled={favoritesCount > 0}
                    className={favoritesCount > 0 ? 'text-pink-500 group-hover:scale-110 transition-transform' : 'text-gray-600 group-hover:text-pink-500 transition-colors'} />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </button>
 
                <span className="hidden sm:block">
                  <NotificationBell
                    onOpenPreferences={() => onOpenNotificationPreferences?.()}
                    onLoginRequired={onLoginClick}
                  />
                </span>
 
                <button onClick={onMessagesClick}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <MessageIcon size={22} className="text-gray-600" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">{unreadMessages}</span>
                  )}
                </button>
 
                {currentUser.role === 'agent' && onAgentDashboardClick && (
                  <button onClick={onAgentDashboardClick}
                    className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Agent Dashboard">
                    <BuildingIcon size={22} className="text-gray-600" />
                  </button>
                )}
 
                {currentUser.role === 'admin' && onAdminClick && (
                  <button onClick={onAdminClick}
                    className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-gray-100 transition-colors">
                    <ShieldCheckIcon size={22} className="text-gray-600" />
                  </button>
                )}
 
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{currentUser.full_name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{currentUser.full_name.split(' ')[0]}</span>
                    <ChevronDownIcon size={16} className="text-gray-400" />
                  </button>
 
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-medium text-gray-900">{currentUser.full_name}</p>
                          <p className="text-sm text-gray-500">{currentUser.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            currentUser.role === 'agent' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{currentUser.role === 'admin' ? t('roleAdmin') : currentUser.role === 'agent' ? t('roleAgent') : t('roleUser')}</span>
                        </div>
 
                        <button onClick={() => { setShowProfileMenu(false); onFavoritesClick(); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                          <HeartIcon size={16} filled={favoritesCount > 0} className={favoritesCount > 0 ? 'text-pink-500' : ''} />
                          {t('savedProperties')}
                          {favoritesCount > 0 && <span className="ml-auto bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full font-medium">{favoritesCount}</span>}
                        </button>

                        {onCompareClick && (
                          <button onClick={() => { setShowProfileMenu(false); onCompareClick(); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <ColumnsIcon size={16} className={compareCount > 0 ? 'text-indigo-500' : ''} />
                            {t('compareProperties')}
                            {compareCount > 0 && <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full font-medium">{compareCount}</span>}
                          </button>
                        )}

                        <button onClick={() => { setShowProfileMenu(false); onOpenNotificationPreferences?.(); }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                          <BellIcon size={16} />
                          {t('notificationSettings')}
                        </button>

                        {currentUser.role === 'agent' && onAgentDashboardClick && (
                          <button onClick={() => { setShowProfileMenu(false); onAgentDashboardClick(); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <BuildingIcon size={16} />
                            {t('agentDashboard')}
                          </button>
                        )}

                        {currentUser.role === 'admin' && onAdminClick && (
                          <button onClick={() => { setShowProfileMenu(false); onAdminClick(); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <ShieldCheckIcon size={16} />
                            {t('adminDashboard')}
                          </button>
                        )}

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          {onAccountSettingsClick && (
                            <button onClick={() => { setShowProfileMenu(false); onAccountSettingsClick(); }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                              <SettingsIcon size={16} />
                              {t('accountSettings')}
                            </button>
                          )}
                          <button onClick={() => { setShowProfileMenu(false); onProfileClick(); }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            {t('signOut')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={onFavoritesClick}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-50 transition-colors hidden sm:flex"
                  title="Saved Properties">
                  <HeartIcon size={21} className="text-gray-600 hover:text-pink-500 transition-colors" />
                </button>
                <button onClick={onLoginClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  {t('signIn')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
 
export default Header;