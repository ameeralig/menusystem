
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { toast } from "sonner";

export const useStoreProducts = (userId: string | null, forceRefresh: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast: uiToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!userId) {
          console.log("No userId provided to useStoreProducts, skipping fetch");
          setIsLoading(false);
          return;
        }

        console.log("Fetching products for userId:", userId);
        
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching products:", error);
          toast.error("خطأ في جلب المنتجات");
          setIsLoading(false);
          return;
        }

        const uniqueTimestamp = forceRefresh;
        const cacheBreaker = `t=${uniqueTimestamp}&nocache=${Math.random()}`;
        
        const updatedProducts = (data || []).map(product => {
          if (product.image_url) {
            const imageBaseUrl = product.image_url.split('?')[0];
            return {
              ...product,
              image_url: `${imageBaseUrl}?${cacheBreaker}`
            };
          }
          return product;
        });

        console.log(`Fetched ${updatedProducts.length} products successfully`);
        setProducts(updatedProducts);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        toast.error("خطأ في جلب المنتجات");
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [userId, forceRefresh, uiToast]);

  return { products, isLoading };
};
