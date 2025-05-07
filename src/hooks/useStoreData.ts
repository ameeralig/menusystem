
import { useState, useEffect } from "react";
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
