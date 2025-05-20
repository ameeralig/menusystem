
import React from 'react';
import { optimizeImageUrl } from '@/utils/imageOptimizer';

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
 * مكون صورة محسن مع خصائص مناسبة للأداء
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
  // تحسين رابط الصورة
  const optimizedSrc = optimizeImageUrl(src, {
    isImportant,
    bustCache: true,
    format: 'webp',
    quality: 80,
  });

  return (
    <img
      src={optimizedSrc || ''}
      alt={alt}
      className={className}
      loading={isImportant ? "eager" : "lazy"}
      fetchPriority={isImportant ? "high" : "auto"}
      decoding="async"
      onClick={onClick}
      onLoad={onLoad}
      onError={onError}
    />
  );
};
