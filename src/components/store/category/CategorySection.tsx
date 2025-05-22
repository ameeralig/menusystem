
import React, { Suspense } from "react";
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
  categoryImages,
  fontSettings 
}) => {
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
