import React from "react";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  colorTheme?: string | null;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  colorTheme
}) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-3 py-3">
        {/* عنوان التصنيفات */}
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            التصنيفات
          </h2>
        </div>

        {/* شريط التصنيفات القابل للتمرير */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* زر الكل */}
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onCategorySelect(null)}
            className="flex-shrink-0 min-w-fit whitespace-nowrap text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            style={
              selectedCategory === null && colorTheme?.startsWith('#')
                ? {
                    backgroundColor: colorTheme,
                    borderColor: colorTheme,
                    color: 'white'
                  }
                : undefined
            }
          >
            الكل
          </Button>

          {/* أزرار التصنيفات */}
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategorySelect(category)}
              className="flex-shrink-0 min-w-fit whitespace-nowrap text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              style={
                selectedCategory === category && colorTheme?.startsWith('#')
                  ? {
                      backgroundColor: colorTheme,
                      borderColor: colorTheme,
                      color: 'white'
                    }
                  : undefined
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
