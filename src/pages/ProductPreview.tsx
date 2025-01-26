import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
          .eq('user_id', userId); // Fixed: Using the actual userId value from params

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
    const baseClasses = "px-3 py-1 rounded-full text-sm";
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
    <div className="container mx-auto py-8 px-4">
      <div className="relative mb-8">
        <Search className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="ابحث عن طبق..."
          className="w-full pl-4 pr-12 py-2 text-right"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">لا توجد منتجات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.image_url && (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={getCategoryBadgeClass(product.category || "")}>
                    {product.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-right">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-gray-600 mb-4 text-right">
                    {product.description}
                  </p>
                )}
                <p className="text-xl font-bold text-green-600 text-right">
                  {product.price.toLocaleString()} د.ع
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPreview;