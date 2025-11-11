import React, { useState, useMemo, useCallback } from "react";
import { Product } from "@/types/product";
import CategoryTabs from "./CategoryTabs";
import CompactProductCard from "./CompactProductCard";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import EmptyCategoryMessage from "../EmptyCategoryMessage";

interface FastResponseTemplateProps {
  products: Product[];
  colorTheme?: string | null;
  storeName?: string | null;
  onSearchChange?: (query: string) => void;
}

const FastResponseTemplate: React.FC<FastResponseTemplateProps> = ({
  products,
  colorTheme,
  storeName,
  onSearchChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // استخراج التصنيفات الفريدة من المنتجات
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [products]);

  // تصفية المنتجات حسب التصنيف والبحث
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // تصفية حسب التصنيف
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // تصفية حسب البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    // ترتيب حسب display_order إذا كان موجوداً
    return filtered.sort((a, b) => {
      if (a.display_order !== undefined && b.display_order !== undefined) {
        return a.display_order - b.display_order;
      }
      return 0;
    });
  }, [products, selectedCategory, searchQuery]);

  // معالجة تغيير التصنيف
  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setSearchQuery(""); // مسح البحث عند تغيير التصنيف
  }, []);

  // معالجة البحث
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  }, [onSearchChange]);

  // مسح البحث
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  }, [onSearchChange]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* رأس المتجر */}
      {storeName && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
          <div className="container mx-auto px-3">
            <h1 
              className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white"
              style={colorTheme?.startsWith('#') ? { color: colorTheme } : undefined}
            >
              {storeName}
            </h1>
          </div>
        </div>
      )}

      {/* شريط التصنيفات الثابت */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        colorTheme={colorTheme}
      />

      {/* منطقة المحتوى */}
      <div className="container mx-auto px-3 py-4">
        {/* شريط البحث */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pr-10 pl-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* عرض عدد المنتجات */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCategory ? `${selectedCategory} (${filteredProducts.length})` : `جميع المنتجات (${filteredProducts.length})`}
          </p>
          {searchQuery && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              نتائج البحث عن: "{searchQuery}"
            </p>
          )}
        </div>

        {/* قائمة المنتجات */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <CompactProductCard
                key={product.id}
                product={product}
                colorTheme={colorTheme}
              />
            ))}
          </div>
        ) : (
          <EmptyCategoryMessage
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />
        )}
      </div>
    </div>
  );
};

export default FastResponseTemplate;
