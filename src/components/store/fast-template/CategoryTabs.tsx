import React, { useMemo, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { sortCategoriesByOrder } from "@/utils/categorySort";
import { Edit } from "lucide-react";
import CategoryImageUploadDialog from "./CategoryImageUploadDialog";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  colorTheme?: string | null;
  categoryImages?: CategoryImage[];
  isStoreOwner?: boolean;
  storeOwnerId?: string;
  refreshData?: () => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  colorTheme,
  categoryImages,
  isStoreOwner = false,
  storeOwnerId,
  refreshData
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategoryForUpload, setSelectedCategoryForUpload] = useState<string>("");

  // ترتيب التصنيفات حسب display_order
  const sortedCategories = useMemo(() => {
    if (!categoryImages || categoryImages.length === 0) {
      return categories;
    }
    return sortCategoriesByOrder(categories, categoryImages);
  }, [categories, categoryImages]);

  // الحصول على صورة التصنيف
  const getCategoryImage = (category: string) => {
    return categoryImages?.find(img => img.category === category);
  };

  // فتح نافذة رفع الصورة
  const handleEditCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategoryForUpload(category);
    setUploadDialogOpen(true);
  };

  // معالجة نجاح الرفع
  const handleUploadSuccess = () => {
    if (refreshData) {
      refreshData();
    }
  };

  return (
    <>
      <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 overflow-visible">
        <div className="container mx-auto px-3 py-5 overflow-visible">
          {/* شريط التصنيفات القابل للتمرير */}
          <div className="flex gap-6 overflow-x-auto overflow-y-visible pb-5 pt-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* صور وأسماء التصنيفات */}
            {sortedCategories.map((category) => {
              const categoryImage = getCategoryImage(category);
              const isSelected = selectedCategory === category;
              
              return (
                <button
                  key={category}
                  onClick={() => onCategorySelect(category)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all duration-200 ease-in-out group relative z-10 py-1 px-2"
                >
                  {/* الصورة الدائرية */}
                  <div className={`
                    relative w-16 h-16 rounded-full overflow-visible
                    transition-all duration-200
                    ${isSelected 
                      ? 'ring-4 ring-primary shadow-lg scale-105 z-20' 
                      : 'ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-300 dark:group-hover:ring-gray-600'
                    }
                  `}
                  style={
                    isSelected && colorTheme?.startsWith('#')
                      ? { '--tw-ring-color': colorTheme } as React.CSSProperties
                      : undefined
                  }
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {categoryImage?.image_url ? (
                        <img
                          src={categoryImage.image_url}
                          alt={category}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {category.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* أيقونة التعديل للمالك */}
                    {isStoreOwner && (
                      <button
                        onClick={(e) => handleEditCategory(category, e)}
                        className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-30"
                        title="تحديث صورة التصنيف"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* اسم التصنيف */}
                  <span className={`
                    text-xs font-medium whitespace-nowrap transition-colors
                    ${isSelected 
                      ? 'text-primary font-semibold' 
                      : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                    }
                  `}
                  style={
                    isSelected && colorTheme?.startsWith('#')
                      ? { color: colorTheme }
                      : undefined
                  }
                  >
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* نافذة رفع صورة التصنيف */}
      {isStoreOwner && storeOwnerId && (
        <CategoryImageUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          category={selectedCategoryForUpload}
          currentImageUrl={getCategoryImage(selectedCategoryForUpload)?.image_url}
          userId={storeOwnerId}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default CategoryTabs;
