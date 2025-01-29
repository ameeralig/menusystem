import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_new: boolean;
  is_popular: boolean;
}

const getThemeClasses = (colorTheme: string | null) => {
  switch (colorTheme) {
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

const ProductPreview = () => {
  const { userId } = useParams<{ userId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<string | null>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Validate userId before making the query
        if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
          throw new Error("معرف المستخدم غير صالح");
        }

        const { data: storeSettings, error: storeError } = await supabase
          .from("store_settings")
          .select("store_name, color_theme")
          .eq("user_id", userId)
          .maybeSingle();

        if (storeError) throw storeError;
        setStoreName(storeSettings?.store_name || null);
        setColorTheme(storeSettings?.color_theme || "default");

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId);

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "حدث خطأ أثناء تحميل البيانات",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchStoreData();
  }, [userId, toast]);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const themeClasses = getThemeClasses(colorTheme);

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors duration-300`}>
      <div className="container mx-auto py-6 px-4">
        {storeName && (
          <h1 className={`text-3xl font-bold text-center mb-8 ${
            colorTheme === 'default' 
              ? 'text-gray-900 dark:text-white' 
              : `text-${colorTheme}-900 dark:text-${colorTheme}-100`
          }`}>
            {storeName}
          </h1>
        )}

        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <div className="mt-6">
          <AnimatePresence>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <p>لا توجد منتجات متاحة حالياً</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout={viewMode}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;