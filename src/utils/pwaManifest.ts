/**
 * إنشاء manifest ديناميكي لكل متجر
 * يضمن أن التطبيق المثبت يفتح صفحة المتجر مباشرة
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

  const manifest = {
    name: storeName || 'QR Menu',
    short_name: storeName || 'QR Menu',
    description: `منيو ${storeName} الرقمي`,
    start_url: `/${slug}`,
    scope: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      {
        src: iconUrl || '/app-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: iconUrl || '/app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * تسجيل Service Worker للـ PWA
 * مطلوب حتى يظهر خيار "تثبيت التطبيق" على Android بدلاً من "إنشاء اختصار"
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  // لا تسجل في بيئة المعاينة أو داخل iframe
  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  const isPreviewHost =
    window.location.hostname.includes('id-preview--') ||
    window.location.hostname.includes('lovableproject.com');

  if (isPreviewHost || isInIframe) {
    // إلغاء تسجيل أي service worker موجود في بيئة المعاينة
    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach(r => r.unregister());
    return;
  }

  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('Service Worker registered for PWA');
  } catch (error) {
    console.log('Service Worker registration failed:', error);
  }
};
