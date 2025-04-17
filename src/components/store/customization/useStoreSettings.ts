
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialLinks, ContactInfo, FontSettings } from "./types";

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

export const useStoreSettings = () => {
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
  const { toast } = useToast();

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

      // تحديث الحالة المحلية
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

  return {
    storeName,
    setStoreName,
    storeSlug,
    setStoreSlug,
    colorTheme,
    setColorTheme,
    bannerUrl,
    setBannerUrl,
    fontSettings,
    setFontSettings,
    contactInfo,
    setContactInfo,
    socialLinks,
    setSocialLinks,
    isLoading,
    saveStoreSettings
  };
};
