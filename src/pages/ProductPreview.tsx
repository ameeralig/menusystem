
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import SocialIcons from "@/components/store/SocialIcons";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import { CategoryImage } from "@/types/categoryImage";
import { RefreshCw } from "lucide-react";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [forceRefresh, setForceRefresh] = useState<number>(Date.now());

  // تحديث معرف التحديث القسري عند تغيير معلمات URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('t') || queryParams.has('force') || queryParams.has('clearCache')) {
      console.log("تم اكتشاف طلب التحديث القسري في URL");
      setForceRefresh(Date.now());
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
      
      console.log(`بدء تحميل بيانات المتجر... (${refreshId})`);

      if (!slug) {
        console.error("لا يوجد slug");
        navigate('/404');
        return;
      }

      console.log(`جاري البحث عن المتجر باستخدام: ${slug}`);

      // البحث عن المتجر باستخدام slug مع تعطيل التخزين المؤقت
      const { data: storeSettings, error: storeError } = await supabase
        .from("store_settings")
        .select("user_id, store_name, color_theme, social_links, banner_url, font_settings, contact_info")
        .eq("slug", slug.trim())
        .maybeSingle();

      if (storeError) {
        console.error("خطأ في جلب إعدادات المتجر:", storeError);
        navigate('/404');
        return;
      }

      if (!storeSettings || !storeSettings.store_name) {
        console.error(`لم يتم العثور على إعدادات المتجر لـ slug: ${slug}`);
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
        console.error("خطأ في تتبع مشاهدات الصفحة:", error);
      }

      setStoreName(storeSettings.store_name);
      setColorTheme(storeSettings.color_theme || "default");
      
      // إضافة معرف تحديث فريد لكل الصور
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

      // جلب المنتجات مع تعطيل التخزين المؤقت
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId);

      if (productsError) {
        console.error("خطأ في جلب المنتجات:", productsError);
        throw new Error("حدث خطأ أثناء جلب المنتجات");
      }

      // إضافة معرف تحديث لكل صور المنتجات
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

      // جلب صور التصنيفات مع تعطيل التخزين المؤقت
      const { data: categoryImagesData, error: categoryImagesError } = await supabase
        .from("category_images")
        .select("*")
        .eq("user_id", userId);

      if (categoryImagesError) {
        console.error("خطأ في جلب صور التصنيفات:", categoryImagesError);
      } else {
        // إضافة معرف تحديث لكل صور التصنيفات
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
        
        console.log(`تم جلب ${updatedCategoryImages.length} صورة تصنيف`);
        setCategoryImages(updatedCategoryImages);
      }

      console.log(`تم تحميل بيانات المتجر بنجاح (${refreshId})`);

    } catch (error: any) {
      console.error("خطأ في جلب البيانات:", error);
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

  // تنفيذ جلب البيانات عند تحميل الصفحة أو تغيير slug أو طلب التحديث
  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData, forceRefresh]);

  // وظيفة تحديث البيانات يدوياً
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    // تعيين معرف تحديث جديد للتأكد من إعادة تحميل البيانات
    setForceRefresh(Date.now());
    
    // إضافة تأخير قصير للتأكد من وضوح حالة التحديث للمستخدم
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المتجر بنجاح",
        duration: 2000,
      });
    }, 1500);
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
      
      {/* زر التحديث اليدوي */}
      <button 
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 hover:bg-primary/90 active:bg-primary/80 transition-all"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? "جاري التحديث..." : "تحديث الصفحة"}
      </button>
    </>
  );
};

export default ProductPreview;
