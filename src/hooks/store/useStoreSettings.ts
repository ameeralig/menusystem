
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SocialLinks, ContactInfo, FontSettings } from "@/types/store";

interface StoreSettings {
  storeOwnerId: string | null;
  storeName: string | null;
  slug: string | null;
  colorTheme: string | null;
  socialLinks: SocialLinks | null;
  contactInfo: ContactInfo | null;
  bannerUrl: string | null;
  fontSettings: FontSettings | null;
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

        // تأمين التحويل بين الأنواع باستخدام فحوصات نوع البيانات
        const safeSocialLinks = typeof data.social_links === 'object' && data.social_links !== null 
          ? data.social_links as SocialLinks 
          : null;
        
        const safeContactInfo = typeof data.contact_info === 'object' && data.contact_info !== null 
          ? data.contact_info as ContactInfo 
          : null;
        
        // تحويل إعدادات الخط مع التحقق من البنية الصحيحة
        let safeFontSettings: FontSettings | null = null;
        if (typeof data.font_settings === 'object' && 
            data.font_settings !== null && 
            'storeName' in data.font_settings && 
            'categoryText' in data.font_settings && 
            'generalText' in data.font_settings) {
          safeFontSettings = data.font_settings as FontSettings;
        }

        // تعيين البيانات المحولة بشكل آمن
        setStoreSettings({
          storeOwnerId: data.user_id,
          storeName: data.store_name,
          slug: data.slug,
          colorTheme: data.color_theme,
          socialLinks: safeSocialLinks,
          contactInfo: safeContactInfo,
          bannerUrl: bannerUrl,
          fontSettings: safeFontSettings
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
