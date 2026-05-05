import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import OptimizedProductGrid from "./OptimizedProductGrid";
import ProgressiveCategoryGrid from "./ProgressiveCategoryGrid";
import BackButton from "./BackButton";
import EmptyCategoryMessage from "./EmptyCategoryMessage";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import AnimatedStoreHeader from "./AnimatedStoreHeader";
import InlineStoreNameEditor from "./inline-edit/InlineStoreNameEditor";
import InlineContactInfoEditor from "./inline-edit/InlineContactInfoEditor";
import StoreInfo from "./StoreInfo";
// ملاحظة: المنتجات تُمرر للمكون جاهزة من useOptimizedStoreData لتجنب جلبها مرتين
import { sortCategoriesByOrder } from "@/utils/categorySort";
import { FontSettings, ContactInfo } from "@/types/store";
import FastResponseTemplate from "./fast-template/FastResponseTemplate";
import TextOnlyTemplate from "./text-template/TextOnlyTemplate";
import A2004Template from "./a2004-template/A2004Template";
import BottomActionsBar from "./fast-template/BottomActionsBar";

interface StoreProductsDisplayProps {
  storeName: string;
  colorTheme: string;
  fontSettings?: FontSettings;
  contactInfo?: ContactInfo;
  categoryImages?: CategoryImage[];
  slug?: string;
  storeOwnerId?: string;
  forceRefresh?: number;
  isEmployeeView?: boolean;
  template?: string;
  socialLinks?: any;
  isStoreOwner?: boolean;
  refreshData?: () => void;
  /** قائمة المنتجات كاملة (مجلوبة مسبقاً من useOptimizedStoreData) */
  products?: Product[];
  /** حالة تحميل المنتجات (لإظهار skeleton مرة واحدة فقط) */
  productsLoading?: boolean;
  /** رابط شعار المتجر */
  logoUrl?: string | null;
}

