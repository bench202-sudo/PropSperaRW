import React from 'react';
import { UserRole } from '@/types';
import { useLanguage } from '@/contexts/AuthContext';
import { HomeIcon, SearchIcon, MessageIcon, UserIcon, ShieldCheckIcon, BuildingIcon } from '@/components/icons/Icons';

type NavItem = 'home' | 'search' | 'add' | 'messages' | 'profile' | 'admin';

interface BottomNavProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  userRole: UserRole | null;
  unreadMessages: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ 
  activeItem, 
  onNavigate, 
  userRole,
  unreadMessages 
}) => {
  const { t } = useLanguage();
  const navItems: { key: NavItem; icon: React.ReactNode; label: string; roles?: UserRole[] }[] = [
    { key: 'home', icon: <HomeIcon size={22} />, label: t('home') },
    { key: 'search', icon: <SearchIcon size={22} />, label: t('search') },
    { key: 'add', icon: <BuildingIcon size={22} />, label: t('navDashboard'), roles: ['agent', 'homeowner'] },
    { key: 'messages', icon: <MessageIcon size={22} />, label: t('messages') },
    { key: 'admin', icon: <ShieldCheckIcon size={22} />, label: t('navAdmin'), roles: ['admin'] },
    { key: 'profile', icon: <UserIcon size={22} />, label: t('profile') }
  ];

  const visibleItems = navItems.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40 pb-safe">
      <div className="flex items-center justify-around py-2">
        {visibleItems.map((item) => {
          const isActive = activeItem === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-colors ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.key === 'add' ? (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg ${
                  isActive ? 'bg-blue-700' : 'bg-blue-600'
                }`}>
                  <BuildingIcon size={24} className="text-white" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    {item.icon}
                    {item.key === 'messages' && unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
