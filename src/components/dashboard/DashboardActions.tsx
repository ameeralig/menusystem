
import { Plus, Edit, Eye, Link2, Settings, MessageSquare, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  // جلب النطاق الفرعي للمتجر عند تحميل المكون
  useEffect(() => {
    const fetchStoreSlug = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from("store_settings")
        .select("slug")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (error) {
        console.error("خطأ في جلب النطاق الفرعي:", error);
        return;
      }
      
      if (data && data.slug) {
        setStoreSlug(data.slug);
      }
    };
    
    fetchStoreSlug();
  }, []);

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
    // التحقق من وجود نطاق فرعي قبل السماح بمعاينة المنتجات
    if (storeSlug) {
      window.open(`https://${storeSlug}.qrmenuc.com`, '_blank');
    } else {
      toast({
        title: "تعيين النطاق الفرعي",
        description: "يجب تعيين نطاق فرعي للمتجر أولاً من إعدادات التخصيص",
        duration: 3000,
      });
      navigate('/store-customization');
    }
  };

  const copyProductLink = async () => {
    try {
      setIsCopying(true);
      
      if (!storeSlug) {
        toast({
          title: "تعيين النطاق الفرعي",
          description: "يجب تعيين نطاق فرعي للمتجر أولاً من إعدادات التخصيص",
          variant: "destructive",
          duration: 3000,
        });
        setIsCopying(false);
        navigate('/store-customization');
        return;
      }
      
      const storePageUrl = `https://${storeSlug}.qrmenuc.com`;
      await copyToClipboard(storePageUrl);
      
      toast({
        title: "تم النسخ",
        description: `تم نسخ الرابط: ${storePageUrl}`,
        duration: 3000,
      });
      
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
      if (!storeSlug) {
        toast({
          title: "تعيين النطاق الفرعي",
          description: "يجب تعيين نطاق فرعي للمتجر أولاً من إعدادات التخصيص",
          variant: "destructive",
          duration: 3000,
        });
        navigate('/store-customization');
        return;
      }
      
      const storePageUrl = `https://${storeSlug}.qrmenuc.com`;
      setStoreUrl(storePageUrl);
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
    },
    {
      icon: Edit,
      label: "تعديل المنتجات",
      onClick: handleEditProducts,
    },
    {
      icon: Eye,
      label: "معاينة المنتجات",
      onClick: handlePreviewProducts,
    },
    {
      icon: Settings,
      label: "تخصيص الصفحة",
      onClick: () => navigate("/store-customization"),
    },
    {
      icon: Link2,
      label: isCopying ? "تم النسخ ✅" : "نسخ رابط المنتجات",
      onClick: copyProductLink,
      disabled: isCopying,
    },
    {
      icon: QrCode,
      label: "إنشاء رمز QR",
      onClick: showQrCode,
    },
    {
      icon: MessageSquare,
      label: "الشكاوى والاقتراحات",
      onClick: () => navigate("/feedback"),
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
