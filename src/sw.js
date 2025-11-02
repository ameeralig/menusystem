import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// مطلوب بواسطة injectManifest
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

// استراتيجية للملفات الثابتة (صور، CSS، JS)
registerRoute(
  ({ request }) => 
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-resources',
  })
);

// استراتيجية للصفحات HTML - دائماً من الشبكة أولاً
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 10,
  })
);

// السماح لطلبات API (Supabase) بالمرور مباشرة دون تخزين
registerRoute(
  ({ url }) => 
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/storage/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  })
);
