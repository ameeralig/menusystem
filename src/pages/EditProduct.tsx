import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types/product";
import EditProductForm from "@/components/products/EditProductForm";
import ProductsTable from "@/components/products/ProductsTable";

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("لم يتم العثور على المستخدم");

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        setProducts(data || []);

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
          title: "خطأ في تحميل المنتجات",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productId, toast]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      
      toast({
        title: "تم حذف المنتج بنجاح",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "خطأ في حذف المنتج",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (productId: string) => {
    const productToEdit = products.find(p => p.id === productId);
    if (productToEdit) {
      setSelectedProduct(productToEdit);
      setName(productToEdit.name);
      setDescription(productToEdit.description || "");
      setPrice(productToEdit.price.toString());
      setCategory(productToEdit.category || "");
      setIsNew(productToEdit.is_new || false);
      setIsPopular(productToEdit.is_popular || false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

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

      setSelectedProduct(null);
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setIsNew(false);
      setIsPopular(false);

    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        title: "خطأ في تحديث المنتج",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">تعديل المنتجات</h1>
      
      {selectedProduct ? (
        <EditProductForm
          product={selectedProduct}
          onSubmit={handleUpdate}
          onCancel={() => setSelectedProduct(null)}
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
        />
      ) : (
        <ProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default EditProduct;