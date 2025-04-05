import { Plus, Edit, Eye, Link2, Settings, MessageSquare, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { copyToClipboard } from "@/utils/clipboard";
import DashboardActionButton from "./DashboardActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QrCodeModal from "./QrCodeModal";

const DashboardActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");

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
      
      setTimeout(() => {
        setIsCopying(false);
      }, 3000);
    } catch (error) {
      console.error("Copy link error:", error);
      setIsCopying(false);
    }
  };

  const showQrCode = async () => {
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
      setStoreUrl(productsPageUrl);
      setQrModalOpen(true);
    } catch (error) {
      console.error("QR code generation error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء رمز QR",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const actionButtons = [
    {
      icon: Plus,
      label: "إضافة منتج",
      onClick: () => navigate("/add-product"),
      variant: "default" as const,
    },
    {
      icon: Edit,
      label: "تعديل المنتجات",
      onClick: handleEditProducts,
      variant: "default" as const,
    },
    {
      icon: Eye,
      label: "معاينة المنتجات",
      onClick: handlePreviewProducts,
      variant: "secondary" as const,
    },
    {
      icon: Settings,
      label: "تخصيص الصفحة",
      onClick: () => navigate("/store-customization"),
      variant: "secondary" as const,
    },
    {
      icon: Link2,
      label: isCopying ? "تم النسخ ✅" : "نسخ رابط المنتجات",
      onClick: copyProductLink,
      variant: "outline" as const,
      disabled: isCopying,
    },
    {
      icon: QrCode,
      label: "إنشاء رمز QR",
      onClick: showQrCode,
      variant: "outline" as const,
    },
    {
      icon: MessageSquare,
      label: "الشكاوى والاقتراحات",
      onClick: () => navigate("/feedback"),
      variant: "outline" as const,
    },
  ];

  return (
    <Card className="border border-border/60 bg-background/95 backdrop-blur-sm shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">الإجراءات السريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionButtons.map((button, index) => (
            <DashboardActionButton
              key={index}
              icon={button.icon}
              label={button.label}
              onClick={button.onClick}
              variant={button.variant}
              disabled={button.disabled}
            />
          ))}
        </div>
      </CardContent>
      <QrCodeModal 
        isOpen={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        storeUrl={storeUrl}
      />
    </Card>
  );
};

export default DashboardActions;
