import { Plus, Edit, Eye, Link2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { copyToClipboard } from "@/utils/clipboard";
import DashboardActionButton from "./DashboardActionButton";

const DashboardActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const handleEditProducts = async () => {
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
  };

  const handlePreviewProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate(`/products/${user.id}`);
    }
  };

  const copyProductLink = async () => {
    try {
      setIsCopying(true);
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
      await copyToClipboard(productsPageUrl);
      
      // Reset button state after 3 seconds
      setTimeout(() => {
        setIsCopying(false);
      }, 3000);
    } catch (error) {
      console.error("Copy link error:", error);
      setIsCopying(false);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap gap-4 justify-center">
        <DashboardActionButton
          icon={Plus}
          label="إضافة منتج"
          onClick={() => navigate("/add-product")}
        />
        
        <DashboardActionButton
          icon={Edit}
          label="تعديل المنتجات"
          onClick={handleEditProducts}
          variant="secondary"
        />
        
        <DashboardActionButton
          icon={Eye}
          label="معاينة المنتجات"
          onClick={handlePreviewProducts}
          variant="outline"
        />
        
        <DashboardActionButton
          icon={Settings}
          label="تخصيص الصفحة"
          onClick={() => navigate("/store-customization")}
          variant="secondary"
        />
        
        <DashboardActionButton
          icon={Link2}
          label={isCopying ? "تم النسخ ✅" : "نسخ رابط المنتجات"}
          onClick={copyProductLink}
          variant="outline"
          disabled={isCopying}
        />
      </div>
    </div>
  );
};

export default DashboardActions;