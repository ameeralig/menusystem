
import { Search, SparklesIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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

  // دالة مساعدة لقياس التشابه بين سلسلتي نصوص
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // إذا كانت إحدى السلاسل فارغة
    if (s1.length === 0 || s2.length === 0) return 0;
    
    // مطابقة تامة
    if (s1 === s2) return 1;
    
    // مطابقة جزئية (إذا كانت إحدى السلاسل تحتوي الأخرى)
    if (s1.includes(s2) || s2.includes(s1)) {
      const minLength = Math.min(s1.length, s2.length);
      const maxLength = Math.max(s1.length, s2.length);
      return minLength / maxLength;
    }
    
    // حساب عدد الكلمات المشتركة
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word)).length;
    
    if (commonWords > 0) {
      return commonWords / Math.max(words1.length, words2.length);
    }
    
    // البحث عن التشابه في الأحرف المتتالية (وهذا مفيد للغة الإنجليزية)
    let commonChars = 0;
    for (let i = 0; i < s1.length; i++) {
      if (s2.includes(s1[i])) commonChars++;
    }
    
    return commonChars / Math.max(s1.length, s2.length);
  };

  const handleAiSearch = async (value: string) => {
    if (!value.trim()) return;
    
    setIsLoading(true);
    setAiQuery(value);
    
    try {
      // التحقق من اللغة وتطبيق البحث الذكي
      const searchQuery = value.toLowerCase().trim();
      const isEnglishQuery = /[a-zA-Z]/.test(searchQuery);
      
      // نحسب درجة تشابه لكل منتج
      const productsWithScores = products.map(product => {
        const nameMatch = calculateSimilarity(product.name, searchQuery);
        const descMatch = product.description ? 
          calculateSimilarity(product.description, searchQuery) : 0;
        
        // نأخذ أعلى قيمة تشابه (إما الاسم أو الوصف)
        const similarityScore = Math.max(nameMatch, descMatch);
        
        return {
          ...product,
          similarityScore
        };
      });
      
      // ترتيب النتائج حسب درجة التشابه (من الأعلى للأقل)
      const sortedResults = [...productsWithScores]
        .filter(product => product.similarityScore > 0.1) // فلترة النتائج ذات التشابه الضعيف جداً
        .sort((a, b) => b.similarityScore - a.similarityScore);
      
      // إذا كانت النتائج قليلة، نضيف اقتراحات إضافية
      if (sortedResults.length < 3 && products.length > 0) {
        // اختيار منتجات عشوائية لم تظهر في النتائج
        const additionalSuggestions = products
          .filter(p => !sortedResults.some(r => r.id === p.id))
          .slice(0, 3);
          
        setAiResults([...sortedResults, ...additionalSuggestions]);
      } else {
        setAiResults(sortedResults);
      }
    } catch (error) {
      console.error("خطأ في البحث الذكي:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (aiSearchOpen && aiQuery) {
      handleAiSearch(aiQuery);
    }
  }, [aiSearchOpen, aiQuery]);

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
                  {product.similarityScore > 0.3 && product.similarityScore < 1 && (
                    <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full mr-1">
                      تطابق مشابه
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
