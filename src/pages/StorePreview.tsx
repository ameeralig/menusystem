
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase, getCurrentSubdomain, getUserIdFromSlug } from "@/lib/supabase";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // التحقق أولاً إذا كنا في نطاق فرعي
  const subdomainFromHostname = getCurrentSubdomain();
  const effectiveStoreSlug = subdomainFromHostname || urlStoreSlug;

  const { products, storeData, categoryImages, error: dataError, isLoading } = useStoreData(userId);

  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("لم يتم تسجيل الدخول، جاري التوجيه إلى صفحة تسجيل الدخول");
          navigate("/auth/login");
          return;
        }
      } catch (error) {
        console.error("خطأ في التحقق من حالة تسجيل الدخول:", error);
        navigate("/auth/login");
      }
    };
    
    checkAuthState();
  }, [navigate]);

  // البحث عن معرف المستخدم بناءً على الرابط المخصص (subdomain)
  useEffect(() => {
    const fetchUserIdFromSlug = async () => {
      setLoading(true);
      setError(null);
      
      if (!effectiveStoreSlug) {
        console.log("لا يوجد نطاق فرعي محدد");
        setError("رابط المتجر غير صالح");
        setLoading(false);
        return;
      }

      try {
        console.log("البحث عن المتجر باستخدام النطاق:", effectiveStoreSlug);
        
        const foundUserId = await getUserIdFromSlug(effectiveStoreSlug);
        
        if (!foundUserId) {
          console.log("لم يتم العثور على المتجر بالنطاق:", effectiveStoreSlug);
          setError(`المتجر "${effectiveStoreSlug}" غير موجود، الرجاء التأكد من الرابط الصحيح`);
          setLoading(false);
          return;
        }

        console.log("تم العثور على المتجر باستخدام النطاق:", foundUserId);
        setUserId(foundUserId);
        setLoading(false);
      } catch (error: any) {
        console.error("خطأ في البحث عن معرف المستخدم:", error.message);
        setError("حدث خطأ أثناء البحث عن المتجر. الرجاء المحاولة مرة أخرى لاحقاً.");
        setLoading(false);
      }
    };

    fetchUserIdFromSlug();
    
    // تحديث عنوان المتصفح إلى اسم المتجر إذا كان متاحاً
    if (storeData?.store_name) {
      document.title = storeData.store_name;
    } else {
      document.title = effectiveStoreSlug || "معاينة المتجر";
    }
  }, [effectiveStoreSlug]);

  // تسجيل مشاهدة الصفحة
  useEffect(() => {
    const trackPageView = async () => {
      if (!userId) return;
      
      try {
        console.log("تسجيل مشاهدة الصفحة للمستخدم:", userId);
        const { error } = await supabase.rpc('increment_page_view', { 
          store_user_id: userId 
        });
        
        if (error) {
          console.error("خطأ في تسجيل مشاهدة الصفحة:", error.message);
        } else {
          console.log("تم تسجيل مشاهدة الصفحة بنجاح");
        }
      } catch (error: any) {
        console.error("استثناء في تسجيل مشاهدة الصفحة:", error.message);
      }
    };
    
    trackPageView();
  }, [userId]);

  if (loading || isLoading) {
    return <LoadingState message="جاري التحقق من المتجر..." />;
  }

  if (error) {
    console.log("عرض رسالة الخطأ:", error);
    return <ErrorState error={error} />;
  }

  if (dataError) {
    console.log("خطأ في بيانات المتجر:", dataError);
    return <ErrorState error={dataError} />;
  }

  if (!storeData) {
    console.log("لم يتم العثور على بيانات المتجر");
    return <ErrorState error="لم يتم العثور على بيانات المتجر. الرجاء التأكد من النطاق الفرعي الصحيح." />;
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
