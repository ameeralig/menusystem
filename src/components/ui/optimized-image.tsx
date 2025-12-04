/**
 * مكون صورة محسّن للأداء على جميع المتصفحات (خاصة Safari)
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { isSafari, isIOS, supportsWebPSync } from '@/utils/browserDetect';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage = memo(({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  fallbackSrc = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image',
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const isSafariBrowser = isSafari() || isIOS();
  
  useEffect(() => {
    if (!src) {
      setImageSrc(fallbackSrc);
      setHasError(true);
      return;
    }
    
    setIsLoaded(false);
    setHasError(false);
    
    // تحسين الرابط لـ Safari
    let optimizedSrc = src;
    
    // Safari القديم قد لا يدعم WebP - استخدم JPEG كبديل
    if (isSafariBrowser && !supportsWebPSync() && src.includes('.webp')) {
      optimizedSrc = src.replace('.webp', '.jpg');
    }
    
    // Safari: تحميل مسبق للصور ذات الأولوية العالية
    if (priority && isSafariBrowser) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      document.head.appendChild(link);
      
      // تنظيف بعد التحميل
      return () => {
        try {
          document.head.removeChild(link);
        } catch {}
      };
    }
    
    setImageSrc(optimizedSrc);
  }, [src, fallbackSrc, priority, isSafariBrowser]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    
    // Safari: استخدام decode() للتأكد من الرسم السلس
    if (imgRef.current && 'decode' in imgRef.current) {
      imgRef.current.decode().catch(() => {});
    }
    
    onLoad?.();
  };
  
  const handleError = () => {
    setHasError(true);
    setImageSrc(fallbackSrc);
    onError?.();
  };
  
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        'transition-opacity duration-200',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // @ts-ignore - fetchPriority is a newer attribute
      fetchpriority={priority ? 'high' : 'auto'}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
