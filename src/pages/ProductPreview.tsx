import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

const CategoryCard = ({ 
  category, 
  image, 
  onClick 
}: { 
  category: string; 
  image: string; 
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="relative overflow-hidden rounded-xl cursor-pointer shadow-md group"
    onClick={onClick}
  >
    <div className="aspect-[16/9] overflow-hidden">
      <img 
        src={image} 
        alt={category}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h3 className="text-white text-2xl font-bold tracking-wide">
          {category}
        </h3>
      </div>
    </div>
  </motion.div>
);

const ProductCard = ({ product }: { product: Product }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
  >
    {product.image_url && (
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
    )}
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-right">{product.name}</h3>
        <span className="text-lg font-bold text-coral-500">{product.price.toLocaleString()} د.ع</span>
      </div>
      {product.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm text-right">
          {product.description}
        </p>
      )}
    </div>
  </motion.div>
);

const ProductPreview = () => {
  const { userId } = useParams<{ userId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<string | null>("default");
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        if (!userId) {
          throw new Error("معرف المستخدم غير صالح");
        }

        // First, fetch store settings
        const { data: storeSettings, error: storeError } = await supabase
          .from("store_settings")
          .select("store_name, color_theme")
          .eq("user_id", userId)
          .maybeSingle();

        if (storeError) throw storeError;
        
        setStoreName(storeSettings?.store_name || null);
        setColorTheme(storeSettings?.color_theme || "default");

        // Then, fetch products
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

    if (userId) {
      fetchStoreData();
    }
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

  return (
    <div className={`min-h-screen ${getThemeClasses(colorTheme)} transition-colors duration-300`}>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {storeName && (
          <h1 className={`text-3xl font-bold text-center mb-8 ${
            colorTheme === 'default' 
              ? 'text-gray-900 dark:text-white' 
              : `text-${colorTheme}-900 dark:text-${colorTheme}-100`
          }`}>
            {storeName}
          </h1>
        )}

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن طبق..."
            className="w-full pl-4 pr-10 py-2 text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {!selectedCategory ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
            {categories.map((category) => (
              category && (
                <CategoryCard
                  key={category}
                  category={category}
                  image={getCategoryImage(category)}
                  onClick={() => setSelectedCategory(category)}
                />
              )
            ))}
          </div>
        ) : (
          <>
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <span>← رجوع إلى التصنيفات</span>
            </button>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {selectedCategory && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              لا توجد منتجات في هذا التصنيف
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPreview;