
import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import StoreHeader from "@/components/store/StoreHeader";
import SearchBar from "@/components/store/SearchBar";
import CategoryGrid from "@/components/store/CategoryGrid";
import ProductGrid from "@/components/store/ProductGrid";
import BackButton from "@/components/store/BackButton";
import EmptyCategoryMessage from "@/components/store/EmptyCategoryMessage";
import { CategoryImage } from "@/types/categoryImage";
import StoreInfo from "@/components/store/StoreInfo";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

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

interface DemoProductsDisplayProps {
  products: Product[];
  storeName: string;
  colorTheme: string;
  categoryImages?: CategoryImage[];
  fontSettings?: FontSettings;
  contactInfo?: ContactInfo;
}

const DemoProductsDisplay = ({ 
  products, 
  storeName, 
  colorTheme,
  categoryImages = [],
  fontSettings,
  contactInfo = {}
}: DemoProductsDisplayProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [processedCategoryImages, setProcessedCategoryImages] = useState<CategoryImage[]>([]);
  
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  
  const filteredProducts = selectedCategory
    ? products.filter(p => 
        p.category === selectedCategory && 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // معالجة صور التصنيفات وتحسينها باستخدام أداة التحسين الجديدة
  useEffect(() => {
    if (categoryImages && categoryImages.length > 0) {
      console.log("DemoProductsDisplay: معالجة", categoryImages.length, "صورة تصنيف");
      
      const processed = categoryImages.map(img => {
        if (!img.image_url) return img;
        
        // تحسين الصورة باستخدام أداة التحسين الجديدة
        const optimizedUrl = optimizeImageUrl(img.image_url, {
          format: 'webp',
          quality: 80,
          bustCache: true,
          isImportant: true
        });
        
        return {
          ...img,
          image_url: optimizedUrl
        };
      });
      
      setProcessedCategoryImages(processed);
      
      // تسجيل المعلومات للتصحيح
      processed.forEach(img => {
        console.log(`DemoProductsDisplay: صورة تصنيف ${img.category}: ${img.image_url}`);
      });
    } else {
      setProcessedCategoryImages([]);
    }
  }, [categoryImages]);

  return (
    <>
      <StoreHeader storeName={storeName} colorTheme={colorTheme} fontSettings={fontSettings} />
      
      <StoreInfo contactInfo={contactInfo} colorTheme={colorTheme} />
      
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {!selectedCategory ? (
        <CategoryGrid
          categories={categories}
          onCategorySelect={setSelectedCategory}
          categoryImages={processedCategoryImages}
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
