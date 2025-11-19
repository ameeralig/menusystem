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

  return (
    <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-2 py-1.5">
        {/* شريط التصنيفات القابل للتمرير */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* زر الكل */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium 
              transition-all duration-200 ease-in-out
              flex-shrink-0 whitespace-nowrap
              ${selectedCategory === null 
                ? 'bg-primary text-white shadow-md scale-105' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
            style={
              selectedCategory === null && colorTheme?.startsWith('#')
                ? {
                    backgroundColor: colorTheme,
                    color: 'white'
                  }
                : undefined
            }
          >
            الكل
          </button>

          {/* أزرار التصنيفات */}
          {sortedCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium 
                transition-all duration-200 ease-in-out
                flex-shrink-0 whitespace-nowrap
                ${selectedCategory === category
                  ? 'bg-primary text-white shadow-md scale-105' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
              style={
                selectedCategory === category && colorTheme?.startsWith('#')
                  ? {
                      backgroundColor: colorTheme,
                      color: 'white'
                    }
                  : undefined
              }
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
