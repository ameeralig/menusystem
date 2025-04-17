
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";
import BannerImageUploader from "@/components/store/BannerImageUploader";
import SocialLinksEditor from "@/components/store/SocialLinksEditor";
import FontStyleSelector from "@/components/store/FontStyleSelector";
import ContactInfoEditor from "@/components/store/ContactInfoEditor";
import { Card } from "@/components/ui/card";
import QrCodeModal from "@/components/dashboard/QrCodeModal";

type SocialLinks = {
  instagram: string;
  facebook: string;
  telegram: string;
};

type ContactInfo = {
  description: string;
  address: string;
  phone: string;
  wifi: string;
  businessHours: string;
};

type FontSettings = {
  storeName: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  categoryText: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  generalText: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
};

const defaultFontSettings: FontSettings = {
  storeName: {
    family: "inherit",
    isCustom: false,
    customFontUrl: null,
  },
  categoryText: {
    family: "inherit",
    isCustom: false,
    customFontUrl: null,
  },
  generalText: {
    family: "inherit",
    isCustom: false,
    customFontUrl: null,
  },
};

const defaultContactInfo: ContactInfo = {
  description: "",
  address: "",
  phone: "",
  wifi: "",
  businessHours: "",
};

const StoreCustomization = () => {
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [colorTheme, setColorTheme] = useState("default");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [fontSettings, setFontSettings] = useState<FontSettings>(defaultFontSettings);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "",
    facebook: "",
    telegram: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: storeSettings, error } = await supabase
        .from("store_settings")
        .select("store_name, color_theme, slug, social_links, banner_url, font_settings, contact_info")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching store settings:", error);
        return;
      }

      if (storeSettings) {
        setStoreName(storeSettings.store_name || "");
        setColorTheme(storeSettings.color_theme || "default");
        setStoreSlug(storeSettings.slug || "");
        setBannerUrl(storeSettings.banner_url || null);
        
        if (storeSettings.social_links) {
          setSocialLinks({
            instagram: (storeSettings.social_links as SocialLinks)?.instagram || "",
            facebook: (storeSettings.social_links as SocialLinks)?.facebook || "",
            telegram: (storeSettings.social_links as SocialLinks)?.telegram || "",
          });
        }
        
        if (storeSettings.font_settings) {
          setFontSettings(storeSettings.font_settings as FontSettings || defaultFontSettings);
        }
        
        if (storeSettings.contact_info) {
          setContactInfo({
            description: (storeSettings.contact_info as ContactInfo)?.description || "",
            address: (storeSettings.contact_info as ContactInfo)?.address || "",
            phone: (storeSettings.contact_info as ContactInfo)?.phone || "",
            wifi: (storeSettings.contact_info as ContactInfo)?.wifi || "",
            businessHours: (storeSettings.contact_info as ContactInfo)?.businessHours || "",
          });
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
    contact_info: ContactInfo;
  }>) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const { data: existingSettings, error: checkError } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing settings:", checkError);
      }

      if (updatedData.slug !== undefined && updatedData.slug.trim() !== '') {
        const { data: existingSlug, error: slugError } = await supabase
          .from("store_settings")
          .select("user_id")
          .eq("slug", updatedData.slug)
          .neq("user_id", user.id)
          .maybeSingle();

        if (slugError) {
          console.error("Error checking existing slug:", slugError);
        }

        if (existingSlug) {
          throw new Error("هذا الرابط مستخدم بالفعل، الرجاء اختيار رابط آخر");
        }
      }

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
        throw result.error;
      }

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات المتجر",
        duration: 3000,
      });

      if (updatedData.store_name !== undefined) setStoreName(updatedData.store_name);
      if (updatedData.color_theme !== undefined) setColorTheme(updatedData.color_theme);
      if (updatedData.slug !== undefined) setStoreSlug(updatedData.slug);
      if (updatedData.social_links !== undefined) setSocialLinks(updatedData.social_links);
      if (updatedData.banner_url !== undefined) setBannerUrl(updatedData.banner_url);
      if (updatedData.font_settings !== undefined) setFontSettings(updatedData.font_settings);
      if (updatedData.contact_info !== undefined) setContactInfo(updatedData.contact_info);

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

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings({ store_name: storeName });
  };

  const handleSlugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رابط صالح للمتجر",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    await saveStoreSettings({ slug: storeSlug });
  };

  // تعديل دوال المعالجة لتتناسب مع نوع البيانات المتوقع
  const handleColorThemeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await saveStoreSettings({ color_theme: colorTheme });
  };

  const handleBannerSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await saveStoreSettings({ banner_url: bannerUrl });
  };

  const handleFontSettingsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await saveStoreSettings({ font_settings: fontSettings });
  };

  const handleSocialLinksSubmit = async (links: SocialLinks) => {
    await saveStoreSettings({ social_links: links });
  };

  const handleContactInfoSubmit = async (info: ContactInfo) => {
    await saveStoreSettings({ contact_info: info });
  };

  const getStoreUrl = () => {
    return storeSlug ? `menusystem.lovable.app/${storeSlug}` : '';
  };

  const openQrModal = () => {
    if (!storeSlug) {
      toast({
        title: "تنبيه",
        description: "الرجاء تعيين رابط للمتجر أولاً",
        duration: 3000,
      });
      return;
    }
    setIsQrModalOpen(true);
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
                  handleSubmit={handleNameSubmit}
                  isLoading={isLoading}
                />
                
                <div className="space-y-3">
                  <StoreSlugEditor
                    storeSlug={storeSlug}
                    setStoreSlug={setStoreSlug}
                    isEditing={isSlugEditing}
                    setIsEditing={setIsSlugEditing}
                    handleSubmit={handleSlugSubmit}
                    isLoading={isLoading}
                  />
                  
                  {storeSlug && (
                    <div className="mt-2 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={openQrModal}
                        className="flex items-center gap-2 text-sm"
                      >
                        <QrCode className="h-4 w-4" />
                        عرض رمز QR للمتجر
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-right">معلومات المتجر</h2>
              <ContactInfoEditor 
                initialContactInfo={contactInfo}
                onSave={handleContactInfoSubmit}
                isLoading={isLoading}
              />
            </Card>
            
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-right">المظهر والتخصيص</h2>
              <div className="space-y-6">
                <BannerImageUploader 
                  bannerUrl={bannerUrl}
                  setBannerUrl={setBannerUrl}
                  handleSubmit={handleBannerSubmit}
                  isLoading={isLoading}
                />
                
                <ColorThemeSelector 
                  colorTheme={colorTheme}
                  setColorTheme={setColorTheme}
                  handleSubmit={handleColorThemeSubmit}
                  isLoading={isLoading}
                />
                
                <h3 className="text-lg font-medium mt-6 mb-2 text-right">تخصيص الخطوط</h3>
                <FontStyleSelector
                  fontSettings={fontSettings}
                  setFontSettings={setFontSettings}
                  handleSubmit={handleFontSettingsSubmit}
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

      <QrCodeModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
        storeUrl={getStoreUrl()}
      />
    </div>
  );
};

export default StoreCustomization;
