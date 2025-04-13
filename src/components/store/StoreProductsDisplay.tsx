
import React, { useState, useCallback, useMemo } from "react";
import { Product } from "@/types/product";
import ProductGrid from "@/components/store/ProductGrid";
import CategoryGrid from "@/components/store/CategoryGrid";
import SearchBar from "@/components/store/SearchBar";
import EmptyCategoryMessage from "@/components/store/EmptyCategoryMessage";
import BackButton from "@/components/store/BackButton";
import StoreHeader from "@/components/store/StoreHeader";
import StoreInfo from "@/components/store/StoreInfo";

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
};

interface StoreProductsDisplayProps {
  products: Product[];
  storeName: string | null;
  colorTheme: string | null;
  fontSettings?: FontSettings;
  contactInfo?: ContactInfo;
}

const StoreProductsDisplay = ({ 
  products, 
  storeName, 
  colorTheme,
  fontSettings,
  contactInfo
}: StoreProductsDisplayProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.description &&
            product.description.toLowerCase().includes(query))
      );
    }

    return [...filtered].sort((a, b) => {
      if (a.display_order !== undefined && a.display_order !== null && 
          b.display_order !== undefined && b.display_order !== null) {
        return a.display_order - b.display_order;
      }
      if (a.display_order !== undefined && a.display_order !== null) return -1;
      if (b.display_order !== undefined && b.display_order !== null) return 1;
      return 0;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const getCategoryImage = useCallback(
    (category: string) => {
      const firstProductWithCategory = products.find(
        (product) => product.category === category && product.image_url
      );
      return firstProductWithCategory?.image_url || "/placeholder.svg";
    },
    [products]
  );

  const handleBackClick = useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery("");
  }, []);

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
      />

      {!selectedCategory && categories.length > 0 && !searchQuery && (
        <CategoryGrid 
          categories={categories} 
          getCategoryImage={getCategoryImage} 
          onCategorySelect={handleCategorySelect} 
          fontSettings={fontSettings}
        />
      )}

      {(selectedCategory || searchQuery || categories.length === 0) && (
        <>
          {filteredProducts.length > 0 ? (
            <ProductGrid
              products={filteredProducts}
              colorTheme={colorTheme}
            />
          ) : (
            <EmptyCategoryMessage
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StoreProductsDisplay;
