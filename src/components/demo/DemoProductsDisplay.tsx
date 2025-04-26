
import { useState } from "react";
import { Product } from "@/types/product";
import StoreHeader from "@/components/store/StoreHeader";
import SearchBar from "@/components/store/SearchBar";
import CategoryGrid from "@/components/store/CategoryGrid";
import ProductGrid from "@/components/store/ProductGrid";
import BackButton from "@/components/store/BackButton";
import EmptyCategoryMessage from "@/components/store/EmptyCategoryMessage";
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

interface DemoProductsDisplayProps {
  products: Product[];
  storeName: string;
  colorTheme: string;
  categoryImages?: CategoryImage[];
  fontSettings?: FontSettings;
}

const DemoProductsDisplay = ({ 
  products, 
  storeName, 
  colorTheme,
  categoryImages = [],
  fontSettings
}: DemoProductsDisplayProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  
  const filteredProducts = selectedCategory
    ? products.filter(p => 
        p.category === selectedCategory && 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // دالة للحصول على صورة التصنيف الافتراضية من المنتجات
  const getDefaultCategoryImage = (category: string) => {
    const categoryProduct = products.find(p => p.category === category);
    return categoryProduct?.image_url || '/placeholder.svg';
  };

  // سنطبع معلومات حول صور التصنيفات للمساعدة في التصحيح
  if (categoryImages && categoryImages.length > 0) {
    console.log("DemoProductsDisplay has", categoryImages.length, "category images");
  }

  return (
    <>
      <StoreHeader storeName={storeName} colorTheme={colorTheme} fontSettings={fontSettings} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {!selectedCategory ? (
        <CategoryGrid
          categories={categories}
          getCategoryImage={getDefaultCategoryImage}
          onCategorySelect={setSelectedCategory}
          categoryImages={categoryImages}
          fontSettings={fontSettings}
        />
      ) : (
        <>
          <BackButton onClick={() => setSelectedCategory(null)} />
          <ProductGrid products={filteredProducts} />
          {selectedCategory && filteredProducts.length === 0 && <EmptyCategoryMessage />}
        </>
      )}
    </>
  );
};

export default DemoProductsDisplay;
