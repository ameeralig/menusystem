
import { useState } from "react";
import { Product } from "@/types/product";
import StoreHeader from "@/components/store/StoreHeader";
import SearchBar from "@/components/store/SearchBar";
import CategoryGrid from "@/components/store/CategoryGrid";
import ProductGrid from "@/components/store/ProductGrid";
import BackButton from "@/components/store/BackButton";
import EmptyCategoryMessage from "@/components/store/EmptyCategoryMessage";

interface StoreProductsDisplayProps {
  products: Product[];
  storeName: string | null;
  colorTheme: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}

const StoreProductsDisplay = ({ 
  products, 
  storeName, 
  colorTheme,
  logoUrl,
  bannerUrl
}: StoreProductsDisplayProps) => {
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

  const getCategoryImage = (category: string) => {
    const categoryProduct = products.find(p => p.category === category && p.image_url);
    return categoryProduct?.image_url || '/placeholder.svg';
  };

  return (
    <div className="space-y-4">
      {bannerUrl && (
        <div className="w-full h-32 sm:h-40 md:h-48 overflow-hidden rounded-lg mb-4">
          <img 
            src={bannerUrl} 
            alt="Store Banner" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <StoreHeader 
        storeName={storeName} 
        colorTheme={colorTheme}
        logoUrl={logoUrl}
      />
      
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {!selectedCategory ? (
        <CategoryGrid
          categories={categories}
          getCategoryImage={getCategoryImage}
          onCategorySelect={setSelectedCategory}
        />
      ) : (
        <>
          <BackButton onClick={() => setSelectedCategory(null)} />
          <ProductGrid products={filteredProducts} />
          {filteredProducts.length === 0 && <EmptyCategoryMessage />}
        </>
      )}
    </div>
  );
};

export default StoreProductsDisplay;
