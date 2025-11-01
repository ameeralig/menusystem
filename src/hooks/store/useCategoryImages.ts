
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
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        console.log(`تم استلام صور التصنيفات بنجاح، عددها: ${data?.length || 0}`);
        
        // إنشاء طابع زمني فريد لجميع الصور (نفس منطق صور المنتجات)
        const uniqueTimestamp = forceRefresh || Date.now();
        
        if (data && data.length > 0) {
          const updatedImages = data.map(img => {
            if (img.image_url) {
              // استخراج الرابط الأساسي (إزالة أي query parameters قديمة)
              const baseUrl = img.image_url.split('?')[0];
              
              // التحقق من نوع الرابط (Supabase أو غيره)
              const isSupabaseUrl = baseUrl.includes('supabase.co') || 
                                    baseUrl.includes('supabase.in') || 
                                    baseUrl.includes('zqlckixwpyrwdwrsuhsg') ||
                                    baseUrl.includes('lovable-app');
                                    
              // إنشاء رابط محسّن مع منع الكاش (نفس معاملات صور المنتجات)
              const updatedUrl = isSupabaseUrl 
                ? `${baseUrl}?format=webp&quality=85&width=600&t=${uniqueTimestamp}`
                : `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${uniqueTimestamp}`;
                
              return {
                ...img,
                image_url: updatedUrl
              };
            }
            return img;
          });
          
          console.log(`✅ تم تحديث ${updatedImages.length} صورة تصنيف بطابع زمني: ${uniqueTimestamp}`);

          // تحميل مسبق وفوري للصور (eager loading كما في صور المنتجات)
          updatedImages.forEach(img => {
            if (img.image_url) {
              const preloadImage = new Image();
              preloadImage.src = img.image_url;
              preloadImage.loading = "eager"; // تحميل فوري
              console.log(`🖼️ تحميل مسبق لصورة التصنيف: ${img.category}`);
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
