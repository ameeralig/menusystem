
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
        
        if (data && data.length > 0) {
          // تحقق من أن روابط الصور تبدأ بـ "https://" أو "http://"
          const processedImages = data.map(img => {
            if (img.image_url) {
              if (!img.image_url.startsWith('http')) {
                // إضافة بروتوكول https إذا كان مفقودًا
                if (img.image_url.startsWith('//')) {
                  return {
                    ...img,
                    image_url: `https:${img.image_url}`
                  };
                } else {
                  return {
                    ...img,
                    image_url: `https://${img.image_url}`
                  };
                }
              }
            }
            return img;
          });
          
          console.log(`تمت معالجة ${processedImages.length} صورة تصنيف للتأكد من صحة الروابط`);
          setCategoryImages(processedImages);
          
          // تحميل مسبق للصور (preload) لتحسين الأداء
          processedImages.forEach(img => {
            if (img.image_url) {
              const preloadImage = new Image();
              preloadImage.src = img.image_url;
              preloadImage.crossOrigin = "anonymous";
              preloadImage.fetchPriority = "high";
              console.log(`تحميل مسبق للصورة: ${img.category}`);
            }
          });
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
