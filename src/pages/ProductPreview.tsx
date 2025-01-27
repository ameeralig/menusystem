import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
}

const ProductPreview = () => {
  const { userId } = useParams<{ userId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        if (!userId) {
          throw new Error("معرف المستخدم غير موجود");
        }

        // Fetch store settings using maybeSingle() instead of single()
        const { data: storeSettings, error: storeError } = await supabase
          .from("store_settings")
          .select("store_name")
          .eq("user_id", userId)
          .maybeSingle();

        if (storeError) throw storeError;
        setStoreName(storeSettings?.store_name || null);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq('user_id', userId);

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

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (category: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (category?.toLowerCase()) {
      case "برجر":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "بيتزا":
        return `${baseClasses} bg-pink-100 text-pink-800`;
      case "شاورما":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "مشاوي":
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {storeName && (
        <h1 className="text-3xl font-bold text-center mb-8">{storeName}</h1>
      )}

      <div className="mb-6 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن طبق..."
            className="w-full pl-4 pr-10 py-2 text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 justify-center flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !selectedCategory
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            الكل
          </span>
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
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                {category}
              </span>
            </motion.button>
          )
        ))}
      </div>

      <AnimatePresence>
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <p className="text-gray-600">لا توجد منتجات متاحة حالياً</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                  {product.image_url && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <motion.img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-base font-bold text-right line-clamp-1 flex-1">
                        {product.name}
                      </h3>
                      {product.category && (
                        <span className={getCategoryBadgeClass(product.category)}>
                          {product.category}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-2 text-right line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <p className="text-base font-bold text-green-600 text-right">
                      {product.price.toLocaleString()} د.ع
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPreview;