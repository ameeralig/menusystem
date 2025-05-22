
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
        
        // تحليل الرابط للتأكد من عدم تكرار المعلمات
        const baseUrl = img.image_url.split('?')[0];
        
        // تحسين URL الصورة لاستخدام WebP إذا كان متاحًا
        const newImageUrl = baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')
          ? `${baseUrl}?format=webp&quality=80&t=${timestamp}&nocache=true`
          : `${baseUrl}?t=${timestamp}&nocache=true`;
        
        return {
          ...img,
          image_url: newImageUrl
        };
      });
      
      setProcessedCategoryImages(processed);
      console.log("تمت معالجة صور التصنيفات:", processed.length);
      
      // طباعة معلومات تفصيلية للتصحيح
      processed.forEach(img => {
        console.log(`صورة معالجة للتصنيف ${img.category}: ${img.image_url}`);
      });
    } else {
      console.log("لم يتم توفير أي صور تصنيفات للمعالجة");
      setProcessedCategoryImages([]);
    }
  }, [categoryImages]);

  return { processedCategoryImages };
};
