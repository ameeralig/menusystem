import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly } from 'workbox-strategies';

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

// معالجة تنقلات SPA: دائماً أعد index.html (من الشبكة إن أمكن وإلا من الكاش)
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api\//, /\/auth\//, /\/rest\//, /\/storage\//],
});
registerRoute(navigationRoute);

// السماح لطلبات API (Supabase) بالمرور مباشرة دون تخزين
registerRoute(
  ({ url }) => 
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/storage/'),
  new NetworkOnly()
);
