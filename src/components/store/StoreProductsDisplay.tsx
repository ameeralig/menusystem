
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Product } from "@/types/product";
import ProductGrid from "@/components/store/ProductGrid";
import CategoryGrid from "@/components/store/CategoryGrid";
import SearchBar from "@/components/store/SearchBar";
import EmptyCategoryMessage from "@/components/store/EmptyCategoryMessage";
import BackButton from "@/components/store/BackButton";
import StoreHeader from "@/components/store/StoreHeader";
import StoreInfo from "@/components/store/StoreInfo";
import { CategoryImage } from "@/types/categoryImage";

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
  const [processedCategoryImages, setProcessedCategoryImages] = useState<CategoryImage[]>([]);

  // معالجة صور التصنيفات للتأكد من استخدام أحدث روابط الصور
  useEffect(() => {
    if (categoryImages && categoryImages.length > 0) {
      console.log("StoreProductsDisplay: معالجة صور التصنيفات...", categoryImages.length);
      
      // إضافة طابع زمني جديد للتأكد من عدم استخدام الصور المخزنة مؤقتًا
      const timestamp = Date.now();
      const processed = categoryImages.map(img => {
        if (!img.image_url) return img;
        
        // تحليل الرابط للتأكد من عدم تكرار المعلمات
        const url = new URL(img.image_url, window.location.origin);
        url.searchParams.set('t', `${timestamp}`);
        
        return {
          ...img,
          image_url: url.toString()
        };
      });
      
      setProcessedCategoryImages(processed);
      
      console.log("StoreProductsDisplay: تمت معالجة صور التصنيفات:", processed.length);
    } else {
      setProcessedCategoryImages([]);
    }
  }, [categoryImages]);

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

  // سنطبع معلومات حول صور التصنيفات للمساعدة في التصحيح
  useEffect(() => {
    console.log("StoreProductsDisplay: تم استلام", categoryImages?.length || 0, "صورة تصنيف");
    console.log("StoreProductsDisplay: التصنيفات المعروضة:", categories);
    
    if (processedCategoryImages?.length > 0) {
      console.log("StoreProductsDisplay: صور التصنيفات المعالجة:", 
        processedCategoryImages.map(img => ({ 
          category: img.category, 
          url: img.image_url 
        })));
    }
  }, [categoryImages, categories, processedCategoryImages]);

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

      {!selectedCategory && categories.length > 0 && !searchQuery && (
        <CategoryGrid 
          categories={categories} 
          onCategorySelect={handleCategorySelect} 
          fontSettings={fontSettings}
          categoryImages={processedCategoryImages}
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
