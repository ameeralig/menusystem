
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types/product";
import EditProductForm from "@/components/products/EditProductForm";
import ProductsTable from "@/components/products/ProductsTable";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical } from "lucide-react";
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
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("لم يتم العثور على المستخدم");

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
          .order('display_order', { ascending: true, nullsFirst: false });

        if (error) throw error;
        
        // Ensure all products have a display_order value
        const productsWithOrder = data?.map((product, index) => ({
          ...product,
          display_order: product.display_order ?? index + 1
        })) || [];
        
        setProducts(productsWithOrder);

        if (productId) {
          const selectedProduct = productsWithOrder?.find(p => p.id === productId);
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update display_order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    setProducts(updatedItems);
  };

  const saveProductOrder = async () => {
    try {
      setIsSavingOrder(true);
      
      // Update each product with its new display_order
      for (const product of products) {
        const { error } = await supabase
          .from("products")
          .update({ display_order: product.display_order })
          .eq("id", product.id);
          
        if (error) throw error;
      }
      
      toast({
        title: "تم حفظ ترتيب المنتجات بنجاح",
        duration: 3000,
      });
      
      setIsReordering(false);
    } catch (error: any) {
      console.error("Error saving product order:", error);
      toast({
        title: "خطأ في حفظ الترتيب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingOrder(false);
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
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">قائمة المنتجات</h2>
            {products.length > 1 && (
              <div>
                {isReordering ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={saveProductOrder} 
                      disabled={isSavingOrder}
                      size="sm"
                    >
                      {isSavingOrder ? "جاري الحفظ..." : "حفظ الترتيب"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsReordering(false)}
                      size="sm"
                    >
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setIsReordering(true)}
                    variant="outline"
                    size="sm"
                  >
                    تغيير ترتيب المنتجات
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {isReordering ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="products">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {products.map((product, index) => (
                      <Draggable key={product.id} draggableId={product.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="px-2 mr-2"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              )}
                              <div className="font-medium">{product.name}</div>
                            </div>
                            <div className="text-sm font-medium text-primary">
                              {product.price.toLocaleString()} د.ع
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <ProductsTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default EditProduct;
