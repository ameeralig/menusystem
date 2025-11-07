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
    // تحميل Three.js
    const loadThree = () => {
      return new Promise((resolve, reject) => {
        if (window.THREE) {
          resolve(window.THREE);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
        script.onload = () => resolve(window.THREE);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // تحميل Vanta Dots
    const loadVanta = () => {
      return new Promise((resolve, reject) => {
        if (window.VANTA) {
          resolve(window.VANTA);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.dots.min.js';
        script.onload = () => resolve(window.VANTA);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // تهيئة Vanta Effect
    const initVanta = async () => {
      try {
        await loadThree();
        await loadVanta();

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
            color: 0x3baaff, // اللون الأزرق السيبراني
            color2: 0xa78bfa, // اللون البنفسجي
            backgroundColor: 0x0E0C35, // لون الخلفية الداكن
            size: 3.0,
            spacing: 20.0,
            showLines: true
          });
        }
      } catch (error) {
        console.error('فشل تحميل Vanta:', error);
      }
    };

    initVanta();

    // تنظيف التأثير عند إلغاء التثبيت
    return () => {
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
