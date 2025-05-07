
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useStoreSettings } from "./store/useStoreSettings";
import { useStoreProducts } from "./store/useStoreProducts";
import { useCategoryImages } from "./store/useCategoryImages";
import { toast } from "sonner";

export const useStoreData = (slug: string | undefined, forceRefresh: number) => {
  const [isLoading, setIsLoading] = useState(true);
  const { storeSettings, isLoading: settingsLoading } = useStoreSettings(slug);
  const { products, isLoading: productsLoading } = useStoreProducts(storeSettings.storeOwnerId, forceRefresh);
  const { categoryImages, isLoading: categoriesLoading } = useCategoryImages(storeSettings.storeOwnerId, forceRefresh);
  const navigate = useNavigate();

  // تسجيل معلومات تصحيح الأخطاء
  useEffect(() => {
    console.log("useStoreData - storeOwnerId:", storeSettings.storeOwnerId);
    console.log("useStoreData - forceRefresh:", forceRefresh);
    console.log("useStoreData - status:", { settingsLoading, productsLoading, categoriesLoading });
  }, [storeSettings.storeOwnerId, forceRefresh, settingsLoading, productsLoading, categoriesLoading]);

  useEffect(() => {
    if (!slug) {
      console.error("No slug provided");
      navigate('/404');
      return;
    }
    
    if (!settingsLoading && !storeSettings.storeOwnerId) {
      console.error("No store owner found for slug:", slug);
      toast.error("لم يتم العثور على المتجر");
      navigate('/404');
      return;
    }

    if (!settingsLoading && !productsLoading && !categoriesLoading) {
      console.log("Data loaded - stopping loading state");
      setIsLoading(false);
    }
  }, [slug, storeSettings, settingsLoading, products, productsLoading, categoryImages, categoriesLoading, navigate]);

  return {
    storeData: {
      ...storeSettings,
      products: products || [],
      categoryImages: categoryImages || [],
    },
    isLoading: isLoading || settingsLoading || productsLoading || categoriesLoading,
    storeOwnerId: storeSettings.storeOwnerId
  };
};
