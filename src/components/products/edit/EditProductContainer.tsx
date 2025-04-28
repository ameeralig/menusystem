import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import ProductsList from "@/components/products/ProductsList";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import LoadingState from "@/components/products/LoadingState";
import EditProductForm from "@/components/products/EditProductForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { getCategoryByName, createCategory } from "@/utils/categoryStorage";

const EditProductContainer = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);

  const fetchCategories = async (userId: string) => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId);

      if (!categoryError && categoryData) {
        setCategories(categoryData);
      } else {
        console.error("Error fetching categories:", categoryError);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("لم يتم العثور على المستخدم");

      await fetchCategories(user.id);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id);

      if (productsError) throw productsError;

      if (productsData) {
        setProducts(productsData);
      }

      if (productId) {
        const product = productsData?.find(p => p.id === productId);
        if (product) {
          setSelectedProductData(product);
        } else {
          navigate("/edit-product", { replace: true });
        }
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل المنتجات",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const setSelectedProductData = (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setCategoryId(product.category_id || "");
    setIsNew(product.is_new || false);
    setIsPopular(product.is_popular || false);
  };

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
          category_id: categoryId || null,
          is_new: isNew,
          is_popular: isPopular
        })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast({
        title: "تم تحديث المنتج بنجاح",
        duration: 3000,
      });

      const updatedProduct = {
        ...selectedProduct,
        name,
        description,
        price: parseFloat(price),
        category_id: categoryId,
        is_new: isNew,
        is_popular: isPopular
      };

      setProducts(products.map(p => 
        p.id === selectedProduct.id ? updatedProduct : p
      ));

      handleCancel();
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

  const handleDelete = async (productId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      setIsDeleting(true);
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) throw error;

        setProducts(products.filter(p => p.id !== productId));
        
        if (selectedProduct && selectedProduct.id === productId) {
          handleCancel();
        }

        toast({
          title: "تم حذف المنتج بنجاح",
          duration: 3000,
        });
      } catch (error: any) {
        console.error("Error deleting product:", error);
        toast({
          variant: "destructive",
          title: "خطأ في حذف المنتج",
          description: error.message,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setIsNew(false);
    setIsPopular(false);
    
    if (productId) {
      navigate("/edit-product", { replace: true });
    }
  };

  const handleSelectProduct = (productId: string) => {
    navigate(`/edit-product/${productId}`);
    
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProductData(product);
    }
  };

  if (isLoading) {
    return <LoadingState />;
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

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:gap-6">
        {isDeleting && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>جاري حذف المنتج...</span>
          </div>
        )}

        {!selectedProduct ? (
          <>
            <ProductsList 
              products={products}
              onSelectProduct={handleSelectProduct}
              onDeleteProduct={handleDelete}
            />
          </>
        ) : (
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
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
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

export default EditProductContainer;
