import React, { useMemo } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { sortCategoriesByOrder } from "@/utils/categorySort";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  colorTheme?: string | null;
  categoryImages?: CategoryImage[];
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  colorTheme,
  categoryImages
}) => {
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

  return (
    <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-1 py-1">
        {/* شريط التصنيفات القابل للتمرير */}
        <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* صور وأسماء التصنيفات */}
          {sortedCategories.map((category) => {
            const categoryImage = getCategoryImage(category);
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all duration-200 ease-in-out group relative z-10"
              >
                {/* الصورة الدائرية */}
                <div className={`
                  relative w-12 h-12 rounded-full overflow-hidden
                  transition-all duration-200
                  ${isSelected 
                    ? 'ring-4 ring-primary shadow-lg scale-105' 
                    : 'ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-300 dark:group-hover:ring-gray-600'
                  }
                `}
                style={
                  isSelected && colorTheme?.startsWith('#')
                    ? { '--tw-ring-color': colorTheme } as React.CSSProperties
                    : undefined
                }
                >
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
  );
};

export default CategoryTabs;
