import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { copyToClipboard } from "@/utils/clipboard";
import { Card, CardContent } from "@/components/ui/card";
import QrCodeModal from "./QrCodeModal";

const BASE_DOMAIN = "https://qrmenuc.com";

const DashboardActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStoreSlug = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: storeSettings } = await supabase
          .from("store_settings")
          .select("slug")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (storeSettings?.slug) {
          console.log("تم العثور على رابط المتجر:", storeSettings.slug);
          setStoreSlug(storeSettings.slug);
        } else {
          console.log("لم يتم العثور على رابط مخصص للمتجر");
        }
      } catch (error) {
        console.error("خطأ أثناء جلب رابط المتجر:", error);
      }
    };
    
    fetchStoreSlug();
  }, []);

  const getStoreShortUrl = async () => {
    if (storeSlug) {
      return `${BASE_DOMAIN}/${storeSlug}`;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: storeSettings } = await supabase
      .from("store_settings")
      .select("slug")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (storeSettings && storeSettings.slug) {
      setStoreSlug(storeSettings.slug);
      return `${BASE_DOMAIN}/${storeSettings.slug}`;
    }
    
    toast({
      title: "الرابط المخصص غير متوفر",
      description: "يرجى إعداد رابط مخصص في صفحة تخصيص المتجر أولاً",
      variant: "destructive",
      duration: 5000,
    });
    
    return null;
  };

  const handlePreviewProducts = async () => {
    try {
      if (storeSlug) {
        const previewUrl = `${BASE_DOMAIN}/${storeSlug}`;
        const newWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          toast({
            title: "تنبيه",
            description: "يرجى السماح بالنوافذ المنبثقة لفتح صفحة المعاينة",
            duration: 5000,
          });
          window.location.href = previewUrl;
        }
        return;
      }
      
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
      
      const { data: storeSettings } = await supabase
        .from("store_settings")
        .select("slug")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (!storeSettings || !storeSettings.slug) {
        toast({
          title: "خطأ",
          description: "تعذر الحصول على رابط المتجر. يرجى إعداد رابط مخصص في صفحة تخصيص المتجر أولاً",
          variant: "destructive",
          duration: 5000,
        });
        navigate("/store-customization");
        return;
      }

      setStoreSlug(storeSettings.slug);
      
      const previewUrl = `${BASE_DOMAIN}/${storeSettings.slug}`;
      
      const newWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        toast({
          title: "تنبيه",
          description: "يرجى السماح بالنوافذ المنبثقة لفتح صفحة المعاينة",
          duration: 5000,
        });
        window.location.href = previewUrl;
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
          description: "يرجى إعداد رابط مخصص في صفحة تخصيص المتجر أولاً",
          variant: "destructive",
          duration: 5000,
        });
        setIsCopying(false);
        navigate("/store-customization");
        return;
      }
      await copyToClipboard(url);
      toast({
        title: "تم النسخ!",
        description: `تم نسخ رابط المتجر: ${url}`,
        duration: 3000,
      });
      setTimeout(() => {
        setIsCopying(false);
      }, 3000);
    } catch (error) {
      console.error("Copy link error:", error);
      setIsCopying(false);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء نسخ الرابط",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const showQrCode = async () => {
    try {
      const url = await getStoreShortUrl();
      if (!url) {
        toast({
          title: "خطأ",
          description: "يرجى إعداد رابط مخصص في صفحة تخصيص المتجر أولاً",
          variant: "destructive",
          duration: 5000,
        });
        navigate("/store-customization");
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

  const actionButtons: any[] = [];

  return (
    <div className="space-y-6">
      {actionButtons.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-sm">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              لا توجد إجراءات سريعة متاحة حالياً
            </p>
          </CardContent>
        </Card>
      )}
      
      <QrCodeModal 
        isOpen={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        storeUrl={storeUrl}
      />
    </div>
  );
};

export default DashboardActions;
