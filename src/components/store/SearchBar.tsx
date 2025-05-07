
import { useState, useEffect, useCallback } from "react";
import { Search, SparklesIcon, Shuffle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { toast } from "sonner";

interface SearchBarProps {
  query?: string;
  searchQuery?: string;
  onQueryChange?: (query: string) => void;
  setSearchQuery?: (query: string) => void;
  onToggleSearch?: () => void;
  showSearch?: boolean;
  products?: Product[];
}

const SearchBar = ({ 
  query,
  searchQuery, 
  onQueryChange,
  setSearchQuery,
  onToggleSearch,
  showSearch,
  products = [],
}: SearchBarProps) => {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // المتغير الذي سيتم استخدامه للبحث (سواء من query أو searchQuery)
  const currentQuery = query || searchQuery || "";
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onQueryChange) onQueryChange(value);
    if (setSearchQuery) setSearchQuery(value);
    setSearchTerm(value);
  };
  
  // دالة لقياس تشابه النصوص بطريقة Fuzzy Search
  const fuzzysort = (text: string, query: string): number => {
    if (!text || !query) return 0;
    
    text = text.toLowerCase();
    query = query.toLowerCase();
    
    // حالة التطابق التام
    if (text === query) return 1;
    
    // حالة احتواء النص على المصطلح
    if (text.includes(query)) {
      // كلما كانت الكلمة أقصر، كان التطابق أعلى
      return 0.9 * (query.length / text.length);
    }
    
    // مقارنة الكلمات
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
    
    // تحمل الأخطاء الإملائية البسيطة
    let commonChars = 0;
    for (let i = 0; i < Math.min(text.length, query.length); i++) {
      if (text[i] === query[i]) commonChars++;
    }
    
    const spellingMatchScore = commonChars / Math.max(text.length, query.length);
    
    return Math.max(matchScore, spellingMatchScore * 0.7);
  };

  // دالة البحث الرئيسية
  const performSearch = useCallback((value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // نسخة متقدمة من البحث
      const searchResults = products.map(product => {
        const nameMatch = fuzzysort(product.name, value);
        const descMatch = product.description ? fuzzysort(product.description, value) : 0;
        const categoryMatch = product.category ? fuzzysort(product.category, value) : 0;
        
        // نحسب درجة التطابق الكلية
        const matchScore = Math.max(nameMatch, descMatch, categoryMatch);
        
        return {
          ...product,
          score: matchScore
        };
      })
      // نأخذ النتائج ذات التطابق المعقول فقط
      .filter(item => item.score > 0.1)
      // ونرتبها حسب درجة التطابق
      .sort((a, b) => b.score - a.score);
      
      setResults(searchResults);
    } catch (error) {
      console.error("خطأ في البحث:", error);
    } finally {
      setIsLoading(false);
    }
  }, [products]);

  // البحث أثناء الكتابة
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 200); // تأخير بسيط لتحسين الأداء
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);
  
  // ميزة اختيار عنصر عشوائي
  const suggestRandomItem = () => {
    if (products.length === 0) {
      toast.error("لا توجد منتجات متاحة");
      return;
    }
    
    // نقسم المنتجات حسب التصنيف
    const categoriesMap: Record<string, Product[]> = {};
    
    products.forEach(product => {
      const category = product.category || "أخرى";
      if (!categoriesMap[category]) {
        categoriesMap[category] = [];
      }
      categoriesMap[category].push(product);
    });
    
    // نختار فئة عشوائية
    const categories = Object.keys(categoriesMap);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // نختار منتج عشوائي من الفئة
    const productsInCategory = categoriesMap[randomCategory];
    const randomProduct = productsInCategory[Math.floor(Math.random() * productsInCategory.length)];
    
    // نضبط البحث على هذا المنتج
    if (onQueryChange) onQueryChange(randomProduct.name);
    if (setSearchQuery) setSearchQuery(randomProduct.name);
    setSearchTerm(randomProduct.name);
    
    // نعرض رسالة للمستخدم
    toast.success(`اقتراح: ${randomProduct.name} (${randomCategory})`);
  };

  const selectProduct = (product: Product) => {
    if (onQueryChange) onQueryChange(product.name);
    if (setSearchQuery) setSearchQuery(product.name);
    setSearchTerm(product.name);
    setSearchDialogOpen(false);
  };
  
  // استخدام useEffect لتحديث البحث عند تغيير query أو searchQuery من الخارج
  useEffect(() => {
    setSearchTerm(currentQuery);
    performSearch(currentQuery);
  }, [currentQuery, performSearch]);

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="flex items-center relative">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="ابحث عن طبق..."
          className="w-full pl-20 pr-10 py-2 text-right"
          value={currentQuery}
          onChange={handleChange}
          onClick={() => {
            if (products.length > 0) {
              setSearchDialogOpen(true);
            }
          }}
        />
        <div className="absolute left-1 top-1 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            onClick={() => setSearchDialogOpen(true)}
            title="بحث"
          >
            <SparklesIcon className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
            onClick={suggestRandomItem}
            title="اقترح وجبة"
          >
            <Shuffle className="h-4 w-4 text-green-500" />
          </Button>
        </div>
      </div>

      <CommandDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <CommandInput 
          placeholder="ماذا تريد أن تأكل اليوم؟" 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              <p className="py-6 text-center text-sm">جارٍ البحث...</p>
            ) : (
              <p className="py-6 text-center text-sm">لا توجد نتائج. جرّب كلمات أخرى.</p>
            )}
          </CommandEmpty>
          
          <CommandGroup heading="نتائج البحث">
            {results.map((product) => (
              <CommandItem
                key={product.id}
                onSelect={() => selectProduct(product)}
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
          
          <CommandSeparator />
          
          <CommandGroup heading="اقتراحات">
            <CommandItem
              onSelect={suggestRandomItem}
              className="flex items-center justify-center py-3 text-green-600"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              <span>اقترح وجبة عشوائية</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default SearchBar;
