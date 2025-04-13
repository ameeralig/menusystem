
import { Search, SparklesIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  categories: string[];
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  products?: any[]; // يمكن استخدام نوع Product هنا
}

export const ProductFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  viewMode,
  setViewMode,
  products = [],
}: ProductFiltersProps) => {
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState("");

  const toggleAiSearch = () => {
    setAiSearchOpen(!aiSearchOpen);
    if (!aiSearchOpen) {
      setAiQuery(searchQuery); // نقل النص الحالي إلى البحث الذكي
    }
  };

  const handleAiSearch = async (value: string) => {
    if (!value.trim()) return;
    
    setIsLoading(true);
    setAiQuery(value);
    
    try {
      // هنا نقوم بالبحث في المنتجات المتاحة بناءً على الاستعلام
      const results = products.filter(product => 
        product.name.toLowerCase().includes(value.toLowerCase()) || 
        (product.description && product.description.toLowerCase().includes(value.toLowerCase()))
      );
      
      // إذا كانت النتائج قليلة، نحاول الحصول على اقتراحات من الذكاء الاصطناعي
      if (results.length < 3 && products.length > 0) {
        // محاكاة استجابة الذكاء الاصطناعي (في الإصدار الحقيقي، سيتم استبدالها بالاتصال بـ API)
        const suggestedProducts = products
          .filter(p => !results.includes(p))
          .slice(0, 3);
          
        setAiResults([...results, ...suggestedProducts]);
      } else {
        setAiResults(results);
      }
    } catch (error) {
      console.error("خطأ في البحث الذكي:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-4 shadow-sm">
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن طبق..."
            className="w-full pl-10 pr-10 py-2 text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-1 top-1 p-1 h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            onClick={toggleAiSearch}
            title="بحث ذكي (Ctrl+K)"
          >
            <SparklesIcon className="h-4 w-4 text-blue-500" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !selectedCategory
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            الكل
          </motion.button>
          {categories.map((category) => (
            category && (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {category}
              </motion.button>
            )
          ))}
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            شبكة
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            قائمة
          </Button>
        </div>
      </div>

      <CommandDialog open={aiSearchOpen} onOpenChange={setAiSearchOpen}>
        <CommandInput 
          placeholder="ماذا تريد أن تأكل اليوم؟" 
          value={aiQuery}
          onValueChange={(value) => {
            setAiQuery(value);
            handleAiSearch(value);
          }}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              <p className="py-6 text-center text-sm">جارٍ البحث...</p>
            ) : (
              <p className="py-6 text-center text-sm">لا توجد نتائج. جرّب كلمات أخرى.</p>
            )}
          </CommandEmpty>
          {aiResults.length > 0 && (
            <CommandGroup heading="نتائج البحث">
              {aiResults.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => {
                    setSearchQuery(product.name);
                    setAiSearchOpen(false);
                  }}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center">
                    <span>{product.name}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {product.price ? `${product.price} د.ع` : ''}
                    </span>
                  </div>
                  {product.category && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
};
