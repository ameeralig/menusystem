import React, { useState, useMemo, useCallback } from "react";
import { Product } from "@/types/product";
import CategoryTabs from "./CategoryTabs";
import CompactProductCard from "./CompactProductCard";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import EmptyCategoryMessage from "../EmptyCategoryMessage";
import StoreInfo from "../StoreInfo";
import FloatingActionsBar from "./FloatingActionsBar";
import AnimatedStoreHeader from "../AnimatedStoreHeader";
import { ContactInfo, FontSettings, SocialLinks } from "@/types/store";

interface FastResponseTemplateProps {
  products: Product[];
  colorTheme?: string | null;
  storeName?: string | null;
  onSearchChange?: (query: string) => void;
  contactInfo?: ContactInfo;
  slug?: string;
  storeOwnerId?: string;
  fontSettings?: FontSettings;
  socialLinks?: SocialLinks;
}

const FastResponseTemplate: React.FC<FastResponseTemplateProps> = ({
  products,
  colorTheme,
  storeName,
  onSearchChange,
  contactInfo,
  slug,
  storeOwnerId,
  fontSettings,
  socialLinks
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
    <div className="min-h-screen">
      {/* رأس المتجر مع الأنيميشن */}
      {storeName && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
          <div className="px-3">
            <AnimatedStoreHeader
              storeName={storeName}
              colorTheme={colorTheme}
              fontSettings={fontSettings}
            />
          </div>
        </div>
      )}

      {/* تفاصيل المتجر */}
      {contactInfo && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-3 py-4">
            <StoreInfo contactInfo={contactInfo} colorTheme={colorTheme} />
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
      <div className="px-3 py-4">
        {/* شريط البحث */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full border-0 p-4 pr-12 pl-12 rounded-2xl text-base transition-all duration-300 outline-none focus:outline-none text-gray-700"
              style={{
                background: '#e8e8e8',
                boxShadow: '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = 'inset 20px 20px 60px #c5c5c5, inset -20px -20px 60px #ffffff';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = '20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff';
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
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

      {/* الشريط العائم للإجراءات */}
      <FloatingActionsBar 
        slug={slug}
        storeOwnerId={storeOwnerId}
        colorTheme={colorTheme}
        socialLinks={socialLinks}
      />
    </div>
  );
};

export default FastResponseTemplate;
