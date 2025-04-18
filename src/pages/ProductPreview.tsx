
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase, checkUserStoreSlug } from "@/lib/supabase";
import { useStoreData } from "@/hooks/useStoreData";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import SocialIcons from "@/components/store/SocialIcons";
import LoadingState from "@/components/store/preview/LoadingState";
import ErrorState from "@/components/store/preview/ErrorState";
import StoreRedirectMessage from "@/components/store/preview/StoreRedirectMessage";

const ProductPreview = () => {
  const { userId } = useParams<{ userId: string }>();
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(true);
  const { products, storeData, categoryImages, error: dataError, isLoading } = useStoreData(userId);

  // التحقق من وجود slug وتوجيه المستخدم إلى استخدام النطاق الفرعي بدلاً من ذلك
  useEffect(() => {
    const checkForStoreSlug = async () => {
      if (!userId) {
        setIsCheckingSlug(false);
        return;
      }
      
      try {
        console.log("التحقق من النطاق الفرعي للمستخدم:", userId);
        const slugValue = await checkUserStoreSlug(userId);
        console.log("النطاق الفرعي المسترجع:", slugValue);
        setStoreSlug(slugValue);
        
        if (slugValue) {
          const hostname = window.location.hostname;
          console.log("اسم المضيف الحالي:", hostname);
          
          if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('lovableproject.com')) {
            console.log('بيئة تطوير محلية، لا يتم إعادة التوجيه للنطاق الفرعي');
            setIsCheckingSlug(false);
            return;
          }
          
          const domainParts = hostname.split('.');
          if (domainParts[0] !== slugValue) {
            const baseUrl = hostname.includes('qrmenuc.com') 
              ? 'qrmenuc.com' 
              : hostname.split('.').slice(1).join('.');
              
            const protocol = window.location.protocol;
            const newUrl = `${protocol}//${slugValue}.${baseUrl}`;
            
            console.log(`إعادة توجيه من ${window.location.href} إلى ${newUrl}`);
            window.location.href = newUrl;
          }
        }
        setIsCheckingSlug(false);
      } catch (error) {
        console.error("خطأ في التحقق من النطاق الفرعي:", error);
        setIsCheckingSlug(false);
      }
    };
    
    checkForStoreSlug();
  }, [userId]);

  if (isCheckingSlug) {
    return <LoadingState />;
  }

  if (dataError) {
    return <ErrorState error={dataError} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!storeData) {
    return <ErrorState error="لم يتم العثور على بيانات المتجر" />;
  }

  // إذا لم يكن هناك نطاق فرعي معين، فعرض رسالة إرشادية
  if (!storeSlug) {
    return <ErrorState error="لم يتم تعيين نطاق فرعي لهذا المتجر بعد. يرجى من صاحب المتجر تعيين نطاق فرعي من إعدادات التخصيص." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <StoreRedirectMessage storeSlug={storeSlug} />

      <ProductPreviewContainer 
        colorTheme={storeData.color_theme} 
        bannerUrl={storeData.banner_url}
        fontSettings={storeData.font_settings}
        containerHeight="auto"
      >
        <StoreProductsDisplay 
          products={products} 
          storeName={storeData.store_name} 
          colorTheme={storeData.color_theme}
          fontSettings={storeData.font_settings}
          contactInfo={storeData.contact_info}
          categoryImages={categoryImages}
        />
        <SocialIcons socialLinks={storeData.social_links} />
        {userId && <FeedbackDialog userId={userId} />}
      </ProductPreviewContainer>
    </div>
  );
};

export default ProductPreview;
