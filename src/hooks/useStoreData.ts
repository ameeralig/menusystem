
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useStoreSettings } from "./store/useStoreSettings";
import { useStoreProducts } from "./store/useStoreProducts";
import { useCategoryImages } from "./store/useCategoryImages";

export const useStoreData = (slug: string | undefined, forceRefresh: number) => {
  const [isLoading, setIsLoading] = useState(true);
  const { storeSettings } = useStoreSettings(slug);
  const products = useStoreProducts(storeSettings.storeOwnerId, forceRefresh);
  const categoryImages = useCategoryImages(storeSettings.storeOwnerId, forceRefresh);
  const bannerUrlRef = useRef<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // تسجيل معلومات تصحيح الأخطاء
  useEffect(() => {
    console.log("useStoreData - storeOwnerId:", storeSettings.storeOwnerId);
    console.log("useStoreData - forceRefresh:", forceRefresh);
    console.log("useStoreData - categoryImages:", categoryImages?.length || 0);
  }, [storeSettings.storeOwnerId, forceRefresh, categoryImages?.length]);

  useEffect(() => {
    if (storeSettings && products && categoryImages) {
      console.log("Data loaded - stopping loading state");
      setIsLoading(false);
    }
  }, [storeSettings, products, categoryImages]);

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
        const updatedUrl = `${baseUrl}?t=${timestamp}`;
        storeSettings.bannerUrl = updatedUrl;
        
        // تحميل مسبق للصورة
        const img = new Image();
        img.src = updatedUrl;
        img.fetchPriority = "high";
      }
    }
  }, [storeSettings.bannerUrl, lastRefresh]);

  return {
    storeData: {
      ...storeSettings,
      products,
      categoryImages,
    },
    isLoading,
    storeOwnerId: storeSettings.storeOwnerId
  };
};
