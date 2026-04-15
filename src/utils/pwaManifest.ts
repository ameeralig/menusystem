/**
 * إنشاء manifest ديناميكي لكل متجر
 * كل متجر يحصل على id فريد حتى يمكن تثبيت عدة متاجر كتطبيقات منفصلة
 */

interface ManifestOptions {
  storeName: string;
  slug: string;
  iconUrl?: string;
}

export const injectDynamicManifest = ({ storeName, slug, iconUrl }: ManifestOptions) => {
  // إزالة manifest سابق إن وجد
  const existing = document.querySelector('link[rel="manifest"]');
  if (existing) existing.remove();

  const icon192 = iconUrl || '/app-icon-192.png';
  const icon512 = iconUrl || '/app-icon-512.png';

  const manifest = {
    // id فريد لكل متجر - هذا ما يجعل Chrome يعتبرها تطبيقات منفصلة
    id: `/${slug}`,
    name: storeName || 'QR Menu',
    short_name: (storeName || 'QR Menu').slice(0, 12),
    description: `منيو ${storeName} الرقمي`,
    start_url: `/${slug}`,
    scope: '/',
    display: 'standalone' as const,
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    dir: 'rtl' as const,
    lang: 'ar',
    icons: [
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    ],
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = url;
  document.head.appendChild(link);

  // تحديث apple-touch-icon لأجهزة iOS
  if (iconUrl) {
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = iconUrl;
  }
};

/**
 * تسجيل Service Worker
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  const isPreviewHost =
    window.location.hostname.includes('id-preview--') ||
    window.location.hostname.includes('lovableproject.com');

  if (isPreviewHost || isInIframe) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach(r => r.unregister());
    return;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration('/');
    if (existing) {
      // تحديث SW الموجود بدل إعادة التسجيل
      existing.update();
    } else {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
    console.log('Service Worker ready for PWA');
  } catch (error) {
    console.log('SW registration failed:', error);
  }
};
