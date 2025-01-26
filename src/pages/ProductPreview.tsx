import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search, Tag } from "lucide-react";
import { motion } from "framer-motion";

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
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!userId) {
          throw new Error("معرف المستخدم غير موجود");
        }

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq('user_id', userId);

        if (error) throw error;
        setProducts(data || []);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        toast({
          title: "حدث خطأ أثناء تحميل المنتجات",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchProducts();
  }, [userId, toast]);

  const categories = ["الكل", "برجر", "بيتزا", "شاورما", "مشاوي"];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "الكل" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (category: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن طبق..."
            className="w-full pl-4 pr-12 py-2 text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 justify-center flex-wrap">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {category}
            </span>
          </motion.button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">لا توجد منتجات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {product.image_url && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    {product.category && (
                      <span className={getCategoryBadgeClass(product.category)}>
                        {product.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-right">
                    {product.name}
                  </h2>
                  {product.description && (
                    <p className="text-gray-600 mb-3 text-right line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <p className="text-lg font-bold text-green-600 text-right">
                    {product.price.toLocaleString()} د.ع
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPreview;