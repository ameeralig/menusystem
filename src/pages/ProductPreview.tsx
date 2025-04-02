import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Product } from "@/types/product";
import StoreHeader from "@/components/store/StoreHeader";
import SearchBar from "@/components/store/SearchBar";
import CategoryGrid from "@/components/store/CategoryGrid";
import ProductGrid from "@/components/store/ProductGrid";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import { Instagram, Facebook, MessageSquare } from "lucide-react";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  telegram?: string;
};

const ProductPreview = () => {
  const { userId } = useParams<{ userId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<string | null>("default");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const trackPageView = async () => {
      if (!userId) return;
      
      try {
        const { error } = await supabase.rpc('increment_page_view', { 
          store_user_id: userId 
        });
        
        if (error) {
          console.error("Error tracking page view:", error);
        }
      } catch (error) {
        console.error("Error tracking page view:", error);
      }
    };
    
    trackPageView();
  }, [userId]);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!userId || typeof userId !== 'string') {
          throw new Error("معرف المتجر غير صالح");
        }

        const { data: storeSettings, error: storeError } = await supabase
          .from("store_settings")
          .select("store_name, color_theme, social_links")
          .eq("user_id", userId)
          .maybeSingle();

        if (storeError) {
          console.error("Error fetching store settings:", storeError);
          setStoreName(null);
          setColorTheme("default");
        } else {
          setStoreName(storeSettings?.store_name || null);
          setColorTheme(storeSettings?.color_theme || "default");
          setSocialLinks(storeSettings?.social_links as SocialLinks || {});
        }

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw new Error("حدث خطأ أثناء جلب المنتجات");
        }

        setProducts(productsData || []);

      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
        toast({
          title: "حدث خطأ",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [userId, toast]);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  
  const filteredProducts = selectedCategory
    ? products.filter(p => 
        p.category === selectedCategory && 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getThemeClasses = (theme: string | null) => {
    switch (theme) {
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30';
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30';
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30';
      case 'pink':
        return 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  const getCategoryImage = (category: string) => {
    const categoryProduct = products.find(p => p.category === category && p.image_url);
    return categoryProduct?.image_url || '/placeholder.svg';
  };

  const getSocialIcon = (platform: string, url: string) => {
    if (!url) return null;

    const iconClasses = "w-5 h-5 transition-colors duration-300";
    const linkClasses = "hover:opacity-75 transition-opacity";

    switch (platform) {
      case 'instagram':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses}>
            <Instagram className={`${iconClasses} text-pink-500`} />
          </a>
        );
      case 'facebook':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses}>
            <Facebook className={`${iconClasses} text-blue-500`} />
          </a>
        );
      case 'telegram':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses}>
            <MessageSquare className={`${iconClasses} text-blue-400`} />
          </a>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getThemeClasses(colorTheme)} transition-colors duration-300`}>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <StoreHeader storeName={storeName} colorTheme={colorTheme} />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {!selectedCategory ? (
          <CategoryGrid
            categories={categories}
            getCategoryImage={getCategoryImage}
            onCategorySelect={setSelectedCategory}
          />
        ) : (
          <>
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <span>← رجوع إلى التصنيفات</span>
            </button>
            <ProductGrid products={filteredProducts} />
          </>
        )}

        {selectedCategory && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              لا توجد منتجات في هذا التصنيف
            </p>
          </div>
        )}

        {Object.entries(socialLinks).length > 0 && (
          <div className="fixed bottom-4 left-4 flex gap-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-lg backdrop-blur-sm">
            {Object.entries(socialLinks).map(([platform, url]) => (
              url && getSocialIcon(platform, url)
            ))}
          </div>
        )}

        {userId && <FeedbackDialog userId={userId} />}
      </div>
    </div>
  );
};

export default ProductPreview;
