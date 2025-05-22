
import { useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { getUrlWithTimestamp } from "@/utils/storageHelpers";

export const useCategoryImages = (categoryImages: CategoryImage[] = []) => {
  const [processedCategoryImages, setProcessedCategoryImages] = useState<CategoryImage[]>([]);

  // معالجة صور التصنيفات للتأكد من استخدام أحدث روابط الصور
  useEffect(() => {
    if (categoryImages && categoryImages.length > 0) {
      console.log("معالجة صور التصنيفات...", categoryImages.length);
      
      // استخدام تابع getUrlWithTimestamp لتحديث روابط الصور
      const processed = categoryImages.map(img => {
        if (!img.image_url) return img;
        
        return {
          ...img,
          image_url: getUrlWithTimestamp(img.image_url)
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
