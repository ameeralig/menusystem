
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CategoryImage } from "@/types/categoryImage";

export const useCategoryImages = (userId: string | null, forceRefresh: number) => {
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoryImages = async () => {
      if (!userId) return;

      try {
        console.log("جاري جلب صور التصنيفات للمستخدم:", userId);
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        console.log("تم استلام صور التصنيفات:", data?.length || 0, "صورة");
        
        // إضافة طابع زمني لكسر التخزين المؤقت للصور
        const uniqueTimestamp = Date.now(); // استخدام الوقت الحالي بدلاً من forceRefresh
        const cacheBreaker = `t=${uniqueTimestamp}&nocache=${Math.random()}`;
        
        const updatedImages = (data || []).map(img => {
          if (img.image_url) {
            const imageBaseUrl = img.image_url.split('?')[0];
            const updatedUrl = `${imageBaseUrl}?${cacheBreaker}`;
            console.log(`تحديث رابط الصورة للتصنيف ${img.category}: ${updatedUrl}`);
            return {
              ...img,
              image_url: updatedUrl
            };
          }
          return img;
        });

        setCategoryImages(updatedImages);
      } catch (error: any) {
        console.error("خطأ في جلب صور التصنيفات:", error);
        toast({
          title: "خطأ في جلب صور التصنيفات",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    fetchCategoryImages();
  }, [userId, forceRefresh, toast]);

  return categoryImages;
};
