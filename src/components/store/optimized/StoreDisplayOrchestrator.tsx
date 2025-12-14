/**
 * مكون العرض الرئيسي المحسّن
 * ينسق ترتيب التحميل: Banner → Categories → Products
 */

import React, { useState, useCallback, useEffect, memo } from 'react';
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import OptimizedBanner from './OptimizedBanner';
import OptimizedCategoryGrid from './OptimizedCategoryGrid';
import OptimizedProductsGrid from './OptimizedProductsGrid';
import { LoadingState } from '@/hooks/store/useImageLoadingOrchestrator';

interface FontSettings {
  categoryText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
}

interface StoreDisplayOrchestratorProps {
  bannerUrl: string | null | undefined;
  categories: string[];
  categoryImages: CategoryImage[];
  products: Product[];
  fontSettings?: FontSettings;
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
  defaultCategory?: string;
}

const StoreDisplayOrchestrator = memo(({
  bannerUrl,
  categories,
  categoryImages,
  products,
  fontSettings,
  onCategorySelect,
  selectedCategory,
  defaultCategory
}: StoreDisplayOrchestratorProps) => {
  // حالات مراحل التحميل
  const [bannerState, setBannerState] = useState<LoadingState>('idle');
  const [categoriesState, setCategoriesState] = useState<LoadingState>('idle');
  const [productsState, setProductsState] = useState<LoadingState>('idle');

  // البدء في تحميل البانر فوراً (LCP)
  useEffect(() => {
    if (bannerUrl) {
      setBannerState('loading');
    } else {
      // لا يوجد بانر، الانتقال للمرحلة التالية
      setBannerState('loaded');
    }
  }, [bannerUrl]);

  // عند إتمام البانر، بدء تحميل التصنيفات
  const handleBannerComplete = useCallback(() => {
    setBannerState('loaded');
  }, []);

  // التحقق من إمكانية تحميل التصنيفات
  const canLoadCategories = bannerState === 'loaded';

  // عند إتمام التصنيفات
  const handleCategoriesComplete = useCallback(() => {
    setCategoriesState('loaded');
    
    // اختيار التصنيف الافتراضي إذا لم يكن هناك تصنيف محدد
    if (!selectedCategory && categories.length > 0) {
      onCategorySelect(defaultCategory || categories[0]);
    }
  }, [selectedCategory, categories, onCategorySelect, defaultCategory]);

  // التحقق من إمكانية تحميل المنتجات
  const canLoadProducts = categoriesState === 'loaded' && selectedCategory;

  // فلترة المنتجات حسب التصنيف المحدد
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : [];

  // عند تغيير التصنيف
  const handleCategoryChange = useCallback((category: string) => {
    setProductsState('loading');
    onCategorySelect(category);
  }, [onCategorySelect]);

  // عند إتمام تحميل المنتجات
  const handleProductsComplete = useCallback(() => {
    setProductsState('loaded');
  }, []);

  // تقدم تحميل المنتجات
  const handleProductsProgress = useCallback((loaded: number, total: number) => {
    console.log(`تحميل المنتجات: ${loaded}/${total}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* المرحلة 1: البانر (LCP) */}
      <OptimizedBanner
        bannerUrl={bannerUrl}
        onLoadComplete={handleBannerComplete}
      />

      {/* المرحلة 2: التصنيفات */}
      {!selectedCategory && (
        <OptimizedCategoryGrid
          categories={categories}
          onCategorySelect={handleCategoryChange}
          fontSettings={fontSettings}
          categoryImages={categoryImages}
          isLoadingEnabled={canLoadCategories}
          onLoadComplete={handleCategoriesComplete}
        />
      )}

      {/* المرحلة 3: المنتجات */}
      {selectedCategory && (
        <OptimizedProductsGrid
          products={filteredProducts}
          categoryName={selectedCategory}
          isLoadingEnabled={categoriesState === 'loaded'}
          onLoadProgress={handleProductsProgress}
          onLoadComplete={handleProductsComplete}
        />
      )}
    </div>
  );
});

StoreDisplayOrchestrator.displayName = 'StoreDisplayOrchestrator';

export default StoreDisplayOrchestrator;
