import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface UseOptimizedProductsProps {
  userId: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  forceRefresh: number;
}

export const useOptimizedProducts = ({ 
  userId, 
  selectedCategory, 
  searchQuery, 
  forceRefresh 
}: UseOptimizedProductsProps) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const PRODUCTS_PER_PAGE = 15; // عدد أقل لتحميل أسرع

  // تحميل جميع المنتجات مرة واحدة مع التحسين
  const fetchAllProducts = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // استعلام محسن مع فهرسة وترتيب
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب المنتجات:', error);
        return;
      }

      // تحسين روابط الصور مسبقاً
      const optimizedProducts = data.map(product => ({
        ...product,
        image_url: product.image_url ? optimizeImageUrl(product.image_url) : null
      }));

      setAllProducts(optimizedProducts);
      console.log(`تم تحميل ${optimizedProducts.length} منتج بنجاح`);
      
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتجات:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, forceRefresh]);

  // تحسين رابط الصورة
  const optimizeImageUrl = (url: string): string => {
    if (!url) return url;
    
    const baseUrl = url.split('?')[0];
    if (baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')) {
      return `${baseUrl}?format=webp&quality=85&width=400`;
    }
    return url;
  };

  // تصفية المنتجات بكفاءة عالية
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // فلتر التصنيف
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    // فلتر البحث مع تحسين
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const categoryMatch = product.category?.toLowerCase().includes(query);
        return nameMatch || descMatch || categoryMatch;
      });
    }

    return filtered;
  }, [allProducts, selectedCategory, searchQuery]);

  // إدارة المنتجات المرئية بالتدريج
  useEffect(() => {
    // إعادة تعيين الصفحة والمنتجات المرئية عند تغيير التصفية
    setPage(1);
    const initialProducts = filteredProducts.slice(0, PRODUCTS_PER_PAGE);
    setVisibleProducts(initialProducts);
    setHasMore(filteredProducts.length > PRODUCTS_PER_PAGE);
  }, [filteredProducts, PRODUCTS_PER_PAGE]);

  // تحميل المزيد من المنتجات
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;

    const nextPage = page + 1;
    const startIndex = page * PRODUCTS_PER_PAGE;
    const endIndex = nextPage * PRODUCTS_PER_PAGE;
    const newProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setVisibleProducts(prev => [...prev, ...newProducts]);
      setPage(nextPage);
      setHasMore(endIndex < filteredProducts.length);
    } else {
      setHasMore(false);
    }
  }, [page, filteredProducts, hasMore, isLoading, PRODUCTS_PER_PAGE]);

  // تحميل المنتجات عند التهيئة أو التحديث
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // استخراج جميع التصنيفات من كل المنتجات
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    allProducts.forEach(product => {
      if (product.category && product.category.trim()) {
        categories.add(product.category.trim());
      }
    });
    return Array.from(categories).sort();
  }, [allProducts]);

  return {
    products: visibleProducts,
    allProducts: allProducts,
    allProductsCount: filteredProducts.length,
    categories: allCategories,
    isLoading,
    hasMore,
    loadMore,
    refresh: fetchAllProducts
  };
};