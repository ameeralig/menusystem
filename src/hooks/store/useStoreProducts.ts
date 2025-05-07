
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

export const useStoreProducts = (userId: string | null, forceRefresh: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          throw error;
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

        setProducts(updatedProducts);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        toast({
          title: "خطأ في جلب المنتجات",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    fetchProducts();
  }, [userId, forceRefresh, toast]);

  return products;
};
