import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SocialLinks, ContactInfo, FontSettings } from "@/types/store";
import { useStoreCache } from "./useStoreCache";

interface UnifiedStoreData {
  userId: string | null;
  storeName: string | null;
  slug: string | null;
  colorTheme: string;
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  bannerUrl: string | null;
  logoUrl: string | null;
  fontSettings: FontSettings | undefined;
  darkMode: boolean;
  template: string;
  isSuspended: boolean;
}

const defaultFontSettings: FontSettings = {
  storeName: { family: "inherit", isCustom: false, customFontUrl: null },
  categoryText: { family: "inherit", isCustom: false, customFontUrl: null },
  generalText: { family: "inherit", isCustom: false, customFontUrl: null },
};

export const useUnifiedStoreData = (slug: string | undefined) => {
  const { getCachedData, setCachedData, isCached } = useStoreCache();
  const [storeData, setStoreData] = useState<UnifiedStoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreData = useCallback(async () => {
    if (!slug) {
      setError("لم يتم توفير رابط المتجر");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // التحقق من الـ cache أولاً
      const cacheKey = `unified_store_${slug}`;
      if (isCached(cacheKey)) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setStoreData(cachedData);
          setIsLoading(false);
          return;
        }
      }

      // استعلام واحد موحد يجلب كل البيانات
      const { data, error: queryError } = await supabase
        .from("store_settings")
        .select(`
          user_id,
          store_name,
          slug,
          color_theme,
          social_links,
          contact_info,
          banner_url,
          logo_url,
          font_settings,
          dark_mode,
          template,
          is_suspended
        `)
        .eq("slug", slug.trim())
        .maybeSingle();

      if (queryError) {
        console.error("خطأ في جلب بيانات المتجر:", queryError);
        setError("حدث خطأ في الوصول للمتجر");
        return;
      }

      if (!data) {
        setError("المتجر غير موجود أو تم حذفه");
        return;
      }

      // تحويل بيانات الخطوط
      let parsedFontSettings: FontSettings = defaultFontSettings;
      if (data.font_settings) {
        const fontData = data.font_settings as any;
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

      const unifiedData: UnifiedStoreData = {
        userId: data.user_id,
        storeName: data.store_name,
        slug: data.slug,
        colorTheme: data.color_theme || "default",
        socialLinks: (data.social_links as SocialLinks) || {},
        contactInfo: (data.contact_info as ContactInfo) || {},
        bannerUrl: data.banner_url,
        logoUrl: data.logo_url,
        fontSettings: parsedFontSettings,
        darkMode: data.dark_mode || false,
        template: "fast-response",
        isSuspended: (data as any).is_suspended || false,
      };

      setStoreData(unifiedData);
      // حفظ في الـ cache لمدة 30 دقيقة
      setCachedData(cacheKey, unifiedData, 30 * 60 * 1000);

    } catch (err: any) {
      console.error("خطأ غير متوقع:", err);
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  }, [slug, getCachedData, setCachedData, isCached]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  return {
    storeData,
    isLoading,
    error,
    userId: storeData?.userId || null,
    storeName: storeData?.storeName || null,
    refetch: fetchStoreData
  };
};
