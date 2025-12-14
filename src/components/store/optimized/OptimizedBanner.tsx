/**
 * بانر محسّن مع تحميل فوري (LCP)
 * المرحلة الأولى في ترتيب التحميل
 */

import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

interface OptimizedBannerProps {
  bannerUrl: string | null | undefined;
  onLoadComplete?: () => void;
  className?: string;
}

const OptimizedBanner = memo(({
  bannerUrl,
  onLoadComplete,
  className
}: OptimizedBannerProps) => {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const imgRef = useRef<HTMLImageElement>(null);
  const hasStartedLoading = useRef(false);

  // بدء التحميل الفوري للبانر (LCP)
  useEffect(() => {
    if (!bannerUrl || hasStartedLoading.current) return;
    
    hasStartedLoading.current = true;
    setLoadingState('loading');

    // تحميل مسبق عبر link preload
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = bannerUrl;
    link.fetchPriority = 'high';
    document.head.appendChild(link);

    return () => {
      try {
        document.head.removeChild(link);
      } catch {}
    };
  }, [bannerUrl]);

  // معالجة التحميل الناجح
  const handleLoad = useCallback(() => {
    if (imgRef.current && 'decode' in imgRef.current) {
      imgRef.current.decode()
        .then(() => {
          setLoadingState('loaded');
          onLoadComplete?.();
        })
        .catch(() => {
          setLoadingState('loaded');
          onLoadComplete?.();
        });
    } else {
      setLoadingState('loaded');
      onLoadComplete?.();
    }
  }, [onLoadComplete]);

  // معالجة الخطأ
  const handleError = useCallback(() => {
    setLoadingState('error');
    onLoadComplete?.(); // الاستمرار في التحميل حتى مع الخطأ
  }, [onLoadComplete]);

  if (!bannerUrl) return null;

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <AspectRatio ratio={16 / 5} className="w-full">
        {/* Skeleton */}
        {loadingState !== 'loaded' && loadingState !== 'error' && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}

        {/* الصورة */}
        {loadingState !== 'error' && (
          <img
            ref={imgRef}
            src={bannerUrl}
            alt="صورة الغلاف"
            width={1600}
            height={500}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              loadingState === 'loaded' ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        )}

        {/* حالة الخطأ */}
        {loadingState === 'error' && (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">لا يمكن تحميل صورة الغلاف</p>
          </div>
        )}

        {/* طبقة التعتيم */}
        <div className="absolute inset-0 bg-black/30" />
      </AspectRatio>
    </div>
  );
});

OptimizedBanner.displayName = 'OptimizedBanner';

export default OptimizedBanner;
