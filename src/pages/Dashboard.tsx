import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Moon, Sun, Plus, Edit, Eye, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
        duration: 3000,
      });
      
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const copyProductLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const productsPageUrl = `${window.location.origin}/products/${user.id}`;
      
      // Create a temporary input element
      const tempInput = document.createElement('input');
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      tempInput.value = productsPageUrl;
      document.body.appendChild(tempInput);

      try {
        // Select the text and try to copy
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); // For mobile devices
        
        // Try to copy using document.execCommand
        const successful = document.execCommand('copy');
        
        if (successful) {
          toast({
            title: "تم نسخ الرابط بنجاح",
            description: "يمكنك الآن مشاركة رابط صفحة المنتجات",
            duration: 3000,
          });
        } else {
          throw new Error('نسخ غير ناجح');
        }
      } catch (err) {
        console.error("Copy error:", err);
        // If copying fails, show the URL to the user so they can copy manually
        toast({
          title: "تعذر النسخ التلقائي",
          description: "الرجاء نسخ الرابط يدوياً: " + productsPageUrl,
          duration: 5000,
        });
      } finally {
        // Clean up
        document.body.removeChild(tempInput);
      }
    } catch (error) {
      console.error("Copy link error:", error);
      toast({
        title: "تعذر نسخ الرابط",
        description: "الرجاء المحاولة مرة أخرى",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex justify-center items-center border-b relative">
        <h1 className="text-2xl font-bold">مرحباً بك في لوحة التحكم</h1>
        <div className="absolute right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "light" ? (
                  <Moon className="ml-2 h-4 w-4" />
                ) : (
                  <Sun className="ml-2 h-4 w-4" />
                )}
                {theme === "light" ? "الوضع المظلم" : "الوضع المضيء"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid gap-6">
          <div className="rounded-lg border p-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="w-48" onClick={() => navigate("/add-product")}>
                <Plus className="ml-2" />
                إضافة منتج
              </Button>
              
              <Button 
                variant="secondary" 
                className="w-48"
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    const { data: products } = await supabase
                      .from("products")
                      .select("id")
                      .eq("user_id", user.id)
                      .limit(1);
                    
                    if (products && products.length > 0) {
                      navigate(`/edit-product/${products[0].id}`);
                    } else {
                      toast({
                        title: "لا توجد منتجات",
                        description: "قم بإضافة منتج أولاً",
                        duration: 3000,
                      });
                    }
                  }
                }}
              >
                <Edit className="ml-2" />
                تعديل المنتجات
              </Button>
              
              <Button 
                variant="outline" 
                className="w-48"
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    navigate(`/products/${user.id}`);
                  }
                }}
              >
                <Eye className="ml-2" />
                معاينة المنتجات
              </Button>
              
              <Button variant="secondary" className="w-48">
                <Settings className="ml-2" />
                تخصيص الصفحة
              </Button>
              
              <Button variant="outline" className="w-48" onClick={copyProductLink}>
                <Link2 className="ml-2" />
                نسخ رابط المنتجات
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
