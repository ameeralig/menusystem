import { useState, useEffect } from "react";
import { useFastStoreIdentification } from "./useFastStoreIdentification";
import { useStoreSettings } from "./useStoreSettings";
import { useOptimizedProducts } from "./useOptimizedProducts";
import { useCategoryImages } from "./useCategoryImages";

export const useOptimizedStoreData = (slug: string | undefined, forceRefresh: number) => {
  // الخطوة 1: التعرف السريع على المستخدم
  const { userId, isLoading: identifyingUser, error: identificationError } = useFastStoreIdentification(slug);
  
  // الخطوة 2: جلب البيانات المفصلة بمجرد التعرف على المستخدم
  const { storeSettings, isLoading: settingsLoading } = useStoreSettings(slug);
  
  // الخطوة 3: جلب المنتجات والصور بشكل متوازي
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
    // إذا تم التعرف على المستخدم وبدأت البيانات في التحميل
    if (!identifyingUser && userId) {
      // نعتبر التحميل منتهياً عندما تكون البيانات الأساسية جاهزة
      const isDataReady = !settingsLoading && (!productsLoading || products.length > 0);
      setOverallLoading(!isDataReady);
    } else if (!identifyingUser && !userId) {
      // إذا لم يتم العثور على المستخدم
      setOverallLoading(false);
    }
  }, [identifyingUser, userId, settingsLoading, productsLoading, products.length]);

  // دمج جميع البيانات
  const storeData = {
    ...storeSettings,
    products: allProducts, // استخدام جميع المنتجات
    visibleProducts: products, // المنتجات المرئية حالياً
    categoryImages,
    categories
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
    // حالات التحميل المنفصلة للتحكم الدقيق
    loadingStates: {
      identifying: identifyingUser,
      settings: settingsLoading,
      products: productsLoading,
      categoryImages: categoryImagesLoading
    }
  };
};