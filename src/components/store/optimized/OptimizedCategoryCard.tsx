/**
 * بطاقة تصنيف محسّنة مع blur-up
 * المرحلة الثانية في ترتيب التحميل
 */

import React, { memo, useState, useCallback, CSSProperties } from 'react';
import { motion } from "framer-motion";
import { Folder } from "lucide-react";
import { cn } from '@/lib/utils';

interface OptimizedCategoryCardProps {
  category: string;
  imageUrl: string | null;
  onClick: () => void;
  fontStyle?: CSSProperties;
  isLoadingEnabled?: boolean;
}

const OptimizedCategoryCard = memo(({
  category,
  imageUrl,
  onClick,
  fontStyle = {},
  isLoadingEnabled = true
}: OptimizedCategoryCardProps) => {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    isLoadingEnabled ? 'idle' : 'idle'
  );

  // بدء التحميل عند تفعيله
  const startLoading = useCallback(() => {
    if (loadingState === 'idle' && imageUrl) {
      setLoadingState('loading');
    }
  }, [loadingState, imageUrl]);

  // التحميل عند تفعيل المرحلة
  React.useEffect(() => {
    if (isLoadingEnabled && imageUrl && loadingState === 'idle') {
      startLoading();
    }
  }, [isLoadingEnabled, imageUrl, loadingState, startLoading]);

  const handleLoad = useCallback(() => {
    setLoadingState('loaded');
  }, []);

  const handleError = useCallback(() => {
    setLoadingState('error');
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
      onClick={onClick}
    >
      <div className="h-[140px] overflow-hidden">
        {/* حالة التحميل أو عدم وجود صورة */}
        {(loadingState === 'error' || !imageUrl) ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Folder className="h-12 w-12 text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Skeleton أثناء التحميل */}
            {loadingState !== 'loaded' && (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* الصورة مع blur-up */}
            {loadingState !== 'idle' && (
              <img
                src={imageUrl}
                alt={category}
                className={cn(
                  'w-full h-full object-cover transition-all duration-500 group-hover:scale-110',
                  loadingState === 'loaded' ? 'blur-0 opacity-100' : 'blur-md opacity-60'
                )}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
                decoding="async"
              />
            )}
          </>
        )}

        {/* طبقة التعتيم واسم التصنيف */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h3
            className="text-white text-2xl font-bold tracking-wide px-3 text-center"
            style={fontStyle}
          >
            {category}
          </h3>
        </div>
      </div>
    </motion.div>
  );
});

OptimizedCategoryCard.displayName = 'OptimizedCategoryCard';

export default OptimizedCategoryCard;
