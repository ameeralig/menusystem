
import React, { Suspense, useEffect } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { Skeleton } from "@/components/ui/skeleton";

// تحميل بطئ لمكون شبكة التصنيفات
const CategoryGrid = React.lazy(() => import("@/components/store/CategoryGrid"));

type FontSettings = {
  storeName?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  categoryText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  generalText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
};

interface CategorySectionProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  categoryImages?: CategoryImage[];
  fontSettings?: FontSettings;
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  categories, 
  onCategorySelect, 
  categoryImages = [],
  fontSettings 
}) => {
  // تسجيل معلومات للتصحيح
  useEffect(() => {
    console.log(`CategorySection: تلقي ${categoryImages?.length || 0} صورة تصنيف`);
    if (categoryImages?.length > 0) {
      console.log("عينة من صور التصنيفات في CategorySection:");
      const sampleImages = categoryImages.slice(0, Math.min(3, categoryImages.length));
      sampleImages.forEach(img => {
        const truncatedUrl = img.image_url?.substring(0, 50) + (img.image_url && img.image_url.length > 50 ? '...' : '');
        console.log(`- التصنيف: ${img.category}, الرابط: ${truncatedUrl || 'غير متوفر'}`);
      });
      
      // تحميل مسبق للصور
      categoryImages.forEach(img => {
        if (img.image_url) {
          const preloadLink = document.createElement('link');
          preloadLink.rel = 'preload';
          preloadLink.as = 'image';
          preloadLink.href = img.image_url;
          document.head.appendChild(preloadLink);
        }
      });
    }
  }, [categoryImages]);

  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryGrid 
        categories={categories} 
        onCategorySelect={onCategorySelect} 
        fontSettings={fontSettings}
        categoryImages={categoryImages}
      />
    </Suspense>
  );
};

// هيكل تحميل للتصنيفات
const CategorySkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
};

export default CategorySection;
