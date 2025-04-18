
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { StoreData } from "@/types/store";

export const useStoreData = (userId: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!userId) {
          throw new Error("معرف المتجر غير صالح");
        }

        const { data: storeSettings, error: storeError } = await supabase
          .from("store_settings")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (storeError) {
          console.error("خطأ في جلب إعدادات المتجر:", storeError);
          throw storeError;
        }

        setStoreData(storeSettings);
        
        // جلب صور التصنيفات
        const { data: categoryImagesData, error: categoryImagesError } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (categoryImagesError) {
          console.error("خطأ في جلب صور التصنيفات:", categoryImagesError);
          throw categoryImagesError;
        }

        setCategoryImages(categoryImagesData || []);

        // جلب المنتجات
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId);

        if (productsError) {
          console.error("خطأ في جلب المنتجات:", productsError);
          throw productsError;
        }

        setProducts(productsData || []);

      } catch (error: any) {
        console.error("خطأ في جلب البيانات:", error);
        setError(error.message);
        toast({
          title: "حدث خطأ",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchStoreData();
    }
  }, [userId, toast]);

  return {
    products,
    storeData,
    categoryImages,
    error,
    isLoading
  };
};
