
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoreSettings {
  storeOwnerId: string | null;
  storeName: string | null;
  slug: string | null;
  colorTheme: string | null;
  socialLinks: {
    facebook?: string | null;
    instagram?: string | null;
    telegram?: string | null;
  } | null;
  contactInfo: {
    description?: string | null;
    address?: string | null;
    phone?: string | null;
    wifi?: string | null;
    businessHours?: string | null;
  } | null;
  bannerUrl: string | null;
  fontSettings: {
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
  } | null;
}

export const useStoreSettings = (slug: string | undefined) => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeOwnerId: null,
    storeName: null,
    slug: null,
    colorTheme: null,
    socialLinks: null,
    contactInfo: null,
    bannerUrl: null,
    fontSettings: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        if (!slug) {
          console.log("No slug provided to useStoreSettings, skipping fetch");
          setIsLoading(false);
          return;
        }

        console.log("Fetching store settings for slug:", slug);
        
        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            console.log("No store settings found for slug:", slug);
          } else {
            console.error("Error fetching store settings:", error);
            toast.error("خطأ في جلب إعدادات المتجر");
          }
          setIsLoading(false);
          return;
        }

        // إضافة معرف زمني للصورة لتجنب التخزين المؤقت
        let bannerUrl = data.banner_url;
        if (bannerUrl) {
          const timestamp = new Date().getTime();
          const baseUrl = bannerUrl.split('?')[0];
          bannerUrl = `${baseUrl}?t=${timestamp}`;
        }

        console.log("Store settings fetched successfully:", {
          ...data,
          banner_url: bannerUrl
        });

        setStoreSettings({
          storeOwnerId: data.user_id,
          storeName: data.store_name,
          slug: data.slug,
          colorTheme: data.color_theme,
          socialLinks: data.social_links,
          contactInfo: data.contact_info,
          bannerUrl: bannerUrl,
          fontSettings: data.font_settings
        });

        setIsLoading(false);
      } catch (error: any) {
        console.error("Error in useStoreSettings:", error);
        toast.error("خطأ في جلب إعدادات المتجر");
        setIsLoading(false);
      }
    };

    fetchStoreSettings();
  }, [slug]);

  return { storeSettings, isLoading };
};
