
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { SocialLinks, ContactInfo, FontSettings } from "@/types/store";

interface StoreData {
  storeName: string;
  colorTheme: string;
  products: Product[];
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  bannerUrl: string | null;
  fontSettings: FontSettings;
  categoryImages: CategoryImage[];
  storeOwnerId: string | null;
  darkMode: boolean;
}

export const useStoreData = (slug: string | undefined, forceRefresh: number) => {
  const [storeData, setStoreData] = useState<StoreData>({
    storeName: "",
    colorTheme: "default",
    products: [],
    socialLinks: {},
    contactInfo: {},
    bannerUrl: null,
    fontSettings: {
      storeName: { family: "inherit", isCustom: false, customFontUrl: null },
      categoryText: { family: "inherit", isCustom: false, customFontUrl: null },
      generalText: { family: "inherit", isCustom: false, customFontUrl: null },
    },
    categoryImages: [],
    storeOwnerId: null,
    darkMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [storeOwnerId, setStoreOwnerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        
        if (!slug) {
          console.error("No slug provided");
          navigate('/404');
          return;
        }

        // جلب إعدادات المتجر
        const { data: settings, error: settingsError } = await supabase
          .from("store_settings")
          .select("user_id, store_name, color_theme, social_links, banner_url, font_settings, contact_info, dark_mode")
          .eq("slug", slug.trim())
          .maybeSingle();

        if (settingsError || !settings) {
          console.error("Error fetching store settings:", settingsError);
          navigate('/404');
          return;
        }

        setStoreOwnerId(settings.user_id);

        // جلب المنتجات
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", settings.user_id)
          .eq("is_available", true)
          .order("created_at", { ascending: false });

        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw productsError;
        }

        // جلب صور التصنيفات
        const { data: categoryImages, error: categoryImagesError } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", settings.user_id)
          .order("display_order", { ascending: true });

        if (categoryImagesError) {
          console.error("Error fetching category images:", categoryImagesError);
        }

        // معالجة إعدادات الخطوط
        let parsedFontSettings: FontSettings = {
          storeName: { family: "inherit", isCustom: false, customFontUrl: null },
          categoryText: { family: "inherit", isCustom: false, customFontUrl: null },
          generalText: { family: "inherit", isCustom: false, customFontUrl: null },
        };
        
        if (settings.font_settings) {
          const fontData = settings.font_settings as any;
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

        setStoreData({
          storeName: settings.store_name || "متجر بدون اسم",
          colorTheme: settings.color_theme || "default",
          products: products || [],
          socialLinks: settings.social_links as SocialLinks || {},
          contactInfo: settings.contact_info as ContactInfo || {},
          bannerUrl: settings.banner_url,
          fontSettings: parsedFontSettings,
          categoryImages: categoryImages || [],
          storeOwnerId: settings.user_id,
          darkMode: settings.dark_mode || false,
        });

      } catch (error: any) {
        console.error("Error fetching store data:", error);
        toast({
          title: "حدث خطأ",
          description: error.message,
          variant: "destructive",
        });
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [slug, forceRefresh, toast, navigate]);

  return { storeData, isLoading, storeOwnerId };
};
