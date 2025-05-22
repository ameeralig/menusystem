
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { useProductLoading } from "./hooks/useProductLoading";
import { useGlobalSearch } from "./hooks/useGlobalSearch";
import { useCategoryImages } from "./hooks/useCategoryImages";
import StoreHeader from "./StoreHeader";
import StoreInfo from "./StoreInfo";
import BackButton from "./BackButton";
import SearchBar from "./SearchBar";
import CategorySection from "./category/CategorySection";
import ProductSection from "./product/ProductSection";

type FontSettings = {
  storeName?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  categoryText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  generalText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
};

type ContactInfo = {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifi?: string | null;
  businessHours?: string | null;
};

interface StoreProductsDisplayProps {
  products: Product[];
  storeName: string | null;
  colorTheme: string | null;
  fontSettings?: FontSettings;
  contactInfo?: ContactInfo;
  categoryImages?: CategoryImage[];
}

const StoreProductsDisplay = ({ 
  products, 
  storeName, 
  colorTheme,
  fontSettings,
  contactInfo,
  categoryImages = []
}: StoreProductsDisplayProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // استخدام الهوكس الجديدة
  const { processedCategoryImages } = useCategoryImages(categoryImages);
  const { visibleProducts, hasMoreProducts, loadMoreProducts } = useProductLoading(products, selectedCategory, searchQuery);
  const { categories } = useGlobalSearch(products);

  // التعامل مع البحث
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // اختيار التصنيف
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // العودة للصفحة الرئيسية
  const handleBackClick = useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery("");
  }, []);

  // تبديل حالة البحث
  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery("");
    }
  }, [showSearch]);

  return (
    <div className="space-y-6">
      <StoreHeader storeName={storeName} colorTheme={colorTheme} fontSettings={fontSettings} />
      
      <StoreInfo contactInfo={contactInfo} colorTheme={colorTheme} />

      {selectedCategory && (
        <BackButton onClick={handleBackClick} />
      )}

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleSearch={toggleSearch}
        showSearch={showSearch}
        products={products}
      />

      {/* عرض شبكة التصنيفات أو شبكة المنتجات حسب الحالة */}
      {!selectedCategory && categories.length > 0 && !searchQuery ? (
        <CategorySection 
          categories={categories}
          onCategorySelect={handleCategorySelect}
          fontSettings={fontSettings}
          categoryImages={processedCategoryImages}
        />
      ) : (
        <ProductSection
          products={visibleProducts}
          filteredProducts={visibleProducts}
          colorTheme={colorTheme}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onLoadMore={loadMoreProducts}
          hasMore={hasMoreProducts}
        />
      )}
    </div>
  );
};

export default StoreProductsDisplay;
