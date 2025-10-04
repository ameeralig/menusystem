import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/types/employee";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Package, ShoppingCart, ClipboardList, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductsTable from "@/components/products/ProductsTable";
import { Spinner } from "@/components/ui/spinner";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [storeOwnerId, setStoreOwnerId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkEmployeeAuth();
  }, []);

  const checkEmployeeAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      // التحقق من أن المستخدم موظف نشط
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*, store_owner_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (employeeError || !employeeData) {
        toast({
          variant: "destructive",
          title: "غير مصرح",
          description: "ليس لديك صلاحية الوصول لهذه الصفحة"
        });
        navigate('/');
        return;
      }

      setEmployee(employeeData);
      setStoreOwnerId(employeeData.store_owner_id);
      await fetchProducts(employeeData.store_owner_id);
    } catch (error) {
      console.error("Error checking employee auth:", error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (ownerId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء جلب المنتجات"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح"
      });

      await fetchProducts(storeOwnerId);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المنتج"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                لوحة تحكم الموظف
              </h1>
              <p className="text-muted-foreground mt-1">
                مرحباً، {employee?.full_name}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل خروج
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي المنتجات
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                المنتجات المتاحة
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.is_available).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الطلبات النشطة
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة منتج
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <ProductsTable 
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-bold">الطلبات</h2>
            <Card>
              <CardContent className="p-6 text-center py-12">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">قريباً - إدارة الطلبات</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
