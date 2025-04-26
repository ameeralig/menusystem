
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";

export type SocialLinks = {
  instagram?: string | null;
  facebook?: string | null;
  telegram?: string | null;
};

export type ContactInfo = {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifi?: string | null;
  businessHours?: string | null;
};

export type FontSettings = {
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

export type StoreData = {
  products: Product[];
  storeName: string | null;
  colorTheme: string | null;
  socialLinks: SocialLinks;
  contactInfo: ContactInfo;
  bannerUrl: string | null;
  fontSettings: FontSettings | undefined;
  storeOwnerId: string | null;
  categoryImages: CategoryImage[];
};

export const useStoreData = (slug: string | undefined, forceRefresh: number) => {
  const [storeData, setStoreData] = useState<StoreData>({
    products: [],
    storeName: null,
    colorTheme: "default",
    socialLinks: {},
    contactInfo: {},
    bannerUrl: null,
    fontSettings: undefined,
    storeOwnerId: null,
    categoryImages: [],
  });
  const [isLoading, setIsLoading] = useState(true);
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

        console.log("Fetching store with slug:", slug);

        const { data: storeSettings, error: storeError } = await supabase
          .from("store_settings")
          .select("user_id, store_name, color_theme, social_links, banner_url, font_settings, contact_info")
          .eq("slug", slug.trim())
          .maybeSingle();

        if (storeError) {
          console.error("Error fetching store settings:", storeError);
          navigate('/404');
          return;
        }

        if (!storeSettings || !storeSettings.store_name) {
          console.error("Store settings not found for slug:", slug);
          navigate('/404');
          return;
        }

        const userId = storeSettings.user_id;

        try {
          await supabase.rpc('increment_page_view', { 
            store_user_id: userId 
          });
        } catch (error) {
          console.error("Error tracking page view:", error);
        }

        const uniqueTimestamp = forceRefresh;
        const cacheBreaker = `t=${uniqueTimestamp}&nocache=${Math.random()}`;
        
        const bannerUrl = storeSettings.banner_url 
          ? `${storeSettings.banner_url.split('?')[0]}?${cacheBreaker}`
          : null;

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw new Error("حدث خطأ أثناء جلب المنتجات");
        }

        const updatedProducts = (productsData || []).map(product => {
          if (product.image_url) {
            const imageBaseUrl = product.image_url.split('?')[0];
            return {
              ...product, 
              image_url: `${imageBaseUrl}?${cacheBreaker}`
            };
          }
          return product;
        });

        const { data: categoryImagesData, error: categoryImagesError } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (categoryImagesError) {
          console.error("Error fetching category images:", categoryImagesError);
        }

        const updatedCategoryImages = (categoryImagesData || []).map(img => {
          if (img.image_url) {
            const imageBaseUrl = img.image_url.split('?')[0];
            return {
              ...img,
              image_url: `${imageBaseUrl}?${cacheBreaker}`
            };
          }
          return img;
        });

        setStoreData({
          products: updatedProducts,
          storeName: storeSettings.store_name,
          colorTheme: storeSettings.color_theme || "default",
          socialLinks: storeSettings.social_links as SocialLinks || {},
          contactInfo: storeSettings.contact_info as ContactInfo || {},
          bannerUrl,
          fontSettings: storeSettings.font_settings as FontSettings,
          storeOwnerId: userId,
          categoryImages: updatedCategoryImages,
        });

      } catch (error: any) {
        console.error("Error fetching data:", error);
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
  }, [slug, toast, navigate, forceRefresh]);

  return { storeData, isLoading };
};

