import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
}

const EditProduct = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) throw error;

        if (data) {
          setProduct(data);
          setName(data.name);
          setDescription(data.description || "");
          setPrice(data.price.toString());
          setCategory(data.category || "");
          setImageUrl(data.image_url || "");
        }
      } catch (error: any) {
        console.error("Error fetching product:", error);
        toast({
          title: "خطأ في تحميل بيانات المنتج",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name,
          description,
          price: parseFloat(price),
          category,
          image_url: imageUrl,
        })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "تم تحديث المنتج بنجاح",
        duration: 3000,
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        title: "خطأ في تحديث المنتج",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "تم حذف المنتج بنجاح",
        duration: 3000,
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "خطأ في حذف المنتج",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">جاري التحميل...</div>;
  }

  if (!product) {
    return <div className="container mx-auto py-8 text-center">لم يتم العثور على المنتج</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">تعديل المنتج</h1>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="ml-2" />
            حذف المنتج
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              اسم المنتج
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              وصف المنتج
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              السعر (دينار عراقي)
            </label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              التصنيف
            </label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
              رابط الصورة
            </label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit">حفظ التغييرات</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;