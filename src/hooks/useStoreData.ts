
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

  // تسجيل معلومات تصحيح الأخطاء
  useEffect(() => {
    console.log("useStoreData - storeOwnerId:", storeSettings.storeOwnerId);
    console.log("useStoreData - forceRefresh:", forceRefresh);
  }, [storeSettings.storeOwnerId, forceRefresh]);

  useEffect(() => {
    if (storeSettings && products && categoryImages) {
      console.log("Data loaded - stopping loading state");
      setIsLoading(false);
    }
  }, [storeSettings, products, categoryImages]);

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
      }
    }
  }, [storeSettings.bannerUrl]);

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
