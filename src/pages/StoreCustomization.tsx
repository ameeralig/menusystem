import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StoreDetailsSection from "@/components/store/customization/StoreDetailsSection";
import ContactInfoSection from "@/components/store/customization/ContactInfoSection";
import AppearanceSection from "@/components/store/customization/AppearanceSection";
import SocialLinksSection from "@/components/store/customization/SocialLinksSection";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import DemoProductsDisplay from "@/components/demo/DemoProductsDisplay";
import { toast as sonnerToast } from "sonner";

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
  const [dummyProducts, setDummyProducts] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStoreSettings();
    fetchDummyProducts();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // التوجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مسجلاً
        sonnerToast.error("يجب تسجيل الدخول أولاً");
        navigate('/auth/login');
        return;
      }

      const { data: storeSettings, error } = await supabase
        .from("store_settings")
        .select("store_name, color_theme, slug, social_links, banner_url, font_settings, contact_info")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching store settings:", error);
        sonnerToast.error("حدث خطأ أثناء جلب إعدادات المتجر");
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
      sonnerToast.error("حدث خطأ أثناء جلب إعدادات المتجر");
    }
  };

  const fetchDummyProducts = async () => {
    setDummyProducts([
      {
        id: 1,
        name: "منتج تجريبي 1",
        description: "وصف للمنتج التجريبي الأول",
        price: 100,
        category: "تصنيف 1",
        image_url: "https://placehold.co/300x200"
      },
      {
        id: 2,
        name: "منتج تجريبي 2",
        description: "وصف للمنتج التجريبي الثاني",
        price: 200,
        category: "تصنيف 1",
        image_url: "https://placehold.co/300x200"
      },
      {
        id: 3,
        name: "منتج تجريبي 3",
        description: "وصف للمنتج التجريبي الثالث",
        price: 150,
        category: "تصنيف 2",
        image_url: "https://placehold.co/300x200"
      }
    ]);
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

  const handleNameSubmit = async () => {
    if (!storeName.trim()) {
      toast({
        title: "خطأ",
        description: "اسم المتجر مطلوب",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    await saveStoreSettings({ store_name: storeName });
  };

  const handleSlugSubmit = async () => {
    if (!storeSlug.trim()) {
      toast({
        title: "خطأ",
        description: "رابط المتجر مطلوب",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      await saveStoreSettings({ slug: storeSlug.trim() });
    } catch (error: any) {
      console.error("Error saving store slug:", error);
      toast({
        title: "حدث خطأ",
        description: error.message || "فشل في حفظ رابط المتجر",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleColorThemeSubmit = async () => {
    await saveStoreSettings({ color_theme: colorTheme });
  };

  const handleBannerSubmit = async () => {
    await saveStoreSettings({ banner_url: bannerUrl });
  };

  const handleFontSettingsSubmit = async () => {
    await saveStoreSettings({ font_settings: fontSettings });
  };

  const handleSocialLinksSubmit = async (links: SocialLinks) => {
    await saveStoreSettings({ social_links: links });
  };

  const handleContactInfoSubmit = async (info: ContactInfo) => {
    await saveStoreSettings({ contact_info: info });
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

        <h1 className="text-3xl font-bold mb-6 text-right">تخصيص المتجر</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-right">معاينة المتجر</h2>
              <div className="border rounded-lg overflow-hidden shadow-md max-h-[600px] overflow-y-auto">
                <ProductPreviewContainer 
                  colorTheme={colorTheme} 
                  bannerUrl={bannerUrl}
                  fontSettings={fontSettings}
                  containerHeight="auto"
                >
                  <DemoProductsDisplay 
                    products={dummyProducts} 
                    storeName={storeName || "اسم المتجر"} 
                    colorTheme={colorTheme}
                    fontSettings={fontSettings}
                    categoryImages={[]}
                  />
                </ProductPreviewContainer>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            <StoreDetailsSection 
              storeName={storeName}
              setStoreName={setStoreName}
              storeSlug={storeSlug}
              setStoreSlug={setStoreSlug}
              handleNameSubmit={handleNameSubmit}
              handleSlugSubmit={handleSlugSubmit}
              isLoading={isLoading}
            />

            <ContactInfoSection 
              contactInfo={contactInfo}
              handleContactInfoSubmit={handleContactInfoSubmit}
              isLoading={isLoading}
            />

            <AppearanceSection 
              colorTheme={colorTheme}
              setColorTheme={setColorTheme}
              bannerUrl={bannerUrl}
              setBannerUrl={setBannerUrl}
              fontSettings={fontSettings}
              setFontSettings={setFontSettings}
              handleColorThemeSubmit={handleColorThemeSubmit}
              handleBannerSubmit={handleBannerSubmit}
              handleFontSettingsSubmit={handleFontSettingsSubmit}
              isLoading={isLoading}
            />

            <SocialLinksSection 
              socialLinks={socialLinks}
              handleSocialLinksSubmit={handleSocialLinksSubmit}
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default StoreCustomization;
