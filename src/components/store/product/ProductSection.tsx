
import React, { Suspense } from "react";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyCategoryMessage from "@/components/store/EmptyCategoryMessage";

// تحميل بطئ لمكون شبكة المنتجات
const ProductGrid = React.lazy(() => import("@/components/store/ProductGrid"));

interface ProductSectionProps {
  products: Product[];
  filteredProducts: Product[];
  colorTheme: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  onLoadMore: () => void;
  hasMore: boolean;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  filteredProducts,
  colorTheme,
  searchQuery,
  selectedCategory,
  onLoadMore,
  hasMore
}) => {
  // التحقق من وجود منتجات لعرضها
  if (filteredProducts.length === 0) {
    return (
      <EmptyCategoryMessage
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />
    );
  }

  return (
    <>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductGrid
          products={filteredProducts}
          colorTheme={colorTheme}
        />
      </Suspense>
      
      {/* زر تحميل المزيد من المنتجات */}
      {hasMore && (
        <div className="flex justify-center my-8">
          <button 
            onClick={onLoadMore} 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            تحميل المزيد
          </button>
        </div>
      )}
    </>
  );
};

// هيكل تحميل للمنتجات
const ProductSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-xl" />
      ))}
    </div>
  );
};

export default ProductSection;
