
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductGrid from "./ProductGrid";
import CategoryGrid from "./CategoryGrid";
import StoreInfo from "./StoreInfo";
import BackButton from "./BackButton";
import AdvancedSearchBar from "./AdvancedSearchBar";
import EmptyCategoryMessage from "./EmptyCategoryMessage";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { useGlobalSearch } from "./hooks/useGlobalSearch";

interface FontSettings {
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
}

interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

interface StoreProductsDisplayProps {
  products: Product[];
  storeName: string;
  colorTheme: string;
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
  categoryImages = [],
}: StoreProductsDisplayProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { categories } = useGlobalSearch(products);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // تطبيق فلتر التصنيف
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // تطبيق فلتر البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

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

  return (
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
        <h1 
          className="text-4xl font-bold text-gray-900 dark:text-white"
          style={{
            fontFamily: fontSettings?.storeName?.family || 'inherit'
          }}
        >
          {storeName}
        </h1>
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
          products={products}
        />
      </motion.div>

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
              <CategoryGrid 
                categories={categories}
                onCategorySelect={handleCategorySelect}
                fontSettings={fontSettings}
                categoryImages={categoryImages}
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
              {filteredProducts.length > 0 ? (
                <ProductGrid 
                  products={filteredProducts}
                  colorTheme={colorTheme}
                />
              ) : (
                <EmptyCategoryMessage 
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default StoreProductsDisplay;
