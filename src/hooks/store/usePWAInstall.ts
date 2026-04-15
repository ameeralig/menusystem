import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    if (isStandalone) return;

    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');

    // للأندرويد: إظهار البانر فوراً عند استلام حدث beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
      // إظهار البانر فوراً بدون تأخير
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // لـ iOS: إظهار البانر بعد ثانية واحدة فقط
    let iosTimer: ReturnType<typeof setTimeout>;
    if (ios && !dismissed) {
      iosTimer = setTimeout(() => setShowBanner(true), 1000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }

    setDeferredPrompt(null);
    setCanInstall(false);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  }, []);

  return {
    canInstall,
    isIOS,
    isInstalled,
    showBanner,
    installApp,
    dismissBanner,
  };
};
