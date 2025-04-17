
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
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

const StorePreview = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [colorTheme, setColorTheme] = useState<string | null>("default");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [fontSettings, setFontSettings] = useState<FontSettings | undefined>(undefined);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // البحث عن معرف المستخدم بناءً على الرابط المخصص
  useEffect(() => {
    const fetchUserIdFromSlug = async () => {
      if (!storeSlug) {
        setError("رابط المتجر غير صالح");
        setIsLoading(false);
        return;
      }

      try {
        // البحث أولاً عن الدومين المخصص
        let { data: domainData, error: domainError } = await supabase
          .from("store_settings")
          .select("user_id")
          .eq("custom_domain", storeSlug)
          .maybeSingle();

        if (domainError) {
          console.error("خطأ في البحث عن الدومين المخصص:", domainError);
        }

        // إذا لم يتم العثور على الدومين المخصص، نبحث عن الرابط المخصص
        if (!domainData) {
          const { data, error } = await supabase
            .from("store_settings")
            .select("user_id")
            .eq("slug", storeSlug)
            .maybeSingle();

          if (error) {
            console.error("خطأ في البحث عن معرف المستخدم:", error);
            setError("لا يمكن العثور على المتجر");
            setIsLoading(false);
            return;
          }

          if (!data) {
            setError("المتجر غير موجود");
            setIsLoading(false);
            return;
          }

          setUserId(data.user_id);
        } else {
          setUserId(domainData.user_id);
        }
      } catch (error: any) {
        console.error("خطأ في البحث عن معرف المستخدم:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchUserIdFromSlug();
  }, [storeSlug]);

  // تسجيل مشاهدة الصفحة
  useEffect(() => {
    const trackPageView = async () => {
      if (!userId) return;
      
      try {
        const { error } = await supabase.rpc('increment_page_view', { 
          store_user_id: userId 
        });
        
        if (error) {
          console.error("خطأ في تسجيل مشاهدة الصفحة:", error);
        }
      } catch (error) {
        console.error("خطأ في تسجيل مشاهدة الصفحة:", error);
      }
    };
    
    trackPageView();
  }, [userId]);

  // جلب بيانات المتجر بعد معرفة معرف المستخدم
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        if (!userId) return;

        setError(null);

        const { data: storeSettings, error: storeError } = await supabase
          .from("store_settings")
          .select("store_name, color_theme, social_links, banner_url, font_settings, contact_info")
          .eq("user_id", userId)
          .maybeSingle();

        if (storeError) {
          console.error("خطأ في جلب إعدادات المتجر:", storeError);
          setStoreName(null);
          setColorTheme("default");
        } else if (storeSettings) {
          console.info("بيانات إعدادات المتجر:", storeSettings);
          setStoreName(storeSettings.store_name || null);
          
          // تعيين عنوان الصفحة باستخدام اسم المتجر
          if (storeSettings.store_name) {
            document.title = storeSettings.store_name;
          }
          
          setColorTheme(storeSettings.color_theme || "default");
          setSocialLinks(storeSettings.social_links as SocialLinks || {});
          setBannerUrl(storeSettings.banner_url || null);
          setFontSettings(storeSettings.font_settings as FontSettings | undefined);
          setContactInfo(storeSettings.contact_info as ContactInfo || {});
          console.info("رابط الصورة من قاعدة البيانات:", storeSettings.banner_url);
          console.info("معلومات الاتصال من قاعدة البيانات:", storeSettings.contact_info);
        }

        // جلب صور التصنيفات - هذا الجزء مهم للزوار أيضاً
        const { data: categoryImagesData, error: categoryImagesError } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (categoryImagesError) {
          console.error("خطأ في جلب صور التصنيفات:", categoryImagesError);
        } else {
          console.info("تم جلب بيانات صور التصنيفات للزائر:", categoryImagesData);
          setCategoryImages(categoryImagesData || []);
        }

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userId);

        if (productsError) {
          console.error("خطأ في جلب المنتجات:", productsError);
          throw new Error("حدث خطأ أثناء جلب المنتجات");
        }

        setProducts(productsData || []);
        setIsLoading(false);

      } catch (error: any) {
        console.error("خطأ في جلب البيانات:", error);
        setError(error.message);
        toast({
          title: "حدث خطأ",
          description: error.message,
          variant: "destructive",
        });
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
        categoryImages={categoryImages}
      />
      <SocialIcons socialLinks={socialLinks} />
      {userId && <FeedbackDialog userId={userId} />}
    </ProductPreviewContainer>
  );
};

export default StorePreview;
