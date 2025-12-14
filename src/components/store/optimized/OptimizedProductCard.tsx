/**
 * بطاقة منتج محسّنة مع blur-up
 * المرحلة الثالثة في ترتيب التحميل
 */

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types/product";
import { optimizeImageUrl } from '@/utils/imageOptimizer';
import { cn } from '@/lib/utils';

interface OptimizedProductCardProps {
  product: Product;
  isLoadingEnabled?: boolean;
  priority?: boolean;
  onImageLoad?: () => void;
}

// تنسيق السعر
const formatPrice = (price: number) => {
  const priceString = price.toLocaleString('ar-IQ');
  const firstDigit = priceString.charAt(0);
  const remainingDigits = priceString.slice(1);

  return (
    <span className="text-lg font-bold text-green-600 dark:text-green-400">
      <span className="text-lg">{firstDigit}</span>
      <span className="text-sm">{remainingDigits}</span>
      <span className="text-sm"> د.ع</span>
    </span>
  );
};

const OptimizedProductCard = memo(({
  product,
  isLoadingEnabled = true,
  priority = false,
  onImageLoad
}: OptimizedProductCardProps) => {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isAvailable = product.is_available !== false;
  const isPopular = product.is_popular;
  const isNew = product.is_new;

  const optimizedImageUrl = product.image_url 
    ? optimizeImageUrl(product.image_url, 'medium')
    : null;

  // Intersection Observer للتحميل الكسول
  useEffect(() => {
    if (!isLoadingEnabled || !optimizedImageUrl || loadingState !== 'idle') return;

    // الصور ذات الأولوية تُحمّل فوراً
    if (priority) {
      setLoadingState('loading');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLoadingState('loading');
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.01
      }
    );

    if (imgRef.current?.parentElement) {
      observer.observe(imgRef.current.parentElement);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [isLoadingEnabled, optimizedImageUrl, loadingState, priority]);

  const handleLoad = useCallback(() => {
    if (imgRef.current && 'decode' in imgRef.current) {
      imgRef.current.decode()
        .then(() => {
          setLoadingState('loaded');
          onImageLoad?.();
        })
        .catch(() => {
          setLoadingState('loaded');
          onImageLoad?.();
        });
    } else {
      setLoadingState('loaded');
      onImageLoad?.();
    }
  }, [onImageLoad]);

  const handleError = useCallback(() => {
    setLoadingState('error');
  }, []);

  // تحديد فئات CSS للتأثيرات
  const getCardClasses = () => {
    let baseClasses = "bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative";

    if (isPopular) {
      baseClasses += " fire-glow-red";
    } else if (isNew) {
      baseClasses += " fire-glow-blue";
    }

    return baseClasses;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={getCardClasses()}
    >
      {/* تأثير النيران للمنتجات عالية الطلب */}
      {isPopular && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="fire-effect-red" />
        </div>
      )}

      {/* تأثير النيران الزرقاء للمنتجات الجديدة */}
      {isNew && !isPopular && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="fire-effect-blue" />
        </div>
      )}

      {/* صورة المنتج */}
      {optimizedImageUrl && (
        <div className="aspect-[16/9] overflow-hidden relative">
          {/* Skeleton */}
          {loadingState !== 'loaded' && loadingState !== 'error' && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}

          {/* الصورة */}
          {loadingState !== 'idle' && (
            <img
              ref={imgRef}
              src={optimizedImageUrl}
              alt={product.name}
              className={cn(
                'w-full h-full object-cover transition-all duration-500',
                loadingState === 'loaded' ? 'opacity-100 blur-0 hover:scale-105' : 'opacity-0 blur-md',
                !isAvailable && 'grayscale opacity-60'
              )}
              onLoad={handleLoad}
              onError={handleError}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          )}

          {/* حالة عدم التوفر */}
          {!isAvailable && loadingState === 'loaded' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-lg text-sm font-bold">
                غير متوفر
              </div>
            </div>
          )}

          {/* حالة الخطأ */}
          {loadingState === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground p-4 text-center">
                {product.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* معلومات المنتج */}
      <div className="p-4 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className={cn(
            "text-lg font-semibold text-right",
            !isAvailable ? "text-muted-foreground" : "text-foreground"
          )}>
            {product.name}
          </h3>
          <div className={!isAvailable ? "opacity-60" : ""}>
            {formatPrice(product.price)}
          </div>
        </div>
        {product.description && (
          <p className={cn(
            "text-sm text-right",
            !isAvailable ? "text-muted-foreground/70" : "text-muted-foreground"
          )}>
            {product.description}
          </p>
        )}
      </div>
    </motion.div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;
