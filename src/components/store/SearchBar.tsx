
import { Mic, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
        processAiSearch(transcript);
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [setSearchQuery, toast]);

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

  const processAiSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    try {
      // Here we would typically connect to an AI service
      // For now, we'll simulate AI processing with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate enhanced AI search by adding relevant keywords
      const enhancedQuery = await enhanceSearchQuery(query);
      setSearchQuery(enhancedQuery);
      
      toast({
        title: "تم معالجة البحث",
        description: `البحث عن: ${enhancedQuery}`,
      });
    } catch (error) {
      console.error("AI processing error:", error);
      toast({
        title: "خطأ في المعالجة",
        description: "حدث خطأ أثناء معالجة البحث",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate AI processing to enhance search query
  const enhanceSearchQuery = async (query: string): Promise<string> => {
    // This function would typically call an AI service
    // For demo purposes, we're just adding a prefix based on query content
    
    // Simple food category detection (very basic simulation)
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("لحم") || lowerQuery.includes("دجاج") || lowerQuery.includes("ستيك")) {
      return `${query} (أطباق اللحوم)`;
    } else if (lowerQuery.includes("خضار") || lowerQuery.includes("سلطة") || lowerQuery.includes("نباتي")) {
      return `${query} (أطباق نباتية)`;
    } else if (lowerQuery.includes("سمك") || lowerQuery.includes("روبيان")) {
      return `${query} (مأكولات بحرية)`;
    } else if (lowerQuery.includes("حلو") || lowerQuery.includes("كيك") || lowerQuery.includes("كعكة")) {
      return `${query} (حلويات)`;
    }
    
    return query;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processAiSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto mb-8">
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
  );
};

export default SearchBar;
