import React, { useState, useCallback, useMemo } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductSelect: (product: Product) => void;
  colorTheme?: string | null;
}

const SearchDrawer: React.FC<SearchDrawerProps> = ({
  isOpen,
  onClose,
  products,
  onProductSelect,
  colorTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // دالة لقياس تشابه النصوص
  const fuzzysort = (text: string, query: string): number => {
    if (!text || !query) return 0;
    
    text = text.toLowerCase();
    query = query.toLowerCase();
    
    if (text === query) return 1;
    if (text.includes(query)) {
      return 0.9 * (query.length / text.length);
    }
    
    const textWords = text.split(/\s+/);
    const queryWords = query.split(/\s+/);
    
    let matchScore = 0;
    for (const queryWord of queryWords) {
      for (const textWord of textWords) {
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
          matchScore += 0.5 * Math.min(textWord.length, queryWord.length) / Math.max(textWord.length, queryWord.length);
        }
      }
    }
    
    return matchScore;
  };

  // تصفية المنتجات حسب البحث
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results = products.map(product => {
      const nameMatch = fuzzysort(product.name, searchQuery);
      const descMatch = product.description ? fuzzysort(product.description, searchQuery) : 0;
      const categoryMatch = product.category ? fuzzysort(product.category, searchQuery) : 0;
      
      const matchScore = Math.max(nameMatch, descMatch, categoryMatch);
      
      return {
        ...product,
        score: matchScore
      };
    })
    .filter(item => item.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

    return results;
  }, [products, searchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleProductClick = useCallback((product: Product) => {
    onProductSelect(product);
    onClose();
    setSearchQuery("");
  }, [onProductSelect, onClose]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
      setSearchQuery("");
    }
  }, [onClose]);

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    
    const themeColors: { [key: string]: string } = {
      coral: '#fb923c',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
    };
    
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle className="text-right text-xl font-bold flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
            <span>البحث في المنتجات</span>
            <Search className="h-5 w-5" style={{ color: getThemeColor() }} />
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* شريط البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pr-10 pl-10 h-12 text-lg rounded-xl"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* نتائج البحث */}
          <ScrollArea className="h-[50vh]">
            <AnimatePresence mode="wait">
              {!searchQuery.trim() ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    ابدأ بالكتابة للبحث عن منتج
                  </p>
                </motion.div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Search className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    لم يتم العثور على نتائج
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    جرب البحث بكلمات مختلفة
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {filteredProducts.map((product, index) => (
                    <motion.button
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleProductClick(product)}
                      className="w-full p-4 rounded-xl border bg-card hover:bg-accent transition-all duration-200 text-right"
                      style={{
                        borderColor: `${getThemeColor()}20`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {product.image_url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {product.name}
                          </h3>
                          {product.category && (
                            <p className="text-sm text-muted-foreground">
                              {product.category}
                            </p>
                          )}
                          <p 
                            className="text-lg font-bold mt-1"
                            style={{ color: getThemeColor() }}
                          >
                            {product.price} د.ل
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDrawer;
