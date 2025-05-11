
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CategoryImage } from "@/types/categoryImage";
import { checkImageUrl } from "@/utils/storageHelpers";

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
        
        // إضافة معرف عشوائي للاستعلام لمنع التخزين المؤقت على مستوى Supabase
        const randomId = Date.now().toString();
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId)
          .order('created_at', { ascending: false })
          .limit(100, { foreignTable: 'limit_query_id_' + randomId });

        if (error) {
          throw error;
        }

        console.log(`تم استلام صور التصنيفات بنجاح، عددها: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          // إعادة ضبط الصور وإضافة طابع زمني جديد
          const timestamp = Date.now();
          const validatedImages = await Promise.all(
            data.map(async (img) => {
              if (!img.image_url) return img;
              
              // إضافة طابع زمني لكسر التخزين المؤقت
              const baseUrl = img.image_url.split('?')[0];
              const updatedUrl = `${baseUrl}?t=${timestamp}&nocache=true`;
              
              // فحص صلاحية رابط الصورة
              const isValid = await checkImageUrl(updatedUrl);
              
              console.log(`صورة التصنيف "${img.category}": ${updatedUrl} - ${isValid ? 'صالحة' : 'غير صالحة'}`);
              
              return {
                ...img,
                image_url: isValid ? updatedUrl : null
              };
            })
          );

          setCategoryImages(validatedImages);
          console.log(`تم تحديث ${validatedImages.length} صورة تصنيف في الحالة المحلية`);
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

    // تنفيذ الاستعلام فورًا عند تغير المعرف أو رقم التحديث
    fetchCategoryImages();
  }, [userId, forceRefresh, toast]);

  return { categoryImages, isLoading };
};
