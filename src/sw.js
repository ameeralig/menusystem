import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// مطلوب بواسطة injectManifest:
// سيقوم vite-plugin-pwa بحقن قائمة الملفات هنا أثناء البناء
// لا تحذف هذا السطر!
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

// بسيط: إعادة أي ملف من الكاش وإن لم يوجد يتم الجلب من الشبكة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
