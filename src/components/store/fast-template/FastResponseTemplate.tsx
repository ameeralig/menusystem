import React, { useState, useMemo, useCallback, useRef } from "react";
import { Product } from "@/types/product";
import CategoryTabs from "./CategoryTabs";
import CompactProductCard from "./CompactProductCard";
import ProductDetailsModal from "./ProductDetailsModal";
import EmptyCategoryMessage from "../EmptyCategoryMessage";
import BottomActionsBar from "./BottomActionsBar";
import StoreHeader from "../StoreHeader";
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
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

  // معالجة فتح تفاصيل المنتج
  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  // معالجة إغلاق النافذة
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  }, []);

  return (
    <div className="min-h-screen">
      {/* رأس المتجر مع الأنيميشن */}
      {storeName && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2">
          <div className="px-3">
      <StoreHeader 
        storeName={storeName} 
        colorTheme={colorTheme}
        fontSettings={fontSettings}
      />
          </div>
        </div>
      )}

      {/* شريط التصنيفات */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        colorTheme={colorTheme}
      />

      {/* منطقة المحتوى */}
      <div className="px-3 py-4 pb-24">
        {/* عرض عدد المنتجات */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCategory ? `${selectedCategory} (${filteredProducts.length})` : `جميع المنتجات (${filteredProducts.length})`}
          </p>
          {searchQuery && (
            <p className="text-xs text-muted-foreground">
              نتائج البحث: "{searchQuery}"
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
                onClick={() => handleProductClick(product)}
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

      {/* الشريط الأفقي السفلي مع البحث المدمج */}
      <BottomActionsBar
        slug={slug}
        storeOwnerId={storeOwnerId}
        colorTheme={colorTheme}
        socialLinks={socialLinks}
        contactInfo={contactInfo}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={clearSearch}
      />

      {/* نافذة تفاصيل المنتج */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        colorTheme={colorTheme}
      />
    </div>
  );
};

export default FastResponseTemplate;
