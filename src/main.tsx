
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/speed-insights'
import App from './App.tsx'
import './index.css'

// تفعيل تتبع أداء الموقع (Speed Insights)
if (typeof window !== 'undefined') {
  inject()
}

// استخدام createRoot لتحسين الأداء
createRoot(document.getElementById("root")!).render(<App />);