const StoreProductsDisplay = ({
  storeName,
  colorTheme,
  fontSettings,
  contactInfo,
  categoryImages = [],
  slug,
  storeOwnerId,
  forceRefresh = 0,
  isEmployeeView = false,
  template = "fast-response",
  socialLinks,
  isStoreOwner = false,
  refreshData,
  products: productsData = [],
  productsLoading = false,
  logoUrl,
}: StoreProductsDisplayProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customFontFamily, setCustomFontFamily] = useState<string>("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // المنتجات (مجلوبة مرة واحدة من useOptimizedStoreData)
  const allProducts = productsData;
  const isLoading = productsLoading;

  // Paginated visible products + infinite scroll
  const PRODUCTS_PER_PAGE = 50;
  const [page, setPage] = useState(1);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // استخراج التصنيفات من جميع المنتجات (بدون ترتيب أبجدي)
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [allProducts]);

  // تصفية المنتجات حسب التصنيف/البحث (نفس منطق useOptimizedProducts)
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        const categoryMatch = p.category?.toLowerCase().includes(query);
        return nameMatch || descMatch || categoryMatch;
      });
    }

    return filtered;
  }, [allProducts, selectedCategory, searchQuery]);

  const allProductsCount = filteredProducts.length;

  useEffect(() => {
    setPage(1);
    const initial = filteredProducts.slice(0, PRODUCTS_PER_PAGE);
    setVisibleProducts(initial);
    setHasMore(filteredProducts.length > PRODUCTS_PER_PAGE);
  }, [filteredProducts]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;

    const nextPage = page + 1;
    const startIndex = page * PRODUCTS_PER_PAGE;
    const endIndex = nextPage * PRODUCTS_PER_PAGE;
    const newProducts = filteredProducts.slice(startIndex, endIndex);

    if (newProducts.length > 0) {
      setVisibleProducts((prev) => [...prev, ...newProducts]);
      setPage(nextPage);
      setHasMore(endIndex < filteredProducts.length);
    } else {
      setHasMore(false);
    }
  }, [hasMore, isLoading, page, filteredProducts]);


  // تحميل محسّن للخط المخصص مع preload
  useEffect(() => {
    if (fontSettings?.storeName?.isCustom && fontSettings?.storeName?.customFontUrl) {
      const fontId = `custom-store-font-${Date.now()}`;
      const fontUrl = fontSettings.storeName.customFontUrl;
      
      // إضافة preload للخط
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'font';
      preloadLink.href = fontUrl;
      preloadLink.crossOrigin = 'anonymous';
      document.head.appendChild(preloadLink);
      
      try {
        // تحميل الخط بشكل async
        const fontFace = new FontFace(fontId, `url(${fontUrl})`, {
          display: 'swap' // استخدام fallback font أثناء التحميل
        });
        
        fontFace.load().then((loadedFont) => {
          document.fonts.add(loadedFont);
          setCustomFontFamily(fontId);
        }).catch(err => {
          console.error("خطأ في تحميل خط اسم المتجر:", err);
          setCustomFontFamily("");
        });
      } catch (error) {
        console.error("خطأ في إنشاء FontFace:", error);
        setCustomFontFamily("");
      }
      
      return () => {
        preloadLink.remove();
      };
    } else {
      setCustomFontFamily("");
    }
  }, [fontSettings?.storeName?.customFontUrl, fontSettings?.storeName?.isCustom]);

  // دالة للحصول على ألوان الثيم لاسم المتجر
  const getThemeColors = (theme: string) => {
    // إذا كان اللون مخصص (يبدأ بـ #)
    if (theme && theme.startsWith('#')) {
      return { color: theme };
    }
    
    // الألوان المحددة مسبقاً
    switch (theme) {
      case 'coral':
        return 'text-[#ff9178] dark:text-[#ffbcad]';
      case 'purple':
        return 'text-purple-600 dark:text-purple-400';
      case 'blue':
        return 'text-blue-600 dark:text-blue-400';
      case 'green':
        return 'text-green-600 dark:text-green-400';
      case 'pink':
        return 'text-pink-600 dark:text-pink-400';
      case 'teal':
        return 'text-teal-600 dark:text-teal-400';
      case 'amber':
        return 'text-amber-600 dark:text-amber-400';
      case 'indigo':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'rose':
        return 'text-rose-600 dark:text-rose-400';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  // دالة للحصول على نمط الخط واللون
  const getStoreNameStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    
    if (fontSettings?.storeName?.isCustom && customFontFamily) {
      style.fontFamily = `"${customFontFamily}", sans-serif`;
    } else if (fontSettings?.storeName?.family && fontSettings?.storeName?.family !== 'inherit') {
      style.fontFamily = fontSettings.storeName.family;
    }
    
    // تطبيق اللون المخصص إذا كان موجوداً
    if (colorTheme && colorTheme.startsWith('#')) {
      style.color = colorTheme;
    }
    
    return style;
  };

  // مراقب التقاطع لتحميل المزيد من المنتجات
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery(""); // مسح البحث عند اختيار تصنيف
  }, []);

  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery(""); // مسح البحث عند الرجوع للتصنيفات
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSelectedCategory(null); // إلغاء التصنيف المحدد عند البحث
    }
  }, []);

  const showCategories = !selectedCategory && !searchQuery.trim();
  const showProducts = selectedCategory || searchQuery.trim();

  const themeColors = getThemeColors(colorTheme);
  const isCustomColor = colorTheme && colorTheme.startsWith('#');

  // ترتيب التصنيفات باستخدام الدالة الموحدة
  const sortedCategories = sortCategoriesByOrder(categories, categoryImages);

  // القالب النصي (بدون صور)
  if (template === "text-only") {
    return (
      <TextOnlyTemplate
        products={allProducts}
        colorTheme={colorTheme}
        storeName={storeName}
        onSearchChange={handleSearchChange}
        contactInfo={contactInfo}
        slug={slug}
        storeOwnerId={storeOwnerId}
        fontSettings={fontSettings}
        socialLinks={socialLinks}
        categoryImages={categoryImages}
        isStoreOwner={isStoreOwner}
        refreshData={refreshData}
        isLoading={isLoading && allProducts.length === 0}
        logoUrl={logoUrl}
        isEmployeeView={isEmployeeView}
      />
    );
  }

  // إذا كان القالب هو "fast-response"، نعرض القالب السريع
  if (template === "fast-response") {
    return (
      <FastResponseTemplate
        products={allProducts}
        colorTheme={colorTheme}
        storeName={storeName}
        onSearchChange={handleSearchChange}
        contactInfo={contactInfo}
        slug={slug}
        storeOwnerId={storeOwnerId}
        fontSettings={fontSettings}
        socialLinks={socialLinks}
        categoryImages={categoryImages}
        isStoreOwner={isStoreOwner}
        refreshData={refreshData}
        isLoading={isLoading && allProducts.length === 0}
        logoUrl={logoUrl}
        isEmployeeView={isEmployeeView}
      />
    );
  }

  return (
    <>
      <motion.div
        className="container mx-auto px-4 py-8 pb-28 max-w-6xl relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
      {/* عنوان المتجر */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-6"
      >
        {isStoreOwner ? (
          <InlineStoreNameEditor
            storeName={storeName}
            colorTheme={colorTheme}
            fontSettings={fontSettings}
            storeOwnerId={storeOwnerId!}
            onUpdate={refreshData || (() => {})}
          />
        ) : (
          <AnimatedStoreHeader
            storeName={storeName}
            colorTheme={colorTheme}
            fontSettings={fontSettings}
          />
        )}
      </motion.div>

      {/* معلومات المتجر */}
      {isStoreOwner ? (
        <InlineContactInfoEditor
          contactInfo={contactInfo}
          colorTheme={colorTheme}
          storeOwnerId={storeOwnerId!}
          onUpdate={refreshData || (() => {})}
          storeName={storeName}
          products={allProducts}
        />
      ) : (
        <StoreInfo
          contactInfo={contactInfo}
          colorTheme={colorTheme}
          storeName={storeName}
          products={allProducts}
        />
      )}

      {/* زر الرجوع */}
      <AnimatePresence>
        {showProducts && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <BackButton onClick={handleBackToCategories} colorTheme={colorTheme} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* المحتوى الرئيسي */}
      <motion.div
        className="mt-8"
        layout
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {showCategories && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ProgressiveCategoryGrid 
                categories={sortedCategories}
                onCategorySelect={handleCategorySelect}
                fontSettings={fontSettings}
                categoryImages={categoryImages}
                isLoading={isLoading && categories.length === 0}
                isStoreOwner={isStoreOwner}
                storeOwnerId={storeOwnerId}
                refreshData={refreshData}
              />
            </motion.div>
          )}

          {showProducts && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* نتائج البحث */}
              {searchQuery.trim() && (
                <motion.div
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </motion.div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                          نتائج البحث عن: "{searchQuery}"
                        </h3>
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          تم العثور على {allProductsCount} نتيجة {visibleProducts.length < allProductsCount ? `(عرض ${visibleProducts.length})` : ''}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      className="text-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      🔍
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {isLoading && allProducts.length === 0 ? (
                /* Skeleton أثناء التحميل */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-card rounded-xl overflow-hidden shadow-sm animate-pulse">
                      <div className="aspect-square bg-muted" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : visibleProducts.length > 0 ? (
                <>
                  <OptimizedProductGrid 
                    products={visibleProducts}
                    colorTheme={colorTheme}
                    isEmployeeView={isEmployeeView}
                  />
                  
                  {/* عنصر مراقبة لتحميل المزيد */}
                  <div ref={loadMoreRef} className="h-10">
                    {isLoading && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">جاري التحميل...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* مؤشر نهاية المنتجات */}
                  {!hasMore && !isLoading && visibleProducts.length > 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تم عرض جميع المنتجات ({allProductsCount} منتج)
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </motion.div>

      {/* شريط الإجراءات السفلي */}
      <BottomActionsBar
        slug={slug}
        storeOwnerId={storeOwnerId}
        colorTheme={colorTheme}
        socialLinks={socialLinks}
        contactInfo={contactInfo}
        searchQuery={searchQuery}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        onClearSearch={() => handleSearchChange("")}
        isStoreOwner={isStoreOwner}
      />
    </>
  );
};

export default StoreProductsDisplay;
