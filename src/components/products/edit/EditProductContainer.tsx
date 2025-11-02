import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import ProductsList from "@/components/products/ProductsList";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import LoadingState from "@/components/products/LoadingState";
import EditProductForm from "@/components/products/EditProductForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CategoryImageManager } from "@/components/products/CategoryImageManager";
import { uploadImage } from "@/utils/storageHelpers";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Package, FolderOpen } from "lucide-react";

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
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("لم يتم العثور على المستخدم");

      setUserId(user.id);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id);

      if (productsError) throw productsError;

      if (productsData) {
        setProducts(productsData);
        const categories = [...new Set(productsData?.map(p => p.category).filter(Boolean))];
        setUniqueCategories(categories);

        const { data: imagesData, error: imagesError } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", user.id);

        if (!imagesError && imagesData) {
          setCategoryImages(imagesData);
        }
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
    setCategory(product.category || "");
    setIsNew(product.is_new || false);
    setIsPopular(product.is_popular || false);
    setIsAvailable(product.is_available !== false);
  };

  const handleUpdate = async (e: React.FormEvent, imageData?: { uploadMethod: "url" | "file"; imageUrl?: string; selectedFile?: File | null }) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSaving(true);
    try {
      let finalImageUrl = selectedProduct.image_url;

      // معالجة تحديث الصورة
      if (imageData) {
        if (imageData.uploadMethod === "file" && imageData.selectedFile) {
          // رفع الملف الجديد
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("يجب تسجيل الدخول أولاً");

          const safeFileName = imageData.selectedFile.name
            .toLowerCase()
            .replace(/[^a-z0-9.]/g, '-')
            .replace(/--+/g, '-');
            
          const timestamp = new Date().getTime();
          const uniqueFilePath = `${name.replace(/\s+/g, '-')}-${timestamp}-${safeFileName}`;
          
          finalImageUrl = await uploadImage("product-images", imageData.selectedFile, user.id, uniqueFilePath);
        } else if (imageData.uploadMethod === "url" && imageData.imageUrl) {
          // استخدام الرابط الجديد
          finalImageUrl = imageData.imageUrl;
        }
      }

      const { error } = await supabase
        .from("products")
        .update({
          name,
          description,
          price: parseFloat(price),
          category,
          is_new: isNew,
          is_popular: isPopular,
          is_available: isAvailable,
          image_url: finalImageUrl
        })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast({
        title: "تم تحديث المنتج بنجاح",
        duration: 3000,
      });

      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { 
              ...p, 
              name, 
              description, 
              price: parseFloat(price), 
              category, 
              is_new: isNew, 
              is_popular: isPopular, 
              is_available: isAvailable,
              image_url: finalImageUrl
            }
          : p
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
    setCategory("");
    setIsNew(false);
    setIsPopular(false);
    setIsAvailable(true);
    
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

  const handleUpdateCategoryImages = async (images: CategoryImage[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      await supabase
        .from("category_images")
        .delete()
        .eq("user_id", user.id);

      if (images.length > 0) {
        const { error } = await supabase
          .from("category_images")
          .upsert(images.map(img => ({
            user_id: user.id,
            category: img.category,
            image_url: img.image_url,
          })));

        if (error) throw error;
      }

      setCategoryImages(images);
    } catch (error: any) {
      console.error("Error updating category images:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث صور التصنيفات",
        description: error.message,
      });
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
          <Accordion 
            type="multiple" 
            defaultValue={[]} 
            className="w-full space-y-6"
          >
            <AccordionItem value="products-list" className="border rounded-xl bg-card shadow-sm">
              <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/50 rounded-t-xl [&[data-state=open]]:rounded-b-none transition-all duration-300 group">
                <div className="flex items-center gap-4 text-right">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-semibold mb-1">قائمة المنتجات</h3>
                    <p className="text-sm text-muted-foreground">عرض وتعديل المنتجات ({products.length} منتج)</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 animate-accordion-down animate-fade-in overflow-hidden">
                <div className="pt-4 border-t border-muted animate-scale-in">
                  <ProductsList 
                    products={products}
                    onSelectProduct={handleSelectProduct}
                    onDeleteProduct={handleDelete}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {uniqueCategories.length > 0 && (
              <AccordionItem value="category-management" className="border rounded-xl bg-card shadow-sm">
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/50 rounded-t-xl [&[data-state=open]]:rounded-b-none transition-all duration-300 group">
                  <div className="flex items-center gap-4 text-right">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <FolderOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-semibold mb-1">إدارة التصنيفات</h3>
                      <p className="text-sm text-muted-foreground">ترتيب وإدارة صور التصنيفات ({uniqueCategories.length} تصنيف)</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 animate-accordion-down animate-fade-in overflow-hidden">
                  <div className="pt-4 border-t border-muted animate-scale-in">
                    <CategoryImageManager
                      categories={uniqueCategories}
                      categoryImages={categoryImages}
                      onUpdateImages={handleUpdateCategoryImages}
                      userId={userId || undefined}
                      onCategoryDeleted={fetchProducts}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
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
            category={category}
            setCategory={setCategory}
            isNew={isNew}
            setIsNew={setIsNew}
            isPopular={isPopular}
            setIsPopular={setIsPopular}
            isAvailable={isAvailable}
            setIsAvailable={setIsAvailable}
            isLoading={isSaving}
          />
        )}
      </div>
    </div>
  );
};

export default EditProductContainer;
