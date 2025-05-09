
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CategoryImage } from "@/types/categoryImage";

export const useCategoryImages = (userId: string | null, forceRefresh: number) => {
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoryImages = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("جاري جلب صور التصنيفات للمستخدم:", userId);
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        console.log("تم استلام صور التصنيفات:", data?.length || 0, "صورة");
        console.log("البيانات المستلمة:", JSON.stringify(data));
        
        if (data && data.length > 0) {
          // إضافة طابع زمني لكسر التخزين المؤقت للصور
          const timestamp = Date.now();
          const updatedImages = data.map(img => {
            if (img.image_url) {
              // التأكد من إضافة معلمات كسر التخزين المؤقت لكل صورة
              const imageBaseUrl = img.image_url.split('?')[0];
              const updatedUrl = `${imageBaseUrl}?t=${timestamp}&nocache=${Math.random()}`;
              console.log(`تحديث رابط الصورة للتصنيف ${img.category}: ${updatedUrl}`);
              return {
                ...img,
                image_url: updatedUrl
              };
            }
            return img;
          });

          setCategoryImages(updatedImages);
        } else {
          console.log("لم يتم العثور على صور تصنيفات للمستخدم");
          setCategoryImages([]);
        }
      } catch (error: any) {
        console.error("خطأ في جلب صور التصنيفات:", error);
        toast({
          title: "خطأ في جلب صور التصنيفات",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryImages();
  }, [userId, forceRefresh, toast]);

  return { categoryImages, isLoading };
};
