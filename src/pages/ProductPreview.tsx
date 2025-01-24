import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

const ProductPreview = () => {
  const { userId } = useParams<{ userId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
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
          .eq("user_id", userId);

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

  if (products.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-8">معرض المنتجات</h1>
        <p className="text-gray-600">لا توجد منتجات متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">معرض المنتجات</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            {product.image_url && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              {product.description && (
                <p className="text-gray-600 mb-2">{product.description}</p>
              )}
              <p className="text-lg font-bold text-primary">
                {product.price.toLocaleString()} دينار عراقي
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductPreview;