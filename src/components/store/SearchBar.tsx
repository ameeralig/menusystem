
import { Search, SparklesIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface SearchBarProps {
  query?: string;
  searchQuery?: string;
  onQueryChange?: (query: string) => void;
  setSearchQuery?: (query: string) => void;
  onToggleSearch?: () => void;
  showSearch?: boolean;
  products?: any[]; // يمكن استخدام نوع Product هنا
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
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  
  // يتم استخدام كلاً من query/onQueryChange أو searchQuery/setSearchQuery حسب المكون الأب
  const currentQuery = query || searchQuery || "";
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onQueryChange) onQueryChange(e.target.value);
    if (setSearchQuery) setSearchQuery(e.target.value);
  };

  const toggleAiSearch = () => {
    setAiSearchOpen(!aiSearchOpen);
    if (!aiSearchOpen) {
      setAiQuery(currentQuery); // نقل النص الحالي إلى البحث الذكي
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
  
  useEffect(() => {
    if (aiSearchOpen && aiQuery) {
      handleAiSearch(aiQuery);
    }
  }, [aiSearchOpen, aiQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleAiSearch();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [aiSearchOpen]);

  const selectProduct = (product: any) => {
    if (onQueryChange) onQueryChange(product.name);
    if (setSearchQuery) setSearchQuery(product.name);
    setAiSearchOpen(false);
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="flex items-center relative">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="ابحث عن طبق..."
          className="w-full pl-10 pr-10 py-2 text-right"
          value={currentQuery}
          onChange={handleChange}
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
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default SearchBar;
