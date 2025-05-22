
import { useState, useEffect, useMemo } from "react";
import { Product } from "@/types/product";

export const useProductLoading = (
  products: Product[], 
  selectedCategory: string | null, 
  searchQuery: string
) => {
  const [page, setPage] = useState(1);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const PRODUCTS_PER_PAGE = 12;

  // تصفية المنتجات حسب التصنيف والبحث
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

  // تحديث المنتجات الظاهرة عند تغيير المنتجات المصفاة
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
        loadMoreProducts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleProducts, filteredProducts]);

  const loadMoreProducts = () => {
    if (visibleProducts.length < filteredProducts.length) {
      const nextPage = page + 1;
      const nextProducts = filteredProducts.slice(0, nextPage * PRODUCTS_PER_PAGE);
      setVisibleProducts(nextProducts);
      setPage(nextPage);
    }
  };

  return {
    visibleProducts,
    filteredProducts,
    hasMoreProducts: visibleProducts.length < filteredProducts.length,
    loadMoreProducts
  };
};
