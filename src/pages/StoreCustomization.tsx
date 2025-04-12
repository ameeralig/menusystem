
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";
import BannerImageUploader from "@/components/store/BannerImageUploader";
import SocialLinksEditor from "@/components/store/SocialLinksEditor";
import FontStyleSelector, { FontSettings } from "@/components/store/FontStyleSelector";
import { Card } from "@/components/ui/card";

type SocialLinks = {
  instagram: string;
  facebook: string;
  telegram: string;
};

const StoreCustomization = () => {
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [colorTheme, setColorTheme] = useState("default");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "",
    facebook: "",
    telegram: "",
  });
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    storeName: {
      fontFamily: "sans-serif",
      customFont: null,
    },
    categories: {
      fontFamily: "sans-serif",
      customFont: null,
    },
    general: {
      fontFamily: "sans-serif",
      customFont: null,
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: storeSettings } = await supabase
        .from("store_settings")
        .select("store_name, color_theme, slug, social_links, banner_url, font_settings")
        .eq("user_id", user.id)
        .single();

      if (storeSettings) {
        setStoreName(storeSettings.store_name || "");
        setColorTheme(storeSettings.color_theme || "default");
        setStoreSlug(storeSettings.slug || "");
        setBannerUrl(storeSettings.banner_url || null);
        setSocialLinks({
          instagram: (storeSettings.social_links as SocialLinks)?.instagram || "",
          facebook: (storeSettings.social_links as SocialLinks)?.facebook || "",
          telegram: (storeSettings.social_links as SocialLinks)?.telegram || "",
        });
        
        // تحميل إعدادات الخطوط إن وجدت
        if (storeSettings.font_settings) {
          setFontSettings(storeSettings.font_settings as FontSettings);
        }
      }
    } catch (error) {
      console.error("Error fetching store settings:", error);
    }
  };

  const saveStoreSettings = async (updatedData: Partial<{
    store_name: string;
    color_theme: string;
    slug: string;
    social_links: SocialLinks;
    banner_url: string | null;
    font_settings: FontSettings;
  }>) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const { data: existingSettings } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      const dataToUpdate = {
        ...updatedData,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingSettings) {
        result = await supabase
          .from("store_settings")
          .update(dataToUpdate)
          .eq("user_id", user.id);
      } else {
        result = await supabase
          .from("store_settings")
          .insert([{ 
            user_id: user.id,
            ...dataToUpdate
          }]);
      }

      if (result.error) {
        if (result.error.code === '23505') {
          throw new Error("هذا الرابط مستخدم بالفعل، الرجاء اختيار رابط آخر");
        }
        throw result.error;
      }

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات المتجر",
        duration: 3000,
      });

      // Update local state for any settings that were changed
      if (updatedData.store_name !== undefined) setStoreName(updatedData.store_name);
      if (updatedData.color_theme !== undefined) setColorTheme(updatedData.color_theme);
      if (updatedData.slug !== undefined) setStoreSlug(updatedData.slug);
      if (updatedData.social_links !== undefined) setSocialLinks(updatedData.social_links);
      if (updatedData.banner_url !== undefined) setBannerUrl(updatedData.banner_url);
      if (updatedData.font_settings !== undefined) setFontSettings(updatedData.font_settings);

    } catch (error: any) {
      console.error("Error saving store settings:", error);
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    await saveStoreSettings({ store_name: storeName });
  };

  const handleSlugSubmit = async () => {
    await saveStoreSettings({ slug: storeSlug });
  };

  const handleColorThemeSubmit = async () => {
    await saveStoreSettings({ color_theme: colorTheme });
  };

  const handleBannerSubmit = async () => {
    await saveStoreSettings({ banner_url: bannerUrl });
  };

  const handleSocialLinksSubmit = async (links: SocialLinks) => {
    await saveStoreSettings({ social_links: links });
  };
  
  const handleFontSettingsSubmit = async (settings: FontSettings) => {
    await saveStoreSettings({ font_settings: settings });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-4 sm:p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="ml-2" />
          العودة للوحة التحكم
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <h1 className="text-3xl font-bold mb-6 text-right">تخصيص المتجر</h1>
          
          <div className="grid gap-6">
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-right">المعلومات الأساسية</h2>
              <div className="space-y-6">
                <StoreNameEditor 
                  storeName={storeName}
                  setStoreName={setStoreName}
                  isEditing={false}
                  setIsEditing={() => {}}
                  handleSubmit={async () => { await handleNameSubmit(); }}
                  isLoading={isLoading}
                />
                
                <StoreSlugEditor
                  storeSlug={storeSlug}
                  setStoreSlug={setStoreSlug}
                  isEditing={false}
                  setIsEditing={() => {}}
                  handleSubmit={async () => { await handleSlugSubmit(); }}
                  isLoading={isLoading}
                />
              </div>
            </Card>
            
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-right">المظهر والتخصيص</h2>
              <div className="space-y-6">
                <BannerImageUploader 
                  bannerUrl={bannerUrl}
                  setBannerUrl={setBannerUrl}
                  handleSubmit={async () => { await handleBannerSubmit(); }}
                  isLoading={isLoading}
                />
                
                <ColorThemeSelector 
                  colorTheme={colorTheme}
                  setColorTheme={setColorTheme}
                  handleSubmit={async () => { await handleColorThemeSubmit(); }}
                  isLoading={isLoading}
                />
                
                <FontStyleSelector
                  initialFontSettings={fontSettings}
                  onSave={handleFontSettingsSubmit}
                  isLoading={isLoading}
                />
              </div>
            </Card>
            
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-right">روابط التواصل</h2>
              <SocialLinksEditor 
                initialSocialLinks={socialLinks}
                onSave={handleSocialLinksSubmit}
                isLoading={isLoading}
              />
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StoreCustomization;
