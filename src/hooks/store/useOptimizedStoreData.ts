import { useState, useEffect } from "react";
import { useUnifiedStoreData } from "./useUnifiedStoreData";
import { useCleanupEmptyCategories } from "./useCleanupEmptyCategories";
import { useCategoryImages } from "./useCategoryImages";
import { useOptimizedProducts } from "./useOptimizedProducts";
import { deleteSpecificEmptyCategory } from "@/utils/categoryCleanup";

export const useOptimizedStoreData = (slug: string | undefined, forceRefresh: number) => {
  // الخطوة 1: جلب كل بيانات المتجر بـ query واحد
  const { 
    storeData: unifiedData, 
    isLoading: unifiedLoading, 
    error: identificationError,
    userId 
  } = useUnifiedStoreData(slug);
  
  // تنظيف التصنيفات الفارغة
  const { cleanupEmptyCategories } = useCleanupEmptyCategories(userId);
  
  // الخطوة 2: جلب المنتجات والصور بشكل متوازي
  const { 
    products, 
    allProducts,
    categories,
    isLoading: productsLoading,
    loadingProgress,
    hasMore,
    loadMore,
    refresh: refreshProducts
  } = useOptimizedProducts({ 
    userId, 
    selectedCategory: null, 
    searchQuery: "", 
    forceRefresh 
  });

  const { categoryImages, isLoading: categoryImagesLoading } = useCategoryImages(userId, forceRefresh);

  // حالة التحميل الإجمالية
  const [overallLoading, setOverallLoading] = useState(true);

  useEffect(() => {
    // إذا تم جلب بيانات المتجر وبدأت المنتجات في التحميل
    if (!unifiedLoading && userId) {
      const isDataReady = !productsLoading || products.length > 0;
      setOverallLoading(!isDataReady);
      
      // تنظيف التصنيفات الفارغة بعد انتهاء التحميل
      if (isDataReady) {
        setTimeout(async () => {
          try {
            await deleteSpecificEmptyCategory(userId);
          } catch (error) {
            console.error("خطأ في حذف التصنيف المحدد:", error);
          }
          cleanupEmptyCategories();
        }, 1000);
      }
    } else if (!unifiedLoading && !userId) {
      setOverallLoading(false);
    }
  }, [unifiedLoading, userId, productsLoading, products.length, cleanupEmptyCategories]);

  // دمج جميع البيانات
  const storeData = {
    storeName: unifiedData?.storeName || null,
    colorTheme: unifiedData?.colorTheme || "default",
    socialLinks: unifiedData?.socialLinks || {},
    contactInfo: unifiedData?.contactInfo || {},
    bannerUrl: unifiedData?.bannerUrl || null,
    logoUrl: unifiedData?.logoUrl || null,
    fontSettings: unifiedData?.fontSettings,
    darkMode: unifiedData?.darkMode || false,
    template: "fast-response",
    products: allProducts,
    visibleProducts: products,
    categoryImages,
    categories,
    isSuspended: unifiedData?.isSuspended || false,
    adsEnabled: unifiedData?.adsEnabled || false,
    adsType: unifiedData?.adsType || null,
    customAds: unifiedData?.customAds || [],
  };

  return {
    storeData,
    isLoading: overallLoading,
    storeOwnerId: userId,
    identificationError,
    loadingProgress,
    hasMoreProducts: hasMore,
    loadMoreProducts: loadMore,
    refreshProducts,
    // حالات التحميل المبسطة
    loadingStates: {
      identifying: unifiedLoading,
      products: productsLoading,
      categoryImages: categoryImagesLoading
    }
  };
};