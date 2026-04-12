import { createRoot } from 'react-dom/client'
import { lazy, Suspense } from 'react'
import App from './App.tsx'
import './index.css'
import { initCapacitorPlugins } from './utils/capacitor'
import { initPushNotifications } from './utils/pushNotifications'

// تهيئة Capacitor و Push Notifications
initCapacitorPlugins().then(() => {
  initPushNotifications();
});

// تحميل SpeedInsights بشكل متأخر (غير ضروري للـ LCP)
const SpeedInsights = lazy(() => 
  import('@vercel/speed-insights/react').then(m => ({ default: m.SpeedInsights }))
)

// استخدام createRoot لتحسين الأداء
createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Suspense fallback={null}>
      <SpeedInsights />
    </Suspense>
  </>
);
