
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialLinks, ContactInfo, FontSettings } from "./types";
import { Json } from "@/integrations/supabase/types";

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
  const [customDomain, setCustomDomain] = useState<string>("");
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
        .select("store_name, color_theme, slug, social_links, banner_url, font_settings, contact_info, custom_domain")
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
        setCustomDomain(storeSettings.custom_domain || "");
        
        if (storeSettings.social_links) {
          // استخدام الـ type assertion للتحويل الآمن من Json إلى SocialLinks
          const socialLinksData = storeSettings.social_links as Record<string, any>;
          setSocialLinks({
            instagram: socialLinksData?.instagram || "",
            facebook: socialLinksData?.facebook || "",
            telegram: socialLinksData?.telegram || "",
          });
        }
        
        if (storeSettings.font_settings) {
          // استخدام الـ type assertion للتحويل الآمن من Json إلى FontSettings
          const fontSettingsData = storeSettings.font_settings as Record<string, any>;
          
          setFontSettings({
            storeName: {
              family: fontSettingsData?.storeName?.family || "inherit",
              isCustom: fontSettingsData?.storeName?.isCustom || false,
              customFontUrl: fontSettingsData?.storeName?.customFontUrl || null,
            },
            categoryText: {
              family: fontSettingsData?.categoryText?.family || "inherit",
              isCustom: fontSettingsData?.categoryText?.isCustom || false,
              customFontUrl: fontSettingsData?.categoryText?.customFontUrl || null,
            },
            generalText: {
              family: fontSettingsData?.generalText?.family || "inherit",
              isCustom: fontSettingsData?.generalText?.isCustom || false,
              customFontUrl: fontSettingsData?.generalText?.customFontUrl || null,
            }
          });
        }
        
        if (storeSettings.contact_info) {
          // استخدام الـ type assertion للتحويل الآمن من Json إلى ContactInfo
          const contactInfoData = storeSettings.contact_info as Record<string, any>;
          setContactInfo({
            description: contactInfoData?.description || "",
            address: contactInfoData?.address || "",
            phone: contactInfoData?.phone || "",
            wifi: contactInfoData?.wifi || "",
            businessHours: contactInfoData?.businessHours || "",
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
    custom_domain: string;
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

      // تحويل الكائنات المخصصة إلى Json قبل الإرسال إلى Supabase
      const dataToUpdate: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (updatedData.store_name !== undefined) dataToUpdate.store_name = updatedData.store_name;
      if (updatedData.color_theme !== undefined) dataToUpdate.color_theme = updatedData.color_theme;
      if (updatedData.slug !== undefined) dataToUpdate.slug = updatedData.slug;
      if (updatedData.banner_url !== undefined) dataToUpdate.banner_url = updatedData.banner_url;
      if (updatedData.custom_domain !== undefined) dataToUpdate.custom_domain = updatedData.custom_domain;
      
      // تحويل الأنواع المخصصة إلى Json
      if (updatedData.social_links !== undefined) {
        dataToUpdate.social_links = updatedData.social_links as unknown as Json;
      }
      
      if (updatedData.font_settings !== undefined) {
        dataToUpdate.font_settings = updatedData.font_settings as unknown as Json;
      }
      
      if (updatedData.contact_info !== undefined) {
        dataToUpdate.contact_info = updatedData.contact_info as unknown as Json;
      }

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
      if (updatedData.custom_domain !== undefined) setCustomDomain(updatedData.custom_domain);
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
    customDomain,
    setCustomDomain,
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

