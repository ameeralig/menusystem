
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
import { useIsMobile } from "@/hooks/use-mobile";

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
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

        // فقط إذا كان هناك معرف محدد في الرابط، قم بتحديد المنتج
        if (productId) {
          const product = data?.find(p => p.id === productId);
          if (product) {
            setSelectedProduct(product);
            setName(product.name);
            setDescription(product.description || "");
            setPrice(product.price.toString());
            setCategory(product.category || "");
            setIsNew(product.is_new || false);
            setIsPopular(product.is_popular || false);
          } else {
            // إذا لم يتم العثور على المنتج، نعود إلى قائمة المنتجات
            navigate("/edit-product", { replace: true });
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
  }, [productId, toast, navigate]);

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

      // بعد التحديث، العودة إلى قائمة المنتجات بدلاً من صفحة لوحة التحكم
      navigate("/edit-product", { replace: true });

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
    // العودة إلى قائمة المنتجات بدلاً من العودة للوحة التحكم
    navigate("/edit-product", { replace: true });
  };

  const handleSelectProduct = (productId: string) => {
    console.log("تم اختيار المنتج:", productId);
    // بدلاً من تحديث حالة فقط، قم بالانتقال إلى صفحة تعديل المنتج المحدد
    navigate(`/edit-product/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 px-3 md:py-8 md:px-6">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center space-y-4">
            <div className="animate-pulse bg-gray-200 h-6 w-48 rounded mx-auto"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-3 md:py-8 md:px-6">
      <div className="mb-4 md:mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 mb-2 md:mb-4 px-2 md:px-4"
          size={isMobile ? "sm" : "default"}
        >
          <ArrowRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          العودة إلى لوحة التحكم
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6">
        {!selectedProduct && (
          <Card className="w-full">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-lg md:text-2xl">اختر المنتج الذي تريد تعديله</CardTitle>
              <CardDescription className="text-xs md:text-sm">انقر على زر "تعديل" بجانب المنتج الذي تريد تعديله</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-4 md:py-6">
                  <p className="text-muted-foreground text-sm md:text-base">لا توجد منتجات متاحة للتعديل</p>
                  <Button 
                    onClick={() => navigate("/add-product")} 
                    className="mt-3 md:mt-4"
                    size={isMobile ? "sm" : "default"}
                  >
                    إضافة منتج جديد
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2 px-2">
                  <ProductsTable 
                    products={products} 
                    onEdit={handleSelectProduct}
                    onDelete={() => {}} // لن نستخدم هذه الوظيفة هنا
                  />
                </div>
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
