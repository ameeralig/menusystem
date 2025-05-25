
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Sparkles, Shuffle, X, ArrowRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AdvancedSearchBarProps {
  query?: string;
  searchQuery?: string;
  onQueryChange?: (query: string) => void;
  setSearchQuery?: (query: string) => void;
  onToggleSearch?: () => void;
  showSearch?: boolean;
  products?: Product[];
}

const AdvancedSearchBar = ({ 
  query,
  searchQuery, 
  onQueryChange,
  setSearchQuery,
  onToggleSearch,
  showSearch,
  products = [],
}: AdvancedSearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentQuery = query || searchQuery || "";
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onQueryChange) onQueryChange(value);
    if (setSearchQuery) setSearchQuery(value);
    setSearchTerm(value);
  };

  // دالة البحث المتقدمة
  const performAdvancedSearch = useCallback((value: string) => {
    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const searchResults = products.map(product => {
        const nameMatch = product.name.toLowerCase().includes(value.toLowerCase()) ? 1 : 0;
        const descMatch = product.description?.toLowerCase().includes(value.toLowerCase()) ? 0.8 : 0;
        const categoryMatch = product.category?.toLowerCase().includes(value.toLowerCase()) ? 0.6 : 0;
        
        const score = Math.max(nameMatch, descMatch, categoryMatch);
        
        return {
          ...product,
          score
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
      
      setResults(searchResults);
      setShowResults(searchResults.length > 0);
    } catch (error) {
      console.error("خطأ في البحث:", error);
    } finally {
      setIsLoading(false);
    }
  }, [products]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performAdvancedSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, performAdvancedSearch]);

  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  };

  const handleCollapse = () => {
    if (!searchTerm) {
      setIsExpanded(false);
      setIsFocused(false);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (onQueryChange) onQueryChange("");
    if (setSearchQuery) setSearchQuery("");
    setResults([]);
    setShowResults(false);
    handleCollapse();
  };

  const selectProduct = (product: Product) => {
    if (onQueryChange) onQueryChange(product.name);
    if (setSearchQuery) setSearchQuery(product.name);
    setSearchTerm(product.name);
    setShowResults(false);
    setIsExpanded(false);
  };

  const suggestRandomItem = () => {
    if (products.length === 0) {
      toast.error("لا توجد منتجات متاحة");
      return;
    }
    
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    selectProduct(randomProduct);
    toast.success(`اقتراح: ${randomProduct.name}`, {
      description: randomProduct.category ? `من قسم ${randomProduct.category}` : ""
    });
  };

  return (
    <div className="relative max-w-2xl mx-auto mb-8">
      {/* الحاوية الرئيسية */}
      <motion.div 
        className="relative"
        animate={{
          scale: isExpanded ? 1.02 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* الخلفية المتحركة */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1.05 : 1,
          }}
          transition={{ duration: 0.4 }}
        />
        
        {/* شريط البحث */}
        <motion.div
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
          animate={{
            borderColor: isFocused ? "#3b82f6" : "#e5e7eb",
            boxShadow: isFocused 
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center p-1">
            {/* أيقونة البحث المتحركة */}
            <motion.div
              className="flex items-center justify-center w-12 h-12 mr-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{
                  rotate: isLoading ? 360 : 0,
                }}
                transition={{
                  duration: 1,
                  repeat: isLoading ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <Search className="w-5 h-5 text-blue-500" />
              </motion.div>
            </motion.div>

            {/* حقل الإدخال */}
            <motion.div
              className="flex-1"
              animate={{
                opacity: isExpanded ? 1 : 0.7
              }}
            >
              <Input
                ref={inputRef}
                type="text"
                placeholder="ابحث عن أي طبق تريده..."
                className="border-0 bg-transparent text-lg placeholder:text-gray-400 focus-visible:ring-0 text-right pr-0"
                value={currentQuery}
                onChange={handleInputChange}
                onFocus={() => {
                  setIsFocused(true);
                  handleExpand();
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setIsFocused(false);
                    if (!showResults) {
                      handleCollapse();
                    }
                  }, 200);
                }}
              />
            </motion.div>

            {/* الأزرار الجانبية */}
            <div className="flex items-center gap-1">
              <AnimatePresence>
                {searchTerm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      onClick={clearSearch}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                  onClick={suggestRandomItem}
                  title="اقتراح عشوائي"
                >
                  <Shuffle className="h-4 w-4 text-purple-500" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
                  title="بحث ذكي"
                >
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* شريط التقدم للتحميل */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                exit={{ width: "0%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* نتائج البحث */}
        <AnimatePresence>
          {showResults && results.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    نتائج البحث ({results.length})
                  </h3>
                </div>
                
                {results.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                    onClick={() => selectProduct(product)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {product.name}
                          </h4>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {product.category && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                              {product.category}
                            </span>
                          )}
                          {product.price && (
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {product.price} د.ع
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* رسالة عدم وجود نتائج */}
      <AnimatePresence>
        {showResults && results.length === 0 && searchTerm && !isLoading && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              لم يتم العثور على نتائج لـ "{searchTerm}"
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={suggestRandomItem}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              جرب اقتراح عشوائي
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearchBar;
