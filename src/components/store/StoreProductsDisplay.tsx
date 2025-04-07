
import { useState } from "react";
import { Product } from "@/types/product";
import StoreHeader from "@/components/store/StoreHeader";
import SearchBar from "@/components/store/SearchBar";
import CategoryGrid from "@/components/store/CategoryGrid";
import ProductGrid from "@/components/store/ProductGrid";
import BackButton from "@/components/store/BackButton";
import EmptyCategoryMessage from "@/components/store/EmptyCategoryMessage";
import StoreContactInfo from "@/components/store/StoreContactInfo";

interface StoreProductsDisplayProps {
  products: Product[];
  storeName: string | null;
  colorTheme: string | null;
  contactInfo?: any;
}

const StoreProductsDisplay = ({ products, storeName, colorTheme, contactInfo }: StoreProductsDisplayProps) => {
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
    <>
      <StoreHeader storeName={storeName} colorTheme={colorTheme} />
      <StoreContactInfo contactInfo={contactInfo} />
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        products={products}
        setSelectedCategory={setSelectedCategory}
      />

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
    </>
  );
};

export default StoreProductsDisplay;
