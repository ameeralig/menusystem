
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// استخدام createRoot لتحسين الأداء
createRoot(document.getElementById("root")!).render(<App />);
