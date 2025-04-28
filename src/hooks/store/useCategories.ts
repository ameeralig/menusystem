
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";

export const useCategories = (userId: string | null, forceRefresh: number = 0) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        // إضافة معلمات تجديد ذاكرة التخزين المؤقت لروابط الصور
        const uniqueTimestamp = forceRefresh || Date.now();
        const cacheBreaker = `t=${uniqueTimestamp}&nocache=${Math.random()}`;
        
        const updatedCategories = (data || []).map(category => {
          if (category.image_url) {
            // نضيف كاسر للذاكرة المؤقتة فقط إذا لم يكن الرابط يحتوي بالفعل على معلمات استعلام
            const imageBaseUrl = category.image_url.split('?')[0];
            return {
              ...category,
              image_url: `${imageBaseUrl}?${cacheBreaker}`
            };
          }
          return category;
        });

        setCategories(updatedCategories);
      } catch (error: any) {
        console.error("خطأ في جلب التصنيفات:", error);
        toast({
          title: "خطأ في جلب التصنيفات",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [userId, forceRefresh, toast]);

  return { categories, isLoading };
};
