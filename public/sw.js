// Service Worker - مطلوب لتفعيل تثبيت PWA كتطبيق حقيقي على Android
const CACHE_NAME = 'qrmenu-pwa-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => 
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy - لا نخزن شيء لكن نرد بشكل صحيح
  event.respondWith(
    fetch(event.request).catch(() => {
      // في حال عدم وجود إنترنت، نرد بصفحة فارغة للتنقل
      if (event.request.mode === 'navigate') {
        return new Response('<html><body><h1>لا يوجد اتصال بالإنترنت</h1></body></html>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      return new Response('', { status: 408 });
    })
  );
});
