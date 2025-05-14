
import { createRoot } from 'react-dom/client'
import { injectSpeedInsights } from '@vercel/speed-insights'
import App from './App.tsx'
import './index.css'

// تفعيل تتبع أداء الموقع (Speed Insights)
if (typeof window !== 'undefined') {
  injectSpeedInsights()
}

// استخدام createRoot لتحسين الأداء
createRoot(document.getElementById("root")!).render(<App />);
