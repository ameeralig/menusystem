import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Product } from "@/types/product";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import SocialIcons from "@/components/store/SocialIcons";

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

const ProductPreview = () => {
  const { userId } = useParams<{ userId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<string | null>("default");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [fontSettings, setFontSettings] = useState<FontSettings | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const trackPageView = async () => {
      if (!userId) return;
      
      try {
        const { error } = await supabase.rpc('increment_page_view', { 
          store_user_id: userId 
        });
        
        if (error) {
          console.error("Error tracking page view:", error);
        }
      } catch (error) {
        console.error("Error tracking page view:", error);
      }
    };
    
    trackPageView();
  }, [userId]);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!userId || typeof userId !== 'string') {
          throw new Error("معرف المتجر غير صالح");
        }

        const { data: storeSettings, error: storeError } = await supabase
          .from("store_settings")
          .select("store_name, color_theme, social_links, banner_url, font_settings, contact_info")
          .eq("user_id", userId)
          .maybeSingle();

        if (storeError) {
          console.error("Error fetching store settings:", storeError);
          setStoreName(null);
          setColorTheme("default");
        } else if (storeSettings) {
          console.info("Store settings data:", storeSettings);
          setStoreName(storeSettings.store_name || null);
          setColorTheme(storeSettings.color_theme || "default");
          setSocialLinks(storeSettings.social_links as SocialLinks || {});
          setBannerUrl(storeSettings.banner_url || null);
          setFontSettings(storeSettings.font_settings as FontSettings | undefined);
          setContactInfo(storeSettings.contact_info as ContactInfo || {});
          console.info("Banner URL from database:", storeSettings.banner_url);
          console.info("Contact info from database:", storeSettings.contact_info);
        }

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw new Error("حدث خطأ أثناء جلب المنتجات");
        }

        setProducts(productsData || []);

      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
        toast({
          title: "حدث خطأ",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [userId, toast]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <ProductPreviewContainer 
      colorTheme={colorTheme} 
      bannerUrl={bannerUrl}
      fontSettings={fontSettings}
      containerHeight="auto"
    >
      <StoreProductsDisplay 
        products={products} 
        storeName={storeName} 
        colorTheme={colorTheme}
        fontSettings={fontSettings}
        contactInfo={contactInfo}
      />
      <SocialIcons socialLinks={socialLinks} />
      {userId && <FeedbackDialog userId={userId} />}
    </ProductPreviewContainer>
  );
};

export default ProductPreview;
