
import { createRoot } from 'react-dom/client'
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();
import App from './App.tsx'
import './index.css'

// استخدام createRoot لتحسين الأداء
createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <SpeedInsights />
  </>
);
