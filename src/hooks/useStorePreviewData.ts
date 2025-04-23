
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  telegram?: string;
};

type ContactInfo = {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifi?: string | null;
  businessHours?: string | null;
};

type FontSettings = {
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

export function useStorePreviewData(forceRefresh: number) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<string | null>("default");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [fontSettings, setFontSettings] = useState<FontSettings | undefined>();
  const [storeOwnerId, setStoreOwnerId] = useState<string | null>(null);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تحديث معرف التحديث القسري عند تغيير معلمات URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('t') || queryParams.has('force') || queryParams.has('clearCache')) {
      // trigger effect by changing forceRefresh externally if needed
    }
  }, [window.location.search]);

  // دالة لاستخراج معرف التحديث من URL
  const getRefreshId = useCallback(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const timestamp = queryParams.get('t') || Date.now().toString();
    const random = queryParams.get('r') || Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}`;
  }, []);

  // دالة لإعادة تحميل البيانات
  const fetchStoreData = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshId = getRefreshId();
      if (!slug) {
        navigate('/404');
        return;
      }
      const { data: storeSettings, error: storeError } = await supabase
        .from("store_settings")
        .select("user_id, store_name, color_theme, social_links, banner_url, font_settings, contact_info")
        .eq("slug", slug.trim())
        .maybeSingle();

      if (storeError || !storeSettings || !storeSettings.store_name) {
        navigate('/404');
        return;
      }

      const userId = storeSettings.user_id;
      setStoreOwnerId(userId);

      try {
        await supabase.rpc('increment_page_view', { store_user_id: userId });
      } catch { }

      setStoreName(storeSettings.store_name);
      setColorTheme(storeSettings.color_theme || "default");

      const uniqueRefreshId = refreshId;
      if (storeSettings.banner_url) {
        const bannerBaseUrl = storeSettings.banner_url.split('?')[0];
        setBannerUrl(`${bannerBaseUrl}?t=${uniqueRefreshId}&nocache=${Math.random()}`);
      } else {
        setBannerUrl(null);
      }
      if (storeSettings.social_links) {
        setSocialLinks(storeSettings.social_links as SocialLinks);
      }
      if (storeSettings.font_settings) {
        setFontSettings(storeSettings.font_settings as FontSettings);
      }
      if (storeSettings.contact_info) {
        setContactInfo(storeSettings.contact_info as ContactInfo);
      }

      // جلب المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId);

      if (productsError) throw new Error("حدث خطأ أثناء جلب المنتجات");

      const updatedProducts = (productsData || []).map(product => {
        if (product.image_url) {
          const imageBaseUrl = product.image_url.split('?')[0];
          return {
            ...product,
            image_url: `${imageBaseUrl}?t=${uniqueRefreshId}&nocache=${Math.random()}`
          };
        }
        return product;
      });
      setProducts(updatedProducts);

      // جلب صور التصنيفات
      const { data: categoryImagesData, error: categoryImagesError } = await supabase
        .from("category_images")
        .select("*")
        .eq("user_id", userId);

      if (!categoryImagesError && categoryImagesData) {
        const updatedCategoryImages = (categoryImagesData || []).map(img => {
          if (img.image_url) {
            const imageBaseUrl = img.image_url.split('?')[0];
            return {
              ...img,
              image_url: `${imageBaseUrl}?t=${uniqueRefreshId}&nocache=${Math.random()}`
            };
          }
          return img;
        });
        setCategoryImages(updatedCategoryImages);
      }

    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
      navigate('/404');
    } finally {
      setIsLoading(false);
    }
  }, [slug, toast, navigate, getRefreshId]);

  useEffect(() => {
    fetchStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStoreData, forceRefresh]);

  return {
    products,
    storeName,
    colorTheme,
    socialLinks,
    contactInfo,
    bannerUrl,
    fontSettings,
    storeOwnerId,
    categoryImages,
    isLoading,
    refresh: fetchStoreData,
  };
}
