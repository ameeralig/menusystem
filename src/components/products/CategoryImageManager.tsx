
import { Separator } from "@/components/ui/separator";
import { CategoryImage } from "@/types/categoryImage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategoryImageCard } from "./category-image/CategoryImageCard";
import { useCategoryImageUpload } from "./category-image/useCategoryImageUpload";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { getUrlWithTimestamp } from "@/utils/storageHelpers";

interface CategoryImageManagerProps {
  categories: string[];
  categoryImages: CategoryImage[];
  onUpdateImages: (images: CategoryImage[]) => void;
}

export const CategoryImageManager = ({
  categories,
  categoryImages,
  onUpdateImages,
}: CategoryImageManagerProps) => {
  const { uploading, handleFileUpload, removeImage } = useCategoryImageUpload({
    categoryImages,
    onUpdateImages
  });
  
  // تسجيل معلومات حول صور التصنيفات عند تغيرها
  useEffect(() => {
    console.log("CategoryImageManager: تلقي", categoryImages.length, "صورة تصنيف");
    if (categoryImages.length > 0) {
      console.log("تفاصيل صور التصنيفات:");
      categoryImages.forEach(img => {
        console.log(`- التصنيف: ${img.category}, الرابط: ${img.image_url}`);
      });
    }
  }, [categoryImages]);

  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">إدارة صور التصنيفات</h3>
        <Alert>
          <AlertTitle>لا توجد تصنيفات</AlertTitle>
          <AlertDescription>
            أضف منتجات بتصنيفات مختلفة أولاً لإدارة صور التصنيفات
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // إعداد الصور مع روابط تحتوي على طوابع زمنية
  const getProcessedImage = (category: string): CategoryImage | undefined => {
    const categoryImage = categoryImages.find(img => img.category === category);
    if (categoryImage && categoryImage.image_url) {
      return {
        ...categoryImage,
        image_url: getUrlWithTimestamp(categoryImage.image_url) || categoryImage.image_url
      };
    }
    return categoryImage;
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold">إدارة صور التصنيفات</h3>
          <p className="text-sm text-muted-foreground">
            يمكنك تخصيص صورة لكل تصنيف تظهر في صفحة المعاينة. صور التصنيفات منفصلة تماماً عن صور المنتجات.
          </p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const processedImage = getProcessedImage(category);
            
            return (
              <CategoryImageCard
                key={category}
                category={category}
                categoryImage={processedImage}
                onFileUpload={handleFileUpload}
                onRemoveImage={removeImage}
                uploading={uploading === category}
              />
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
