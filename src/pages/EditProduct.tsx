
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import EditProductForm from "@/components/products/EditProductForm";
import ProductsTable from "@/components/products/ProductsTable";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("لم يتم العثور على المستخدم");

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        setProducts(data || []);

        // فقط قم بتحديد المنتج تلقائيًا إذا كان هناك معرّف في العنوان
        if (productId) {
          const selectedProduct = data?.find(p => p.id === productId);
          if (selectedProduct) {
            setSelectedProduct(selectedProduct);
            setName(selectedProduct.name);
            setDescription(selectedProduct.description || "");
            setPrice(selectedProduct.price.toString());
            setCategory(selectedProduct.category || "");
            setIsNew(selectedProduct.is_new || false);
            setIsPopular(selectedProduct.is_popular || false);
          }
        }
      } catch (error: any) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "خطأ في تحميل المنتجات",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [productId, toast]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name,
          description,
          price: parseFloat(price),
          category,
          is_new: isNew,
          is_popular: isPopular
        })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast({
        title: "تم تحديث المنتج بنجاح",
        duration: 3000,
      });

      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, name, description, price: parseFloat(price), category, is_new: isNew, is_popular: isPopular }
          : p
      ));

      // إرجاع المستخدم إلى حالة اختيار المنتج بعد التحديث
      setSelectedProduct(null);

    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث المنتج",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // العودة إلى حالة اختيار المنتج بدلاً من العودة للوحة التحكم
    setSelectedProduct(null);
  };

  const handleSelectProduct = (productId: string) => {
    console.log("تم اختيار المنتج:", productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setCategory(product.category || "");
      setIsNew(product.is_new || false);
      setIsPopular(product.is_popular || false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-pulse bg-gray-200 h-6 w-48 rounded mx-auto"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى لوحة التحكم
        </Button>
      </div>

      <div className="grid gap-6">
        {!selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>اختر المنتج الذي تريد تعديله</CardTitle>
              <CardDescription>انقر على زر "تعديل" بجانب المنتج الذي تريد تعديله</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">لا توجد منتجات متاحة للتعديل</p>
                  <Button 
                    onClick={() => navigate("/add-product")} 
                    className="mt-4"
                  >
                    إضافة منتج جديد
                  </Button>
                </div>
              ) : (
                <ProductsTable 
                  products={products} 
                  onEdit={handleSelectProduct}
                  onDelete={() => {}} // لن نستخدم هذه الوظيفة هنا
                />
              )}
            </CardContent>
          </Card>
        )}

        {selectedProduct && (
          <EditProductForm
            product={selectedProduct}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            price={price}
            setPrice={setPrice}
            category={category}
            setCategory={setCategory}
            isNew={isNew}
            setIsNew={setIsNew}
            isPopular={isPopular}
            setIsPopular={setIsPopular}
            isLoading={isSaving}
          />
        )}
      </div>
    </div>
  );
};

export default EditProduct;
