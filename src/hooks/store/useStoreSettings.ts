
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialLinks, ContactInfo, FontSettings } from "@/types/store";
import { toast } from "sonner";

export const useStoreSettings = (slug: string | undefined) => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: null as string | null,
    colorTheme: "default",
    socialLinks: {} as SocialLinks,
    contactInfo: {} as ContactInfo,
    bannerUrl: null as string | null,
    fontSettings: undefined as FontSettings | undefined,
    storeOwnerId: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  // الإعدادات الافتراضية للخطوط إذا لم تكن موجودة في قاعدة البيانات
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

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        if (!slug) {
          console.error("No slug provided");
          setIsLoading(false);
          return;
        }

        console.log("Fetching store settings for slug:", slug);

        const { data: settings, error } = await supabase
          .from("store_settings")
          .select("user_id, store_name, color_theme, social_links, banner_url, font_settings, contact_info")
          .eq("slug", slug.trim())
          .maybeSingle();

        if (error) {
          console.error("Error fetching store settings:", error);
          toast.error("حدث خطأ في استرجاع إعدادات المتجر");
          setIsLoading(false);
          return;
        }

        if (!settings) {
          console.error("Store not found for slug:", slug);
          toast.error("لم يتم العثور على المتجر");
          setIsLoading(false);
          return;
        }

        console.log("Store settings fetched successfully:", settings);

        // تحويل بيانات الخطوط إلى النوع المطلوب بطريقة آمنة
        let parsedFontSettings: FontSettings = defaultFontSettings;
        
        if (settings.font_settings) {
          const fontData = settings.font_settings as any;
          
          // التحقق من أن البيانات تحتوي على العناصر اللازمة
          if (fontData.storeName && fontData.categoryText && fontData.generalText) {
            parsedFontSettings = {
              storeName: {
                family: fontData.storeName.family || "inherit",
                isCustom: fontData.storeName.isCustom || false,
                customFontUrl: fontData.storeName.customFontUrl || null,
              },
              categoryText: {
                family: fontData.categoryText.family || "inherit",
                isCustom: fontData.categoryText.isCustom || false,
                customFontUrl: fontData.categoryText.customFontUrl || null,
              },
              generalText: {
                family: fontData.generalText.family || "inherit",
                isCustom: fontData.generalText.isCustom || false,
                customFontUrl: fontData.generalText.customFontUrl || null,
              }
            };
          }
        }

        setStoreSettings({
          storeName: settings.store_name,
          colorTheme: settings.color_theme || "default",
          socialLinks: settings.social_links as SocialLinks || {},
          contactInfo: settings.contact_info as ContactInfo || {},
          bannerUrl: settings.banner_url,
          fontSettings: parsedFontSettings,
          storeOwnerId: settings.user_id,
        });

        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching settings:", error);
        toast.error("حدث خطأ في جلب معلومات المتجر");
        setIsLoading(false);
      }
    };

    fetchStoreSettings();
  }, [slug, navigate]);

  return { storeSettings, isLoading };
};
