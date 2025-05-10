
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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
        
        if (data && data.length > 0) {
          // إضافة طابع زمني لكسر التخزين المؤقت للصور
          const timestamp = Date.now();
          const updatedImages = data.map(img => {
            if (img.image_url) {
              // تحديث الرابط بإضافة طابع زمني
              const imageBaseUrl = img.image_url.split('?')[0];
              const updatedUrl = `${imageBaseUrl}?t=${timestamp}`;
              console.log(`تحديث رابط الصورة للتصنيف ${img.category}: ${updatedUrl}`);
              
              // التحقق من صحة الرابط
              const imgTest = new Image();
              imgTest.src = updatedUrl;
              
              return {
                ...img,
                image_url: updatedUrl
              };
            }
            return img;
          });

          setCategoryImages(updatedImages);
          console.log("تم تحديث قائمة صور التصنيفات:", updatedImages.length);
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
