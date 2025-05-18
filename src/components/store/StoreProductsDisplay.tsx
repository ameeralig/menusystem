
import React, { useState, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import { Product } from "@/types/product";
import SearchBar from "@/components/store/SearchBar";
import EmptyCategoryMessage from "@/components/store/EmptyCategoryMessage";
import BackButton from "@/components/store/BackButton";
import StoreHeader from "@/components/store/StoreHeader";
import StoreInfo from "@/components/store/StoreInfo";
import { CategoryImage } from "@/types/categoryImage";
import { Skeleton } from "@/components/ui/skeleton";

// تحميل المكونات الثقيلة بشكل بطئ
const ProductGrid = lazy(() => import("@/components/store/ProductGrid"));
const CategoryGrid = lazy(() => import("@/components/store/CategoryGrid"));

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
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  // معالجة صور التصنيفات للتأكد من استخدام أحدث روابط الصور
  useEffect(() => {
    if (categoryImages && categoryImages.length > 0) {
      console.log("StoreProductsDisplay: معالجة صور التصنيفات...", categoryImages.length);
      
      // إضافة طابع زمني جديد للتأكد من عدم استخدام الصور المخزنة مؤقتًا
      const timestamp = Date.now();
      const processed = categoryImages.map(img => {
        if (!img.image_url) return img;
        
        const baseUrl = img.image_url.split('?')[0];
        
        // تحسين URL الصورة لاستخدام WebP إذا كان متاحًا
        if (baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')) {
          return {
            ...img,
            image_url: `${baseUrl}?format=webp&quality=80&t=${timestamp}`
          };
        }
        
        // إضافة طابع زمني فقط
        return {
          ...img,
          image_url: `${baseUrl}?t=${timestamp}`
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

  // تحميل المنتجات بالتدريج كلما نزل المستخدم للأسفل
  useEffect(() => {
    setPage(1);
    setVisibleProducts(filteredProducts.slice(0, PRODUCTS_PER_PAGE));
  }, [filteredProducts]);

  // مراقبة التمرير لتحميل المزيد من المنتجات
  useEffect(() => {
    const handleScroll = () => {
      // إذا كان المستخدم قريبًا من أسفل الصفحة ولدينا المزيد من المنتجات للتحميل
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 500 &&
        visibleProducts.length < filteredProducts.length
      ) {
        const nextPage = page + 1;
        const nextProducts = filteredProducts.slice(0, nextPage * PRODUCTS_PER_PAGE);
        setVisibleProducts(nextProducts);
        setPage(nextPage);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, visibleProducts.length, filteredProducts]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setPage(1); // إعادة ضبط الصفحة عند تغيير الفئة
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery("");
    setPage(1); // إعادة ضبط الصفحة عند العودة
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
        products={products}
      />

      {!selectedCategory && categories.length > 0 && !searchQuery && (
        <Suspense fallback={<div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>}>
          <CategoryGrid 
            categories={categories} 
            onCategorySelect={handleCategorySelect} 
            fontSettings={fontSettings}
            categoryImages={processedCategoryImages}
          />
        </Suspense>
      )}

      {(selectedCategory || searchQuery || categories.length === 0) && (
        <>
          {filteredProducts.length > 0 ? (
            <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>}>
              <ProductGrid
                products={visibleProducts}
                colorTheme={colorTheme}
              />
              {visibleProducts.length < filteredProducts.length && (
                <div className="flex justify-center my-8">
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              )}
            </Suspense>
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
