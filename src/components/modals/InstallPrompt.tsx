import React from 'react';
import { useLanguage } from '@/contexts/AuthContext';

// ── Inline PWA Install Prompt ──────────────────────────────────────────
const InstallPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = React.useState<any>(null);
  const [show, setShow] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const { t } = useLanguage();
 
  React.useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios && !localStorage.getItem('pwa-dismissed')) {
      setTimeout(() => setShow(true), 4000);
    }
    const handler = (e: any) => {
      e.preventDefault();
      setInstallEvent(e);
      if (!localStorage.getItem('pwa-dismissed')) setTimeout(() => setShow(true), 4000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
 
  const handleInstall = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === 'accepted') setShow(false);
    }
    setShow(false);
  };
 
  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };
 
  if (!show) return null;
 
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{t('installApp')}</p>
            {isIOS ? (
              <p className="text-sm text-gray-500 mt-0.5">
                {t('iosTapShare')} <span className="font-medium">&quot;{t('iosAddToHomeScreen')}&quot;</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-0.5">{t('addToHomeScreenDesc')}</p>
            )}
          </div>
          <button onClick={handleDismiss} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {!isIOS && (
          <div className="flex gap-2 mt-3">
            <button onClick={handleDismiss} className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">{t('notNow')}</button>
            <button onClick={handleInstall} className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">{t('installBtn')}</button>
          </div>
        )}
        {isIOS && (
          <div className="mt-3 flex items-center gap-2 bg-blue-50 rounded-xl p-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            <p className="text-xs text-blue-700">{t('iosInstallHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
