import { useState, useEffect } from "react";
import { useFastStoreIdentification } from "./useFastStoreIdentification";
import { useStoreSettings } from "./useStoreSettings";
import { useCleanupEmptyCategories } from "./useCleanupEmptyCategories";
import { useCategoryImages } from "./useCategoryImages";
import { useOptimizedProducts } from "./useOptimizedProducts";
import { deleteSpecificEmptyCategory } from "@/utils/categoryCleanup";

export const useOptimizedStoreData = (slug: string | undefined, forceRefresh: number) => {
  // الخطوة 1: التعرف السريع على المستخدم
  const { userId, isLoading: identifyingUser, error: identificationError } = useFastStoreIdentification(slug);
  
  // استخدام خطاف تنظيف التصنيفات الفارغة
  const { cleanupEmptyCategories } = useCleanupEmptyCategories(userId);
  
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
      
      // تنظيف التصنيفات الفارغة بعد انتهاء التحميل
      if (isDataReady) {
        setTimeout(async () => {
          // حذف التصنيف الفارغ المحدد أولاً
          try {
            await deleteSpecificEmptyCategory(userId);
          } catch (error) {
            console.error("خطأ في حذف التصنيف المحدد:", error);
          }
          
          // ثم تنظيف باقي التصنيفات الفارغة
          cleanupEmptyCategories();
        }, 1000);
      }
    } else if (!identifyingUser && !userId) {
      // إذا لم يتم العثور على المستخدم
      setOverallLoading(false);
    }
  }, [identifyingUser, userId, settingsLoading, productsLoading, products.length, cleanupEmptyCategories]);

  // دمج جميع البيانات
  const storeData = {
    ...storeSettings,
    products: allProducts, // استخدام جميع المنتجات
    visibleProducts: products, // المنتجات المرئية حالياً
    categoryImages,
    categories,
    template: storeSettings.template || 'default'
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