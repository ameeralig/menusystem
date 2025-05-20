
import React, { useState, useEffect } from 'react';
import { optimizeImageUrl } from '@/utils/imageOptimizer';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  isImportant?: boolean;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * مكون صورة محسن مع دعم التحميل المسبق وتخزين مؤقت محسن
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  isImportant = false,
  onClick,
  onLoad,
  onError,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  
  // تحسين رابط الصورة فور تغيير المصدر
  useEffect(() => {
    if (src) {
      // فحص إذا كانت الصورة مرفوعة من المستخدم
      const isUserUploaded = src.includes('/product-images') || 
                            src.includes('/category-images') || 
                            src.includes('/banners');
      
      const optimized = optimizeImageUrl(src, {
        isImportant,
        bustCache: true,
        format: 'webp',
        quality: isUserUploaded ? 90 : 80, // زيادة الجودة للصور المرفوعة
      });
      
      setOptimizedSrc(optimized);
      
      // تحميل مسبق للصور المهمة
      if (isImportant && optimized) {
        const preloadImg = new Image();
        preloadImg.src = optimized;
        preloadImg.fetchPriority = "high";
      }
    }
  }, [src, isImportant]);
  
  // معالجة أحداث تحميل الصورة
  const handleLoad = () => {
    setImageLoaded(true);
    if (onLoad) onLoad();
  };
  
  // معالجة أخطاء الصورة
  const handleError = () => {
    setImageError(true);
    if (onError) onError();
  };
  
  return (
    <div className="relative">
      {!imageLoaded && !imageError && (
        <Skeleton 
          className={`absolute inset-0 ${className || 'w-full h-full'}`} 
        />
      )}
      
      {optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading={isImportant ? "eager" : "lazy"}
          fetchPriority={isImportant ? "high" : "auto"}
          decoding="async"
          onClick={onClick}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
