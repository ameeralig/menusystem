import { Button } from "@/components/ui/button";
import { Plus, Edit, Eye, Link2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DashboardActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = productsPageUrl;
      textarea.style.position = 'fixed'; // Prevent scrolling to bottom
      document.body.appendChild(textarea);
      
      try {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        toast({
          title: "تم نسخ الرابط بنجاح",
          description: "يمكنك الآن مشاركة رابط صفحة المنتجات",
          duration: 3000,
        });
      } catch (err) {
        // Fallback if execCommand fails
        navigator.clipboard.writeText(productsPageUrl)
          .then(() => {
            toast({
              title: "تم نسخ الرابط بنجاح",
              description: "يمكنك الآن مشاركة رابط صفحة المنتجات",
              duration: 3000,
            });
          })
          .catch(() => {
            toast({
              title: "تعذر النسخ التلقائي",
              description: "الرابط: " + productsPageUrl,
              duration: 5000,
            });
          });
      } finally {
        // Ensure textarea is removed
        if (document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
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
        
        <Button 
          variant="secondary" 
          className="w-48"
          onClick={() => navigate("/store-customization")}
        >
          <Settings className="ml-2" />
          تخصيص الصفحة
        </Button>
        
        <Button variant="outline" className="w-48" onClick={copyProductLink}>
          <Link2 className="ml-2" />
          نسخ رابط المنتجات
        </Button>
      </div>
    </div>
  );
};

export default DashboardActions;