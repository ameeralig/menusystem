
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/product";
import EditProductForm from "../EditProductForm";
import LoadingState from "../LoadingState";
import EditProductImageSection from "./EditProductImageSection";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditProductContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // حالة المنتج الذي يجري تحريره
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        if (!data) {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "لم يتم العثور على المنتج",
          });
          navigate("/dashboard");
          return;
        }
        
        setProduct(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setPrice(data.price?.toString() || "");
        setCategory(data.category || "");
        setIsNew(data.is_new || false);
        setIsPopular(data.is_popular || false);
      } catch (error: any) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "خطأ في جلب بيانات المنتج",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (!product) return;
      
      const { error } = await supabase
        .from("products")
        .update({
          name,
          description,
          price: parseFloat(price),
          category,
          is_new: isNew,
          is_popular: isPopular,
        })
        .eq("id", product.id);
      
      if (error) throw error;
      
      toast({
        title: "تم تحديث المنتج بنجاح",
      });
      
      // تحديث المنتج في الحالة المحلية
      setProduct(prev => prev ? {
        ...prev,
        name,
        description,
        price: parseFloat(price),
        category,
        is_new: isNew,
        is_popular: isPopular,
      } : null);
      
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث المنتج",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpdate = (imageUrl: string) => {
    if (product) {
      setProduct({ ...product, image_url: imageUrl });
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };
  
  if (loading) {
    return <LoadingState message="جاري تحميل بيانات المنتج..." />;
  }
  
  if (!product) {
    return null;
  }
  
  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          العودة إلى المنتجات
        </Button>
        <h1 className="text-2xl font-bold">تعديل المنتج: {product.name}</h1>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">معلومات المنتج</TabsTrigger>
          <TabsTrigger value="image">صورة المنتج</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <EditProductForm
            product={product}
            onSubmit={handleSubmit}
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
            isLoading={saving}
          />
        </TabsContent>
        
        <TabsContent value="image">
          <EditProductImageSection 
            product={product}
            onImageUpdate={handleImageUpdate}
          />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">معاينة المنتج</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 bg-background rounded-lg shadow overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                لا توجد صورة
              </div>
            )}
          </div>
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold">{name}</h2>
            <div className="flex gap-2 my-1">
              {isNew && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">جديد</span>}
              {isPopular && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">الأكثر طلباً</span>}
              {category && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{category}</span>}
            </div>
            <p className="text-lg font-bold my-2">{parseFloat(price).toLocaleString()} دينار</p>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductContainer;
