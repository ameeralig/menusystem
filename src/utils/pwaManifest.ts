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
    scope: `/${slug}`,
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      {
        src: iconUrl || '/app-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: iconUrl || '/app-icon.png',
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
