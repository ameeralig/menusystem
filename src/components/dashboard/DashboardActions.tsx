
import { Plus, Edit, Eye, Link2, Settings, MessageSquare, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { copyToClipboard } from "@/utils/clipboard";
import DashboardActionButton from "./DashboardActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QrCodeModal from "./QrCodeModal";

const BASE_DOMAIN = "https://qrmenuc.com";

const DashboardActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");

  const getStoreShortUrl = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: storeSettings } = await supabase
      .from("store_settings")
      .select("slug")
      .eq("user_id", user.id)
      .maybeSingle();
    if (storeSettings && storeSettings.slug) {
      return `${BASE_DOMAIN}/${storeSettings.slug}`;
    }
    return null;
  };

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
    try {
      const url = await getStoreShortUrl();
      
      if (!url) {
        toast({
          title: "خطأ",
          description: "تعذر الحصول على رابط المتجر",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      // استخراج الجزء الأخير من الرابط (slug)
      const slug = url.split('/').pop();
      console.log("تم العثور على slug:", slug);
      
      // الانتقال مباشرة إلى صفحة معاينة المنتجات باستخدام الرابط المباشر
      if (slug) {
        // فتح الرابط في نافذة جديدة بدلاً من استخدام navigate
        // للتأكد من تحميل أحدث المحتوى وتجنب مشاكل الذاكرة المخبأة
        window.open(`${BASE_DOMAIN}/${slug}?t=${new Date().getTime()}`, '_blank');
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء معاينة المنتجات",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const copyProductLink = async () => {
    try {
      setIsCopying(true);
      const url = await getStoreShortUrl();
      if (!url) {
        toast({
          title: "خطأ",
          description: "تعذر جلب رابط المتجر المختصر",
          variant: "destructive",
          duration: 3000,
        });
        setIsCopying(false);
        return;
      }
      await copyToClipboard(url);
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
      const url = await getStoreShortUrl();
      if (!url) {
        toast({
          title: "خطأ",
          description: "تعذر جلب رابط المتجر المختصر",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      setStoreUrl(url);
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
