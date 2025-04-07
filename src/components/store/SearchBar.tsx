
import { Mic, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types/product";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products?: Product[];
  setSelectedCategory?: (category: string | null) => void;
}

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  products = [], 
  setSelectedCategory 
}: SearchBarProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ar-IQ'; // Set to Arabic (Iraq)

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        processSearch(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: "خطأ في التعرف على الصوت",
          description: "يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Add click event listener to close results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      document.removeEventListener('click', handleClickOutside);
    };
  }, [setSearchQuery, toast]);

  // Filter products when search query changes
  useEffect(() => {
    if (searchQuery && products.length > 0) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
      setShowResults(filtered.length > 0 && searchQuery.length > 0);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, products]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "غير مدعوم",
        description: "ميزة التعرف على الصوت غير مدعومة في هذا المتصفح",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setSearchQuery("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "جاري الاستماع...",
          description: "تحدث الآن للبحث عن طبق",
        });
      } catch (error) {
        console.error("Speech recognition error:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تشغيل ميزة التعرف على الصوت",
          variant: "destructive"
        });
      }
    }
  };

  const processSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    try {
      // Simulate AI processing with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter products based on the query
      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(filteredProducts);
      
      if (filteredProducts.length > 0) {
        toast({
          title: "تم العثور على منتجات",
          description: `تم العثور على ${filteredProducts.length} منتج`,
        });
        
        // If we have a category and only one product, navigate to that category
        if (filteredProducts.length === 1 && setSelectedCategory && filteredProducts[0].category) {
          setSelectedCategory(filteredProducts[0].category);
        }
      } else {
        toast({
          title: "لم يتم العثور على منتجات",
          description: "لم يتم العثور على منتجات تطابق البحث",
          variant: "destructive"
        });
      }
      
      setShowResults(filteredProducts.length > 0);
    } catch (error) {
      console.error("Search processing error:", error);
      toast({
        title: "خطأ في المعالجة",
        description: "حدث خطأ أثناء معالجة البحث",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      // Don't immediately process, let the user type
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processSearch(searchQuery);
  };

  const handleResultClick = (product: Product) => {
    setSearchQuery(product.name);
    setShowResults(false);
    
    // If we have a category and setSelectedCategory function, navigate to that category
    if (setSelectedCategory && product.category) {
      setSelectedCategory(product.category);
      
      toast({
        title: "تم الانتقال إلى المنتج",
        description: `تم الانتقال إلى التصنيف: ${product.category}`,
      });
    }
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="ابحث عن طبق بالذكاء الاصطناعي..."
            className="w-full pl-10 pr-10 py-2 text-right"
            value={searchQuery}
            onChange={handleInputChange}
            disabled={isProcessing || isListening}
          />
          <button
            type="submit"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            disabled={isProcessing || isListening}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute left-3 top-2.5 ${isListening ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
            disabled={isProcessing}
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-md">
            <div className="text-sm text-gray-500 dark:text-gray-400">جاري معالجة البحث بالذكاء الاصطناعي...</div>
          </div>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
        >
          <ul className="py-1">
            {searchResults.map((product) => (
              <li 
                key={product.id} 
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                onClick={() => handleResultClick(product)}
              >
                <span className="font-medium text-right w-full">{product.name}</span>
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-10 h-10 object-cover rounded-md ml-2" 
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
