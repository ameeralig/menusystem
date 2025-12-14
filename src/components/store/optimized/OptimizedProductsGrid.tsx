/**
 * شبكة منتجات محسّنة مع إلغاء التحميل عند تغيير التصنيف
 * المرحلة الثالثة: تُحمّل فقط للتصنيف النشط
 */

import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { Product } from "@/types/product";
import OptimizedProductCard from './OptimizedProductCard';
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedProductsGridProps {
  products: Product[];
  categoryName: string;
  isLoadingEnabled?: boolean;
  onLoadProgress?: (loaded: number, total: number) => void;
  onLoadComplete?: () => void;
}

const OptimizedProductsGrid = memo(({
  products,
  categoryName,
  isLoadingEnabled = false,
  onLoadProgress,
  onLoadComplete
}: OptimizedProductsGridProps) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentCategoryRef = useRef(categoryName);

  // إعادة التهيئة عند تغيير التصنيف
  useEffect(() => {
    // إلغاء التحميل السابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // إنشاء AbortController جديد
    abortControllerRef.current = new AbortController();
    currentCategoryRef.current = categoryName;
    setLoadedCount(0);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [categoryName]);

  // تتبع التقدم
  const handleImageLoad = useCallback(() => {
    // التحقق من أن التصنيف لم يتغير
    if (currentCategoryRef.current !== categoryName) return;

    setLoadedCount(prev => {
      const newCount = prev + 1;
      const productsWithImages = products.filter(p => p.image_url).length;
      
      onLoadProgress?.(newCount, productsWithImages);
      
      if (newCount >= productsWithImages) {
        onLoadComplete?.();
      }
      
      return newCount;
    });
  }, [categoryName, products, onLoadProgress, onLoadComplete]);

  // المنتجات التي تحتوي على صور
  const productsWithImages = products.filter(p => p.image_url);
  const totalImages = productsWithImages.length;
  const loadingProgress = totalImages > 0 ? (loadedCount / totalImages) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* شريط التقدم */}
      {isLoadingEnabled && loadedCount < totalImages && totalImages > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* شبكة المنتجات */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <OptimizedProductCard
            key={product.id}
            product={product}
            isLoadingEnabled={isLoadingEnabled}
            priority={index < 3} // الصور الثلاث الأولى ذات أولوية
            onImageLoad={handleImageLoad}
          />
        ))}
      </div>
    </div>
  );
});

OptimizedProductsGrid.displayName = 'OptimizedProductsGrid';

export default OptimizedProductsGrid;
