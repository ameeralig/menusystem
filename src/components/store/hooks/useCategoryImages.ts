
import { useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";

export const useCategoryImages = (categoryImages: CategoryImage[]) => {
  const [processedCategoryImages, setProcessedCategoryImages] = useState<CategoryImage[]>([]);

  // معالجة صور التصنيفات للتأكد من استخدام أحدث روابط الصور
  useEffect(() => {
    if (categoryImages && categoryImages.length > 0) {
      console.log("معالجة صور التصنيفات...", categoryImages.length);
      
      // إضافة طابع زمني جديد للتأكد من عدم استخدام الصور المخزنة مؤقتًا
      const timestamp = Date.now();
      const processed = categoryImages.map(img => {
        if (!img.image_url) return img;
        
        const baseUrl = img.image_url.split('?')[0];
        
        // تحسين URL الصورة لاستخدام WebP إذا كان متاحًا
        if (baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')) {
          return {
            ...img,
            image_url: `${baseUrl}?format=webp&quality=80&t=${timestamp}`
          };
        }
        
        // إضافة طابع زمني فقط
        return {
          ...img,
          image_url: `${baseUrl}?t=${timestamp}`
        };
      });
      
      setProcessedCategoryImages(processed);
      console.log("تمت معالجة صور التصنيفات:", processed.length);
    } else {
      setProcessedCategoryImages([]);
    }
  }, [categoryImages]);

  return { processedCategoryImages };
};
