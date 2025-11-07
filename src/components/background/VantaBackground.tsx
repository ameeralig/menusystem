import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

const VantaBackground = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    // تأجيل تحميل Vanta حتى بعد First Contentful Paint
    let timeoutId: NodeJS.Timeout;
    
    const initAfterFCP = () => {
      // الانتظار حتى تكتمل الصفحة بالكامل
      if (document.readyState !== 'complete') {
        window.addEventListener('load', initAfterFCP, { once: true });
        return;
      }

      // تأجيل التحميل لمدة 2 ثانية بعد اكتمال الصفحة للسماح بـ FCP
      timeoutId = setTimeout(() => {
        loadAndInitVanta();
      }, 2000);
    };

    const loadAndInitVanta = async () => {
      try {
        // تحميل Three.js
        if (!window.THREE) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
            script.async = true;
            script.onload = () => resolve(window.THREE);
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // تحميل Vanta Dots
        if (!window.VANTA) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.dots.min.js';
            script.async = true;
            script.onload = () => resolve(window.VANTA);
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // تهيئة التأثير بعد التحميل
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            if (vantaRef.current && !vantaEffect.current) {
              vantaEffect.current = window.VANTA.DOTS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x3baaff,
                color2: 0xa78bfa,
                backgroundColor: 0x0E0C35,
                size: 3.0,
                spacing: 20.0,
                showLines: true
              });
            }
          }, { timeout: 3000 });
        } else {
          setTimeout(() => {
            if (vantaRef.current && !vantaEffect.current) {
              vantaEffect.current = window.VANTA.DOTS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x3baaff,
                color2: 0xa78bfa,
                backgroundColor: 0x0E0C35,
                size: 3.0,
                spacing: 20.0,
                showLines: true
              });
            }
          }, 500);
        }
      } catch (error) {
        console.error('فشل تحميل Vanta:', error);
      }
    };

    initAfterFCP();

    // تنظيف التأثير والـ timeout عند إلغاء التثبيت
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={vantaRef} 
      className="fixed inset-0 -z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default VantaBackground;
