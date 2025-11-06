import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { useStoreCache } from "./useStoreCache";

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
  const { getCachedData, setCachedData, isCached } = useStoreCache();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const PRODUCTS_PER_PAGE = 50; // عدد كافي لعرض جميع منتجات التصنيف

  // تحميل جميع المنتجات مرة واحدة مع التحسين والتقدم المئوي
  const fetchAllProducts = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setLoadingProgress(100);
      return;
    }

    // التحقق من وجود بيانات محفوظة في الـ cache
    const cacheKey = `products_${userId}`;
    if (isCached(cacheKey) && forceRefresh === 0) {
      const cachedProducts = getCachedData(cacheKey);
      if (cachedProducts) {
        setAllProducts(cachedProducts);
        setLoadingProgress(100);
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setLoadingProgress(0);
      
      // مرحلة 1: جلب المنتجات (30%)
      setLoadingProgress(10);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب المنتجات:', error);
        setLoadingProgress(0);
        return;
      }

      setLoadingProgress(50);

      // مرحلة 2: تحسين روابط الصور مع تقدم تدريجي (50% - 90%)
      const optimizedProducts: Product[] = [];
      const totalProducts = data.length;
      
      for (let i = 0; i < data.length; i++) {
        const product = data[i];
        optimizedProducts.push({
          ...product,
          image_url: product.image_url ? optimizeImageUrl(product.image_url) : null
        });
        
        // تحديث التقدم
        const progress = 50 + ((i + 1) / totalProducts) * 40;
        setLoadingProgress(Math.round(progress));
        
        // إضافة تأخير صغير لإظهار التقدم
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // مرحلة 3: الانتهاء (100%)
      setLoadingProgress(100);
      setAllProducts(optimizedProducts);
      
      // حفظ البيانات في الـ cache لمدة 15 دقيقة
      setCachedData(cacheKey, optimizedProducts, 15 * 60 * 1000);
      
      // تأخير قصير لإظهار 100% ثم إخفاء التحميل
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
      
    } catch (error) {
      console.error('خطأ غير متوقع في جلب المنتجات:', error);
      setLoadingProgress(0);
      setIsLoading(false);
    }
  }, [userId, forceRefresh]);

  // تحسين رابط الصورة مع الاحتفاظ بالكاش
  const optimizeImageUrl = (url: string): string => {
    if (!url) return url;
    
    const baseUrl = url.split('?')[0];
    
    // إضافة timestamp فقط عند forceRefresh (تحديث يدوي)
    if (baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')) {
      if (forceRefresh && forceRefresh > 0) {
        // عند التحديث اليدوي نضيف timestamp
        return `${baseUrl}?format=webp&quality=85&width=400&t=${forceRefresh}`;
      } else {
        // في الحالات العادية رابط ثابت للاستفادة من الكاش
        return `${baseUrl}?format=webp&quality=85&width=400`;
      }
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

  // استخراج جميع التصنيفات من كل المنتجات (بدون ترتيب أبجدي)
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    allProducts.forEach(product => {
      if (product.category && product.category.trim()) {
        categories.add(product.category.trim());
      }
    });
    // إرجاع التصنيفات بدون ترتيب أبجدي - سيتم ترتيبها حسب display_order في المكون
    return Array.from(categories);
  }, [allProducts]);

  return {
    products: visibleProducts,
    allProducts: allProducts,
    allProductsCount: filteredProducts.length,
    categories: allCategories,
    isLoading,
    loadingProgress,
    hasMore,
    loadMore,
    refresh: fetchAllProducts
  };
};