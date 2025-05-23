
import { useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";

export const useCategoryImages = (categoryImages: CategoryImage[] = []) => {
  const [processedCategoryImages, setProcessedCategoryImages] = useState<CategoryImage[]>([]);

  // معالجة صور التصنيفات للتأكد من استخدام أحدث روابط الصور
  useEffect(() => {
    if (categoryImages && categoryImages.length > 0) {
      console.log("معالجة صور التصنيفات...", categoryImages.length);
      
      // إضافة طابع زمني جديد للتأكد من عدم استخدام الصور المخزنة مؤقتًا
      const timestamp = Date.now();
      const processed = categoryImages.map(img => {
        if (!img.image_url) return img;
        
        try {
          // تحليل الرابط للتأكد من عدم تكرار المعلمات
          const baseUrl = img.image_url.split('?')[0];
          
          // التحقق من نوع الرابط (إذا كان من سوبابيس أو من مصدر آخر)
          const isSupabaseUrl = baseUrl.includes('supabase.co') || 
                              baseUrl.includes('supabase.in') || 
                              baseUrl.includes('zqlckixwpyrwdwrsuhsg') ||
                              baseUrl.includes('lovable-app');
          
          // تحسين URL الصورة مع تحسينات WebP وتحجيم أفضل
          const newImageUrl = isSupabaseUrl
            ? `${baseUrl}?format=webp&quality=80&t=${timestamp}&width=400&height=300&resize=contain&nocache=true`
            : `${baseUrl}?t=${timestamp}&nocache=true`;
          
          // تحميل مسبق للصورة لتحسين الأداء
          const preloadImage = new Image();
          preloadImage.src = newImageUrl;
          
          console.log(`معالجة صورة للتصنيف ${img.category}: إلى "${newImageUrl}"`);
          
          return {
            ...img,
            image_url: newImageUrl
          };
        } catch (error) {
          console.error(`خطأ في معالجة رابط صورة التصنيف ${img.category}:`, error);
          return img;
        }
      });
      
      setProcessedCategoryImages(processed);
      console.log("تمت معالجة صور التصنيفات:", processed.length);
    } else {
      console.log("لم يتم توفير أي صور تصنيفات للمعالجة");
      setProcessedCategoryImages([]);
    }
  }, [categoryImages]);

  return { processedCategoryImages };
};
