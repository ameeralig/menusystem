/**
 * أدوات كشف المتصفح وتحسين الأداء
 */

// كشف متصفح Safari
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
};

// كشف iOS
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// كشف دعم WebP
let webpSupported: boolean | null = null;
export const supportsWebP = async (): Promise<boolean> => {
  if (webpSupported !== null) return webpSupported;
  
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupported = false;
  }
  
  return webpSupported;
};

// كشف دعم WebP بشكل متزامن (للاستخدام الفوري)
export const supportsWebPSync = (): boolean => {
  if (webpSupported !== null) return webpSupported;
  
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupported = false;
  }
  
  return webpSupported;
};

// تحميل صورة مسبقاً مع تحسينات Safari
export const preloadImage = (src: string, priority: 'high' | 'low' = 'low'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Safari يحتاج decode async لتحسين الأداء
    img.decoding = 'async';
    
    // تعيين الأولوية
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = priority;
    }
    
    img.onload = () => {
      // Safari: استخدام decode() للتأكد من جاهزية الصورة
      if ('decode' in img) {
        img.decode()
          .then(() => resolve())
          .catch(() => resolve()); // تجاهل أخطاء decode
      } else {
        resolve();
      }
    };
    
    img.onerror = () => reject(new Error(`فشل تحميل: ${src}`));
    img.src = src;
  });
};

// تحميل مجموعة صور بشكل متوازي مع حد أقصى
export const preloadImages = async (
  urls: string[], 
  concurrency: number = 3
): Promise<void> => {
  const chunks: string[][] = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }
  
  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map(url => preloadImage(url, 'low')));
  }
};
