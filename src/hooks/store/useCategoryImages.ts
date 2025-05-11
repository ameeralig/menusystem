
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
        
        // إضافة طابع زمني لجميع الصور لكسر التخزين المؤقت - بنفس طريقة المنتجات
        const uniqueTimestamp = forceRefresh || Date.now();
        const cacheBreaker = `t=${uniqueTimestamp}&nocache=${Math.random()}`;
        
        if (data && data.length > 0) {
          const updatedImages = data.map(img => {
            if (img.image_url) {
              // تطبيق نفس أسلوب المنتجات: استخراج الرابط الأساسي وإضافة طابع زمني
              const imageBaseUrl = img.image_url.split('?')[0];
              return {
                ...img,
                image_url: `${imageBaseUrl}?${cacheBreaker}`
              };
            }
            return img;
          });
          
          console.log(`تم تحديث ${updatedImages.length} صورة تصنيف بطابع زمني جديد`);
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
