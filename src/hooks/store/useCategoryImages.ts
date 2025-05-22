
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CategoryImage } from "@/types/categoryImage";
import { getUrlWithTimestamp } from "@/utils/storageHelpers";

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
        
        // استخدام استعلام مباشر مع تحديد عمود user_id بشكل صريح في الاستعلام
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        console.log(`تم استلام صور التصنيفات بنجاح، عددها: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          // استخدام تابع getUrlWithTimestamp لتحديث روابط الصور
          const updatedImages = data.map(img => {
            return {
              ...img,
              image_url: img.image_url ? getUrlWithTimestamp(img.image_url, forceRefresh) : null
            };
          });
          
          console.log(`تم تحديث ${updatedImages.length} صورة تصنيف بطابع زمني جديد`);

          // تحميل مسبق للصور لتحسين الأداء
          updatedImages.forEach(img => {
            if (img.image_url) {
              const preloadImage = new Image();
              preloadImage.src = img.image_url;
              preloadImage.fetchPriority = "high";
              console.log(`تحميل مسبق للصورة: ${img.category}`);
            }
          });

          // طباعة تفاصيل صور التصنيفات بعد المعالجة
          if (updatedImages.length > 0) {
            console.log("تفاصيل صور التصنيفات بعد المعالجة:");
            updatedImages.forEach(img => {
              console.log(`- التصنيف: ${img.category}, الرابط: ${img.image_url || 'غير متوفر'}`);
            });
          }
          
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
