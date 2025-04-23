
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
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
  const [forceRefresh, setForceRefresh] = useState<number>(Date.now());

  // تنفيذ إعادة تحميل البيانات عند تغيير المعلمة t في عنوان URL
  useEffect(() => {
    const handleUrlParamChange = () => {
      // تحديث معرف التحديث القسري
      setForceRefresh(Date.now());
    };

    // الاستماع لتغييرات عنوان URL
    window.addEventListener('popstate', handleUrlParamChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlParamChange);
    };
  }, []);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);

        // التحقق من وجود slug
        if (!slug || slug === ':slug') {
          console.error("Invalid slug provided:", slug);
          navigate('/404');
          return;
        }

        console.log("Fetching store with slug:", slug);

        // البحث عن المتجر باستخدام slug
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
        
        // إضافة معرف زمني فريد لمنع التخزين المؤقت لجميع الصور
        const uniqueTimestamp = forceRefresh || Date.now();
        
        if (storeSettings.banner_url) {
          const bannerBaseUrl = storeSettings.banner_url.split('?')[0];
          setBannerUrl(`${bannerBaseUrl}?t=${uniqueTimestamp}`);
        } else {
          setBannerUrl(null);
        }
        
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

        // إضافة معرف زمني للصور مع استخدام الطابع الزمني الفريد
        const updatedProducts = (productsData || []).map(product => {
          if (product.image_url) {
            const imageBaseUrl = product.image_url.split('?')[0];
            return {
              ...product, 
              image_url: `${imageBaseUrl}?t=${uniqueTimestamp}&nocache=${Math.random()}`
            };
          }
          return product;
        });

        setProducts(updatedProducts);

        // جلب صور التصنيفات المخصصة
        const { data: categoryImagesData, error: categoryImagesError } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId);

        if (categoryImagesError) {
          console.error("Error fetching category images:", categoryImagesError);
        } else {
          // إضافة معرف زمني لكل صورة مع إضافة قيمة عشوائية لتجنب التخزين المؤقت نهائيًا
          const updatedCategoryImages = (categoryImagesData || []).map(img => {
            if (img.image_url) {
              const imageBaseUrl = img.image_url.split('?')[0];
              return {
                ...img,
                image_url: `${imageBaseUrl}?t=${uniqueTimestamp}&nocache=${Math.random()}`
              };
            }
            return img;
          });
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

    fetchStoreData();
  }, [slug, toast, navigate, forceRefresh]); // إضافة forceRefresh للاعتماديات

  // وظيفة تحديث الصفحة يدويًا لتجنب مشاكل التخزين المؤقت
  const forceReload = () => {
    window.location.reload();
  };

  // عرض زر التحديث اليدوي إذا كان هناك مشكلة في تحميل الصور
  const renderRefreshButton = () => {
    return (
      <button 
        onClick={forceReload}
        className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50"
      >
        تحديث الصفحة
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <>
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
      {renderRefreshButton()}
    </>
  );
};

export default ProductPreview;
