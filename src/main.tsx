
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App.tsx'
import './index.css'

// استخدام createRoot لتحسين الأداء
createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <SpeedInsights />
  </>
);

// تسجيل Service Worker بعد التحميل لتحسين TTI
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/registerSW.js', { scope: '/' });
  });
}
