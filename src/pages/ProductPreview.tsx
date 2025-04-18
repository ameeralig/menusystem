
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, checkUserStoreSlug } from "@/lib/supabase";
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

const ProductPreview = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
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
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const { toast } = useToast();

  // التحقق من وجود slug وتوجيه المستخدم إلى استخدام النطاق الفرعي بدلاً من ذلك
  useEffect(() => {
    const checkForStoreSlug = async () => {
      if (!userId) return;
      
      try {
        // استخدام الوظيفة المساعدة من supabase.ts
        const slugValue = await checkUserStoreSlug(userId);
        setStoreSlug(slugValue);
        
        // إذا كان لديه نطاق فرعي، قم بإعادة توجيهه إلى النطاق الفرعي
        if (slugValue) {
          const hostname = window.location.hostname;
          
          // لا نقوم بإعادة التوجيه في بيئة التطوير المحلية
          if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
            console.log('بيئة تطوير محلية، لا يتم إعادة التوجيه للنطاق الفرعي');
            return;
          }
          
          // التحقق من أننا لسنا بالفعل على النطاق الفرعي
          const domainParts = hostname.split('.');
          if (domainParts[0] !== slugValue) {
            // إذا كان المستخدم على نطاق فرعي مختلف أو النطاق الرئيسي
            const baseUrl = hostname.includes('qrmenuc.com') 
              ? 'qrmenuc.com' 
              : hostname.split('.').slice(1).join('.');
              
            const protocol = window.location.protocol;
            const newUrl = `${protocol}//${slugValue}.${baseUrl}`;
            
            console.log(`إعادة توجيه من ${window.location.href} إلى ${newUrl}`);
            window.location.href = newUrl;
          }
        }
      } catch (error) {
        console.error("خطأ في التحقق من النطاق الفرعي:", error);
      }
    };
    
    checkForStoreSlug();
  }, [userId]);

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
          .select("store_name, color_theme, social_links, banner_url, font_settings, contact_info, slug")
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
          setStoreSlug(storeSettings.slug || null);
          
          if (storeSettings.social_links) {
            // تحويل آمن من Json إلى SocialLinks
            const socialLinksJson = storeSettings.social_links as Record<string, any>;
            setSocialLinks({
              instagram: socialLinksJson?.instagram || "",
              facebook: socialLinksJson?.facebook || "",
              telegram: socialLinksJson?.telegram || "",
            });
          }
          
          setBannerUrl(storeSettings.banner_url || null);
          
          if (storeSettings.font_settings) {
            // تحويل آمن من Json إلى FontSettings
            const fontSettingsJson = storeSettings.font_settings as Record<string, any>;
            setFontSettings({
              storeName: {
                family: fontSettingsJson?.storeName?.family || "inherit",
                isCustom: fontSettingsJson?.storeName?.isCustom || false,
                customFontUrl: fontSettingsJson?.storeName?.customFontUrl || null,
              },
              categoryText: {
                family: fontSettingsJson?.categoryText?.family || "inherit",
                isCustom: fontSettingsJson?.categoryText?.isCustom || false,
                customFontUrl: fontSettingsJson?.categoryText?.customFontUrl || null,
              },
              generalText: {
                family: fontSettingsJson?.generalText?.family || "inherit",
                isCustom: fontSettingsJson?.generalText?.isCustom || false,
                customFontUrl: fontSettingsJson?.generalText?.customFontUrl || null,
              }
            });
          }
          
          if (storeSettings.contact_info) {
            // تحويل آمن من Json إلى ContactInfo
            const contactInfoJson = storeSettings.contact_info as Record<string, any>;
            setContactInfo({
              description: contactInfoJson?.description || "",
              address: contactInfoJson?.address || "",
              phone: contactInfoJson?.phone || "",
              wifi: contactInfoJson?.wifi || "",
              businessHours: contactInfoJson?.businessHours || "",
            });
          }
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

      } catch (error: any) {
        console.error("خطأ في جلب البيانات:", error);
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

  // إذا لم يكن هناك نطاق فرعي معين، فعرض رسالة إرشادية
  if (!storeSlug) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert className="max-w-lg mx-auto">
          <AlertDescription>
            لم يتم تعيين نطاق فرعي لهذا المتجر بعد. يرجى من صاحب المتجر تعيين نطاق فرعي من إعدادات التخصيص.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const storefrontUrl = `${window.location.protocol}//${storeSlug}.qrmenuc.com`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Alert className="max-w-lg mx-auto mb-4">
        <AlertDescription className="flex flex-col space-y-2">
          <div>هذا المتجر متاح عبر النطاق الفرعي الخاص به:</div>
          <a 
            href={storefrontUrl} 
            className="text-blue-500 hover:text-blue-700 font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {storeSlug}.qrmenuc.com
          </a>
          <p className="text-sm text-gray-500 mt-2">
            يرجى استخدام الرابط أعلاه للوصول إلى المتجر.
          </p>
        </AlertDescription>
      </Alert>

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
    </div>
  );
};

export default ProductPreview;
