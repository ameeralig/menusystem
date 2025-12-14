/**
 * مكون صورة تقدمي مع Blur-up و Skeleton
 * يدعم التحميل التدريجي والتحسين التلقائي
 */

import React, { useState, useEffect, useRef, memo, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeImageUrl, ImageSize } from '@/utils/imageOptimizer';

interface ProgressiveImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  size?: ImageSize;
  priority?: boolean;
  aspectRatio?: string;
  objectFit?: CSSProperties['objectFit'];
  onLoad?: () => void;
  onError?: () => void;
  blurDataUrl?: string;
  showSkeleton?: boolean;
}

// إنشاء placeholder ضبابي منخفض الدقة
const generateBlurDataUrl = (width = 10, height = 10): string => {
  return `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <filter id="blur" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="#e2e8f0" filter="url(#blur)"/>
    </svg>`
  )}`;
};

const ProgressiveImage = memo(({
  src,
  alt,
  className,
  containerClassName,
  width,
  height,
  size = 'medium',
  priority = false,
  aspectRatio = '16/9',
  objectFit = 'cover',
  onLoad,
  onError,
  blurDataUrl,
  showSkeleton = true
}: ProgressiveImageProps) => {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // تحسين الرابط
  const optimizedSrc = src ? optimizeImageUrl(src, size) : null;
  const placeholderSrc = blurDataUrl || generateBlurDataUrl();

  // تحميل الصورة
  useEffect(() => {
    if (!optimizedSrc) {
      setLoadingState('error');
      return;
    }

    // الصور ذات الأولوية تُحمّل فوراً
    if (priority) {
      setLoadingState('loading');
      setCurrentSrc(optimizedSrc);
      return;
    }

    // التحميل الكسول باستخدام Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLoadingState('loading');
            setCurrentSrc(optimizedSrc);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [optimizedSrc, priority]);

  // معالجة التحميل الناجح
  const handleLoad = () => {
    // استخدام decode() للتأكد من الرسم السلس
    if (imgRef.current && 'decode' in imgRef.current) {
      imgRef.current.decode()
        .then(() => {
          setLoadingState('loaded');
          onLoad?.();
        })
        .catch(() => {
          setLoadingState('loaded');
          onLoad?.();
        });
    } else {
      setLoadingState('loaded');
      onLoad?.();
    }
  };

  // معالجة الخطأ
  const handleError = () => {
    setLoadingState('error');
    onError?.();
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={{ aspectRatio }}
    >
      {/* Skeleton loader */}
      {showSkeleton && loadingState !== 'loaded' && loadingState !== 'error' && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Blur placeholder */}
      {loadingState === 'loading' && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            'absolute inset-0 w-full h-full blur-lg scale-110',
            className
          )}
          style={{ objectFit }}
        />
      )}

      {/* الصورة الفعلية */}
      <img
        ref={imgRef}
        src={currentSrc || undefined}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'w-full h-full transition-all duration-500',
          loadingState === 'loaded' ? 'opacity-100 blur-0' : 'opacity-0 blur-md',
          className
        )}
        style={{ objectFit }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />

      {/* حالة الخطأ */}
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">{alt}</span>
        </div>
      )}
    </div>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';

export default ProgressiveImage;
