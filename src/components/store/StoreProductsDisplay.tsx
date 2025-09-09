import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import OptimizedProductGrid from "./OptimizedProductGrid";
import ProgressiveCategoryGrid from "./ProgressiveCategoryGrid";
import StoreInfo from "./StoreInfo";
import ProgressiveLoadingIndicator from "./ProgressiveLoadingIndicator";
import BackButton from "./BackButton";
import AdvancedSearchBar from "./AdvancedSearchBar";
import EmptyCategoryMessage from "./EmptyCategoryMessage";
import WheelButton from "./WheelButton";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import AnimatedStoreHeader from "./AnimatedStoreHeader";
import { useGlobalSearch } from "./hooks/useGlobalSearch";
import { useOptimizedProducts } from "@/hooks/store/useOptimizedProducts";

import { FontSettings, ContactInfo } from "@/types/store";

interface StoreProductsDisplayProps {
  storeName: string;
  colorTheme: string;
  fontSettings?: FontSettings;
  contactInfo?: ContactInfo;
  categoryImages?: CategoryImage[];
  slug?: string;
  storeOwnerId?: string;
  forceRefresh?: number;
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
}: StoreProductsDisplayProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customFontFamily, setCustomFontFamily] = useState<string>("");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // استخدام المنتجات المحسنة
  const { 
    products, 
    allProducts,
    allProductsCount, 
    categories,
    isLoading,
    loadingProgress,
    hasMore, 
    loadMore 
  } = useOptimizedProducts({
    userId: storeOwnerId || null,
    selectedCategory,
    searchQuery,
    forceRefresh
  });

  // تحميل الخط المخصص لاسم المتجر
  useEffect(() => {
    if (fontSettings?.storeName?.isCustom && fontSettings?.storeName?.customFontUrl) {
      const fontId = `custom-store-font-${Date.now()}`;
      
      try {
        const fontFace = new FontFace(fontId, `url(${fontSettings.storeName.customFontUrl})`);
        
        fontFace.load().then((loadedFont) => {
          document.fonts.add(loadedFont);
          setCustomFontFamily(fontId);
          console.log("تم تحميل خط اسم المتجر بنجاح:", fontId);
        }).catch(err => {
          console.error("خطأ في تحميل خط اسم المتجر:", err);
          setCustomFontFamily("");
        });
      } catch (error) {
        console.error("خطأ في إنشاء FontFace:", error);
        setCustomFontFamily("");
      }
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

  return (
    <>
      {/* مؤشر التحميل التقدمي */}
      <ProgressiveLoadingIndicator 
        progress={loadingProgress} 
        isVisible={isLoading && products.length === 0} 
      />

      <motion.div
        className="container mx-auto px-4 py-8 max-w-6xl relative"
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
        <AnimatedStoreHeader
          storeName={storeName}
          colorTheme={colorTheme}
          fontSettings={fontSettings}
        />
      </motion.div>

      {/* معلومات المتجر */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <StoreInfo 
          contactInfo={contactInfo}
          colorTheme={colorTheme}
        />
      </motion.div>

      {/* شريط البحث المتقدم */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <AdvancedSearchBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          products={allProducts || products}
        />
        
        {/* مؤشر التحميل العام */}
        {isLoading && products.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">جاري تحميل المنتجات...</span>
          </div>
        )}
      </motion.div>

      {/* زر عجلة الحظ */}
      {slug && !searchQuery.trim() && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex justify-center mt-6"
        >
          <WheelButton slug={slug} colorTheme={colorTheme} />
        </motion.div>
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
                categories={categories}
                onCategorySelect={handleCategorySelect}
                fontSettings={fontSettings}
                categoryImages={categoryImages}
                isLoading={isLoading && categories.length === 0}
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
                          تم العثور على {allProductsCount} نتيجة {products.length < allProductsCount ? `(عرض ${products.length})` : ''}
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

              {products.length > 0 ? (
                <>
                  <OptimizedProductGrid 
                    products={products}
                    colorTheme={colorTheme}
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
                  {!hasMore && !isLoading && products.length > 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تم عرض جميع المنتجات ({allProductsCount} منتج)
                      </p>
                    </div>
                  )}
                </>
              ) : !isLoading ? (
                <EmptyCategoryMessage 
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </motion.div>
    </>
  );
};

export default StoreProductsDisplay;
