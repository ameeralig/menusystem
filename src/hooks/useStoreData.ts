
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useStoreSettings } from "./store/useStoreSettings";
import { useStoreProducts } from "./store/useStoreProducts";
import { useCategoryImages } from "./store/useCategoryImages";

// ثابت للتحكم في عدد المنتجات المُحمّلة مرة واحدة
const PRODUCTS_PER_PAGE = 20;

export const useStoreData = (slug: string | undefined, forceRefresh: number) => {
  const [isLoading, setIsLoading] = useState(true);
  const { storeSettings } = useStoreSettings(slug);
  
  // استخدام نظام التحميل بالصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const { products, isLoading: productsLoading, hasMore } = useStoreProducts(
    storeSettings.storeOwnerId, 
    forceRefresh,
    PRODUCTS_PER_PAGE,
    currentPage
  );
  
  const { categoryImages, isLoading: categoryImagesLoading } = useCategoryImages(storeSettings.storeOwnerId, forceRefresh);
  const bannerUrlRef = useRef<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [cachedProducts, setCachedProducts] = useState<any[]>([]);

  // دالة لتحميل المزيد من المنتجات عند التمرير لأسفل
  const loadMoreProducts = useCallback(() => {
    if (hasMore && !productsLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, productsLoading]);

  // تجميع كل المنتجات المُحمّلة
  useEffect(() => {
    if (products.length > 0) {
      setCachedProducts(prev => {
        // تجميع المنتجات الحالية مع المنتجات الجديدة مع تجنب التكرار
        const productIds = new Set(prev.map(p => p.id));
        const newProducts = products.filter(p => !productIds.has(p.id));
        return [...prev, ...newProducts];
      });
    } else if (currentPage === 1) {
      // إعادة ضبط المنتجات المخزنة مؤقتًا إذا كنا على الصفحة الأولى (مثلاً عند تغيير المتجر)
      setCachedProducts([]);
    }
  }, [products, currentPage]);

  // مراقبة التمرير لتحميل المزيد من المنتجات
  useEffect(() => {
    const handleScroll = () => {
      // إذا كان المستخدم قريبًا من أسفل الصفحة ولدينا المزيد من المنتجات للتحميل
      if (
        !productsLoading &&
        hasMore &&
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 800
      ) {
        loadMoreProducts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreProducts, productsLoading, hasMore]);

  // تسجيل معلومات تصحيح الأخطاء
  useEffect(() => {
    console.log("useStoreData - storeOwnerId:", storeSettings.storeOwnerId);
    console.log("useStoreData - forceRefresh:", forceRefresh);
    console.log("useStoreData - categoryImages:", categoryImages?.length || 0);
    console.log("useStoreData - currentPage:", currentPage);
    console.log("useStoreData - cachedProducts:", cachedProducts.length);
    
    if (categoryImages && categoryImages.length > 0) {
      console.log("تفاصيل صور التصنيفات في useStoreData:", categoryImages.map(img => ({ 
        category: img.category, 
        url: img.image_url,
        id: img.id
      })));
    }
  }, [storeSettings.storeOwnerId, forceRefresh, categoryImages, currentPage, cachedProducts.length]);

  useEffect(() => {
    if (storeSettings && !categoryImagesLoading && (!productsLoading || cachedProducts.length > 0)) {
      console.log("Data loaded - stopping loading state");
      setIsLoading(false);
    }
  }, [storeSettings, productsLoading, categoryImagesLoading, cachedProducts.length]);

  // تحديث الصفحة بشكل دوري لتحديث الصور
  useEffect(() => {
    // تحديث كل 5 دقائق
    const refreshInterval = setInterval(() => {
      setLastRefresh(Date.now());
    }, 5 * 60 * 1000); // 5 دقائق
    
    return () => clearInterval(refreshInterval);
  }, []);

  // معالجة صورة الغلاف لتجنب مشكلة التخزين المؤقت
  useEffect(() => {
    if (storeSettings.bannerUrl !== bannerUrlRef.current) {
      bannerUrlRef.current = storeSettings.bannerUrl;
      
      if (storeSettings.bannerUrl) {
        // إذا كانت الصورة موجودة، نضيف معرف زمني لتجنب التخزين المؤقت
        const timestamp = new Date().getTime();
        const baseUrl = storeSettings.bannerUrl.split('?')[0];
        
        // تحسين URL الصورة باستخدام WebP
        const updatedUrl = baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')
          ? `${baseUrl}?format=webp&quality=80&t=${timestamp}`
          : `${baseUrl}?t=${timestamp}`;
          
        storeSettings.bannerUrl = updatedUrl;
        
        // تحميل مسبق للصورة
        const img = new Image();
        img.src = updatedUrl;
        img.fetchPriority = "high";
        
        console.log("تم تحديث صورة الغلاف:", updatedUrl);
      }
    }
  }, [storeSettings.bannerUrl, lastRefresh]);

  return {
    storeData: {
      ...storeSettings,
      products: cachedProducts,
      categoryImages,
    },
    isLoading,
    storeOwnerId: storeSettings.storeOwnerId,
    loadMoreProducts,
    hasMoreProducts: hasMore
  };
};
