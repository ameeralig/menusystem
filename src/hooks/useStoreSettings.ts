
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SocialLinks = {
  instagram: string;
  facebook: string;
  telegram: string;
};

export const useStoreSettings = () => {
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [colorTheme, setColorTheme] = useState("default");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: "",
    facebook: "",
    telegram: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: storeSettings, error } = await supabase
        .from("store_settings")
        .select("store_name, color_theme, slug, social_links, banner_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching store settings:", error);
        return;
      }

      if (storeSettings) {
        console.log("Fetched store settings:", storeSettings);
        setStoreName(storeSettings.store_name || "");
        setColorTheme(storeSettings.color_theme || "default");
        setStoreSlug(storeSettings.slug || "");
        setCoverImageUrl(storeSettings.banner_url || null);
        setSocialLinks({
          instagram: (storeSettings.social_links as SocialLinks)?.instagram || "",
          facebook: (storeSettings.social_links as SocialLinks)?.facebook || "",
          telegram: (storeSettings.social_links as SocialLinks)?.telegram || "",
        });
      }
    } catch (error) {
      console.error("Error fetching store settings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      console.log("Saving store settings with banner_url:", coverImageUrl);

      const { data: existingSettings, error: checkError } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing settings:", checkError);
      }

      const storeData = { 
        store_name: storeName,
        color_theme: colorTheme,
        slug: storeSlug,
        social_links: socialLinks,
        banner_url: coverImageUrl,
        updated_at: new Date().toISOString()
      };

      console.log("Saving store settings:", storeData);

      let result;
      if (existingSettings) {
        result = await supabase
          .from("store_settings")
          .update(storeData)
          .eq("user_id", user.id);
      } else {
        result = await supabase
          .from("store_settings")
          .insert([{ 
            user_id: user.id,
            ...storeData
          }]);
      }

      if (result.error) {
        if (result.error.code === '23505') {
          throw new Error("هذا الرابط مستخدم بالفعل، الرجاء اختيار رابط آخر");
        }
        throw result.error;
      }

      console.log("Store settings saved successfully:", result);

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات المتجر",
        duration: 3000,
      });

      setIsEditing(false);
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

  const handleSocialLinkChange = (platform: keyof typeof socialLinks) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: e.target.value
    }));
  };

  return {
    storeName,
    setStoreName,
    storeSlug,
    setStoreSlug,
    isEditing,
    setIsEditing,
    colorTheme,
    setColorTheme,
    coverImageUrl,
    setCoverImageUrl,
    socialLinks,
    userId,
    isLoading,
    handleSubmit,
    handleSocialLinkChange
  };
};
