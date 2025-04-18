
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase, getCurrentSubdomain } from "@/lib/supabase";
import { useStoreData } from "@/hooks/useStoreData";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import SocialIcons from "@/components/store/SocialIcons";
import LoadingState from "@/components/store/preview/LoadingState";
import ErrorState from "@/components/store/preview/ErrorState";

const StorePreview = () => {
  const { storeSlug: urlStoreSlug } = useParams<{ storeSlug: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // التحقق أولاً إذا كنا في نطاق فرعي
  const subdomainFromHostname = getCurrentSubdomain();
  const effectiveStoreSlug = subdomainFromHostname || urlStoreSlug;

  const { products, storeData, categoryImages, error: dataError, isLoading } = useStoreData(userId);

  // البحث عن معرف المستخدم بناءً على الرابط المخصص (subdomain)
  useEffect(() => {
    const fetchUserIdFromSlug = async () => {
      if (!effectiveStoreSlug) {
        setError("رابط المتجر غير صالح");
        setIsInitialLoading(false);
        return;
      }

      try {
        console.log("البحث عن المتجر باستخدام:", effectiveStoreSlug);
        
        const { data, error } = await supabase
          .from("store_settings")
          .select("user_id, store_name")
          .eq("slug", effectiveStoreSlug)
          .maybeSingle();

        if (error) {
          console.error("خطأ في البحث عن معرف المستخدم بواسطة slug:", error);
          setError("حدث خطأ أثناء البحث عن المتجر");
          setIsInitialLoading(false);
          return;
        }

        if (!data) {
          console.log("لم يتم العثور على المتجر");
          setError(`المتجر "${effectiveStoreSlug}" غير موجود، الرجاء التأكد من الرابط الصحيح`);
          setIsInitialLoading(false);
          return;
        }

        console.log("تم العثور على المتجر باستخدام slug:", data);
        setUserId(data.user_id);
        if (data.store_name) {
          document.title = data.store_name;
        }
        setIsInitialLoading(false);
      } catch (error: any) {
        console.error("خطأ في البحث عن معرف المستخدم:", error);
        setError("حدث خطأ أثناء البحث عن المتجر");
        setIsInitialLoading(false);
      }
    };

    fetchUserIdFromSlug();
  }, [effectiveStoreSlug]);

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

  if (isInitialLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
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

  return (
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
  );
};

export default StorePreview;
