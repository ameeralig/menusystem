
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
        console.log("لم يتم توفير معرف المستخدم");
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

        console.log(`تم استلام صور التصنيفات بنجاح، عددها: ${data?.length || 0}`);
        if (data) {
          console.log("بيانات صور التصنيفات:", JSON.stringify(data));
        }
        
        if (data && data.length > 0) {
          // معالجة روابط الصور لكسر التخزين المؤقت
          const timestamp = Date.now();
          const updatedImages = data.map(img => {
            if (img.image_url) {
              // تحديث الرابط بإضافة طابع زمني للتغلب على مشكلة التخزين المؤقت
              const baseUrl = img.image_url.split('?')[0];
              const updatedUrl = `${baseUrl}?t=${timestamp}`;
              
              console.log(`تحديث رابط صورة التصنيف "${img.category}": ${updatedUrl}`);
              
              return {
                ...img,
                image_url: updatedUrl
              };
            }
            return img;
          });

          setCategoryImages(updatedImages);
          console.log(`تم تحديث ${updatedImages.length} صورة تصنيف في الحالة المحلية`);
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
