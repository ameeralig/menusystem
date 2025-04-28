
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialLinks, ContactInfo, FontSettings } from "@/types/store";

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        if (!slug) {
          console.error("No slug provided");
          navigate('/404');
          return;
        }

        const { data: settings, error } = await supabase
          .from("store_settings")
          .select("user_id, store_name, color_theme, social_links, banner_url, font_settings, contact_info")
          .eq("slug", slug.trim())
          .maybeSingle();

        if (error || !settings) {
          console.error("Error fetching store settings:", error);
          navigate('/404');
          return;
        }

        setStoreSettings({
          storeName: settings.store_name,
          colorTheme: settings.color_theme || "default",
          socialLinks: settings.social_links as SocialLinks || {},
          contactInfo: settings.contact_info as ContactInfo || {},
          bannerUrl: settings.banner_url,
          fontSettings: settings.font_settings as FontSettings,
          storeOwnerId: settings.user_id,
        });

      } catch (error: any) {
        console.error("Error fetching settings:", error);
        toast({
          title: "حدث خطأ",
          description: error.message,
          variant: "destructive",
        });
        navigate('/404');
      }
    };

    fetchStoreSettings();
  }, [slug, toast, navigate]);

  return { storeSettings, isLoading };
};
