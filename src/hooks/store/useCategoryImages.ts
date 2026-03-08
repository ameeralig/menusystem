
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
        
        // استخدام استعلام مباشر بدلاً من طبقة التخزين المؤقت مع ترتيب حسب display_order
        // ترتيب NULLS LAST لوضع التصنيفات بدون ترتيب في النهاية
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId)
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        console.log(`تم استلام صور التصنيفات بنجاح، عددها: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          const updatedImages = data.map(img => {
            if (img.image_url) {
              // استخراج الرابط الأساسي (إزالة أي query parameters قديمة)
              const baseUrl = img.image_url.split('?')[0];
              
              // إضافة timestamp فقط عند forceRefresh لكسر الكاش
              let updatedUrl: string;
              
              if (forceRefresh && forceRefresh > 0) {
                updatedUrl = `${baseUrl}?t=${forceRefresh}`;
              } else {
                updatedUrl = baseUrl;
              }
                
              return {
                ...img,
                image_url: updatedUrl
              };
            }
            return img;
          });
          
          console.log(`✅ تم معالجة ${updatedImages.length} صورة تصنيف`);

          // تحميل مسبق للصور
          updatedImages.forEach(img => {
            if (img.image_url) {
              const preloadImage = new Image();
              preloadImage.src = img.image_url;
            }
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
