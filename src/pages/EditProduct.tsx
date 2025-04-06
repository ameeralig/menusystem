
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types/product";
import EditProductForm from "@/components/products/EditProductForm";
import ProductsTable from "@/components/products/ProductsTable";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("لم يتم العثور على المستخدم");

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
          .order('display_order', { ascending: true, nullsFirst: true });

        if (error) throw error;
        
        // Initialize display_order if not set
        const productsWithOrder = data?.map((product, index) => ({
          ...product,
          display_order: product.display_order !== null ? product.display_order : index
        })) || [];
        
        setProducts(productsWithOrder);

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
          is_popular: isPopular,
          display_order: selectedProduct.display_order
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
              display_order: selectedProduct.display_order
            }
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

  const moveProduct = async (dragIndex: number, hoverIndex: number) => {
    const draggedProduct = products[dragIndex];
    
    // Create a copy of the products array
    const updatedProducts = [...products];
    
    // Remove the dragged product from its original position
    updatedProducts.splice(dragIndex, 1);
    
    // Insert the dragged product at the new position
    updatedProducts.splice(hoverIndex, 0, draggedProduct);
    
    // Update the display order of all products
    const reorderedProducts = updatedProducts.map((product, index) => ({
      ...product,
      display_order: index
    }));
    
    // Update the state with the new order
    setProducts(reorderedProducts);
  };

  const saveProductOrder = async () => {
    try {
      // Create an array of updates for each product's display_order
      const updates = products.map(product => ({
        id: product.id,
        display_order: product.display_order
      }));
      
      // Update all products in a single batch
      const { error } = await supabase
        .from('products')
        .upsert(updates, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast({
        title: "تم حفظ ترتيب المنتجات بنجاح",
        duration: 3000,
      });
      
      setReordering(false);
    } catch (error: any) {
      console.error("Error saving product order:", error);
      toast({
        title: "خطأ في حفظ ترتيب المنتجات",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const ProductRow = ({ product, index }: { product: Product, index: number }) => {
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
      type: 'product',
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));
    
    const [, drop] = useDrop(() => ({
      accept: 'product',
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          moveProduct(item.index, index);
          item.index = index;
        }
      },
    }));
    
    return (
      <tr 
        ref={(node) => drop(dragPreview(node))} 
        className={`${isDragging ? 'opacity-50' : ''} cursor-move transition-all duration-200`}
      >
        <td className="py-2 flex items-center">
          <div ref={drag} className="cursor-grab mr-2">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          {product.name}
        </td>
        <td className="py-2">{product.category || '-'}</td>
        <td className="py-2 text-left">{product.price} ر.س</td>
      </tr>
    );
  };

  const ReorderProducts = () => {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">إعادة ترتيب المنتجات</h2>
        <div className="border rounded-md overflow-hidden mb-4">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="py-2 text-right px-4">اسم المنتج</th>
                <th className="py-2 text-right">التصنيف</th>
                <th className="py-2 text-left">السعر</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <ProductRow key={product.id} product={product} index={index} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setReordering(false)}>
            إلغاء
          </Button>
          <Button onClick={saveProductOrder}>
            حفظ الترتيب
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">تعديل المنتجات</h1>
      
      {reordering ? (
        <DndProvider backend={HTML5Backend}>
          <ReorderProducts />
        </DndProvider>
      ) : selectedProduct ? (
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
        <>
          {products.length > 1 && (
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                onClick={() => setReordering(true)}
                className="flex items-center gap-2"
              >
                <GripVertical className="h-4 w-4" />
                إعادة ترتيب المنتجات
              </Button>
            </div>
          )}
          <ProductsTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
};

export default EditProduct;
