
import { useMemo } from "react";
import { Product } from "@/types/product";

export const useGlobalSearch = (products: Product[]) => {
  // استخراج جميع التصنيفات الفريدة من المنتجات
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet);
  }, [products]);

  return { categories };
};
