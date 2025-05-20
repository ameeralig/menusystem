
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

// وظيفة معدلة للتحكم في عدد المنتجات المستردة
export const useStoreProducts = (
  userId: string | null, 
  forceRefresh: number,
  limit: number = 100, // عدد المنتجات لكل صفحة
  page: number = 1 // رقم الصفحة الحالية
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // حساب المنتجات لمعرفة إجمالي عدد المنتجات
        const { count, error: countError } = await supabase
          .from("products")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId);
          
        if (countError) {
          throw countError;
        }
        
        if (count !== null) {
          setTotalProducts(count);
        }
        
        // استعلام صفحات المنتجات
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId)
          .order('display_order', { ascending: true, nullsFirst: false })
          .range((page - 1) * limit, page * limit - 1);

        if (error) {
          throw error;
        }

        // تحسين روابط الصور باستخدام أداة التحسين الجديدة
        const updatedProducts = (data || []).map(product => {
          if (product.image_url) {
            return {
              ...product,
              image_url: optimizeImageUrl(product.image_url, {
                format: 'webp',
                quality: 80,
                bustCache: true
              })
            };
          }
          return product;
        });

        setProducts(updatedProducts);
      } catch (error: any) {
        console.error("خطأ في جلب المنتجات:", error);
        toast({
          title: "خطأ في جلب المنتجات",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [userId, forceRefresh, toast, limit, page]);

  return {
    products,
    isLoading,
    totalProducts,
    hasMore: products.length < totalProducts
  };
};
