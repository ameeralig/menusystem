import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
}

const EditProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [toast]);

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

  if (loading) {
    return <div className="container mx-auto py-8 text-center">جاري التحميل...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">تعديل المنتجات</h1>
        <p>لا توجد منتجات متاحة</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">تعديل المنتجات</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم المنتج</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price} دينار عراقي</TableCell>
                <TableCell>{product.category || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/edit-product/${product.id}`)}
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EditProduct;