import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';

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

// عدم اعتراض تنقلات الصفحات: اتركها للمتصفح/الخادم
// هذا يمنع أي تعارض قد يسبب صفحة فارغة في وضع PWA

// السماح لطلبات API (Supabase) بالمرور مباشرة دون تخزين (NetworkOnly)
registerRoute(
  ({ url }) => 
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/storage/'),
  new NetworkOnly()
);
