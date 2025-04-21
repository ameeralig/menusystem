
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import SocialIcons from "@/components/store/SocialIcons";
import FeedbackDialog from "@/components/store/FeedbackDialog";
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

const ProductPreview = () => {
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

        // البحث عن المتجر باستخدام slug بغض النظر عن اللغة
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
        setStoreOwnerId(userId);

        try {
          await supabase.rpc('increment_page_view', { 
            store_user_id: userId 
          });
        } catch (error) {
          console.error("Error tracking page view:", error);
        }

        setStoreName(storeSettings.store_name);
        setColorTheme(storeSettings.color_theme || "default");
        setBannerUrl(storeSettings.banner_url);
        
        // تحديث البيانات مع التحقق من الأنواع
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

        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw new Error("حدث خطأ أثناء جلب المنتجات");
        }

        setProducts(productsData || []);

        // جلب صور التصنيفات المخصصة مع إضافة معرّف للتحديث
        const timestamp = new Date().getTime();
        const { data: categoryImagesData, error: categoryImagesError } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (categoryImagesError) {
          console.error("Error fetching category images:", categoryImagesError);
        } else {
          // إضافة معرف زمني لكل صورة لتجنب التخزين المؤقت وتحديثها فوراً
          const updatedCategoryImages = (categoryImagesData || []).map(img => ({
            ...img,
            image_url: img.image_url.includes('?') 
              ? `${img.image_url.split('?')[0]}?t=${timestamp}` 
              : `${img.image_url}?t=${timestamp}`
          }));
          setCategoryImages(updatedCategoryImages);
        }

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

    // استدعاء الدالة والتأكد من تنفيذها دائماً عند تغيير slug
    fetchStoreData();
  }, [slug, toast, navigate]);

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
      {storeOwnerId && <FeedbackDialog userId={storeOwnerId} />}
    </ProductPreviewContainer>
  );
};

export default ProductPreview;
