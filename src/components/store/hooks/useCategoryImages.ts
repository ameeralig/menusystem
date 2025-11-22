
import { useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { formatImageUrl } from "@/utils/storageHelpers";

export const useCategoryImages = (categoryImages: CategoryImage[] = []) => {
  const [processedCategoryImages, setProcessedCategoryImages] = useState<CategoryImage[]>([]);

  // معالجة صور التصنيفات للتأكد من استخدام أحدث روابط الصور
  useEffect(() => {
    if (categoryImages && categoryImages.length > 0) {
      console.log("معالجة صور التصنيفات...", categoryImages.length);
      
      const processed = categoryImages.map(img => {
        if (!img.image_url) return img;
        
        try {
          // استخدام الوظيفة المحسنة لتنسيق رابط الصورة (بدون timestamp للسماح بالكاش)
          const newImageUrl = formatImageUrl(img.image_url);
          
          console.log(`معالجة صورة للتصنيف ${img.category}: من "${img.image_url}" إلى "${newImageUrl}"`);
          
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
