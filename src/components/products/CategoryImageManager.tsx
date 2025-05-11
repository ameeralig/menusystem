
import { Separator } from "@/components/ui/separator";
import { CategoryImage } from "@/types/categoryImage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategoryImageCard } from "./category-image/CategoryImageCard";
import { useCategoryImageUpload } from "./category-image/useCategoryImageUpload";
import { TooltipProvider } from "@/components/ui/tooltip";

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
