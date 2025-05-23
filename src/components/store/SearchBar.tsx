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
import Fuse from "fuse.js";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentQuery = query || searchQuery || "";

  const fuse = new Fuse(products, {
    keys: ["name", "description", "category"],
    threshold: 0.35,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onQueryChange) onQueryChange(value);
    if (setSearchQuery) setSearchQuery(value);
    setSearchTerm(value);
  };

  const performSearch = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        const searchResults = fuse.search(value).map(result => result.item);
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fuse]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  useEffect(() => {
    setSearchTerm(currentQuery);
    performSearch(currentQuery);
  }, [currentQuery, performSearch]);

  // Shortcut: Ctrl + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchDialogOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const suggestRandomItem = () => {
    if (products.length === 0) {
      toast.error("ماكو منتجات حالياً");
      return;
    }

    const categoriesMap: Record<string, Product[]> = {};
    products.forEach(product => {
      const category = product.category || "أخرى";
      if (!categoriesMap[category]) categoriesMap[category] = [];
      categoriesMap[category].push(product);
    });

    const categories = Object.keys(categoriesMap);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomProduct = categoriesMap[randomCategory][
      Math.floor(Math.random() * categoriesMap[randomCategory].length)
    ];

    if (onQueryChange) onQueryChange(randomProduct.name);
    if (setSearchQuery) setSearchQuery(randomProduct.name);
    setSearchTerm(randomProduct.name);
    toast.success(`اقترحنا لك: ${randomProduct.name} (${randomCategory})`);
  };

  const selectProduct = (product: Product) => {
    if (onQueryChange) onQueryChange(product.name);
    if (setSearchQuery) setSearchQuery(product.name);
    setSearchTerm(product.name);
    setSearchDialogOpen(false);

    setTimeout(() => {
      document.getElementById("product-list")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="flex items-center relative">
        <Input
          type="text"
          placeholder="🔍 ابحث عن طبق مفضل..."
          className="w-full pl-14 pr-10 py-2 text-right rounded-xl border-2 border-blue-300 focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={handleChange}
          onClick={() => {
            if (products.length > 0) {
              setSearchDialogOpen(true);
            }
          }}
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />

        <div className="absolute left-1 top-1 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="p-1 h-9 w-9 rounded-full border border-blue-300 hover:bg-blue-100 transition-all"
            onClick={() => setSearchDialogOpen(true)}
            title="بحث متقدم"
          >
            <SparklesIcon className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-1 h-9 w-9 rounded-full border border-green-300 hover:bg-green-100 transition-all"
            onClick={suggestRandomItem}
            title="اقترح طبق"
          >
            <Shuffle className="h-4 w-4 text-green-600" />
          </Button>
        </div>
      </div>

      <CommandDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <CommandInput
          placeholder="شنو نفسك تاكل اليوم؟ 🍔"
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              <p className="py-6 text-center text-sm">جاري البحث...</p>
            ) : (
              <p className="py-6 text-center text-sm">ماكو نتائج، جرّب كلمة غيرها</p>
            )}
          </CommandEmpty>

          <CommandGroup heading="النتائج">
            {results.map((product) => (
              <CommandItem
                key={product.id}
                onSelect={() => selectProduct(product)}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <p>{product.name}</p>
                  {product.price && (
                    <p className="text-xs text-gray-500">{product.price} د.ع</p>
                  )}
                </div>
                {product.category && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full">
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
              className="justify-center py-3 text-green-600"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              <span>اقترحلي وجبة عشوائية</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default SearchBar;
