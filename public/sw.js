// Service Worker - PWA مع تخزين مؤقت للعمل بدون إنترنت
const CACHE_NAME = 'qrmenu-pwa-v3';
const STATIC_CACHE = 'qrmenu-static-v3';

// الملفات الأساسية التي نخزنها مسبقاً
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// تثبيت SW وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// تنظيف الكاش القديم عند التفعيل
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(n => n !== CACHE_NAME && n !== STATIC_CACHE)
          .map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // تجاهل طلبات غير HTTP
  if (!url.protocol.startsWith('http')) return;

  // طلبات API و Supabase: دائماً من الشبكة
  if (
    url.hostname.includes('supabase') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/functions/')
  ) {
    return;
  }

  // الملفات الثابتة (JS, CSS, صور, خطوط): Cache-First
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|otf)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  // صفحات التنقل (HTML): Network-First مع fallback للكاش
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cached => cached || caches.match('/index.html'))
            .then(fallback => fallback || new Response(
              '<html dir="rtl"><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a0a0a;color:white;font-family:sans-serif"><div style="text-align:center"><h1>📶 لا يوجد اتصال</h1><p>سيتم تحميل الصفحة عند عودة الاتصال</p></div></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            ))
        )
    );
    return;
  }

  // باقي الطلبات: Network-First
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(c => c || new Response('', { status: 408 })))
  );
});
