
import { Separator } from "@/components/ui/separator";
import { CategoryImage } from "@/types/categoryImage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategoryImageCard } from "./category-image/CategoryImageCard";
import { useCategoryImageUpload } from "./category-image/useCategoryImageUpload";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

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
  const { uploading, error, setError, handleFileUpload, handleUrlUpload, removeImage } = useCategoryImageUpload({
    categoryImages,
    onUpdateImages
  });
  
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string | null>>({});
  
  // تحديث سجل الأخطاء لكل تصنيف
  useEffect(() => {
    if (error) {
      setCategoryErrors(prev => ({
        ...prev,
        [uploading || '']: error
      }));
    }
  }, [error, uploading]);
  
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
            const categoryImage = categoryImages.find(img => img.category === category);
            
            return (
              <CategoryImageCard
                key={category}
                category={category}
                categoryImage={categoryImage}
                onFileUpload={handleFileUpload}
                onUrlUpload={handleUrlUpload}
                onRemoveImage={removeImage}
                uploading={uploading === category}
                error={categoryErrors[category] || null}
              />
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
