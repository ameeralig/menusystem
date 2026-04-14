// Service Worker بسيط - مطلوب لتفعيل تثبيت PWA على Android
// لا يقوم بتخزين مؤقت لتجنب مشاكل المحتوى القديم

const CACHE_NAME = 'qrmenu-pwa-v1';

// عند التثبيت - تخطي الانتظار
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// عند التفعيل - مسح الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => 
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// عند طلب الشبكة - تمرير مباشر بدون تخزين
self.addEventListener('fetch', (event) => {
  // لا نتدخل - فقط نمرر الطلب للشبكة
  return;
});
