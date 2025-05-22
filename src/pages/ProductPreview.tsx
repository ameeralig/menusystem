
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingState from "@/components/store/LoadingState";
import { useStoreData } from "@/hooks/useStoreData";
import { useRefreshData } from "@/hooks/useRefreshData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// استخدام التحميل البطيء للمكونات غير الأساسية
const ProductPreviewContainer = lazy(() => import("@/components/store/ProductPreviewContainer"));
const StoreProductsDisplay = lazy(() => import("@/components/store/StoreProductsDisplay"));
const SocialIcons = lazy(() => import("@/components/store/SocialIcons"));
const FeedbackDialog = lazy(() => import("@/components/store/FeedbackDialog"));

const ProductPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const { forceRefresh, refreshData } = useRefreshData();
  const { storeData, isLoading, storeOwnerId } = useStoreData(slug, forceRefresh);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [lastManualRefresh, setLastManualRefresh] = useState<number>(Date.now());

  // إعداد meta tags لتجنب التخزين المؤقت
  useEffect(() => {
    const metaTags = [
      { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { name: 'Pragma', content: 'no-cache' },
      { name: 'Expires', content: '0' }
    ];

    metaTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', tag.name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });

    // إضافة رؤوس للتخزين المؤقت للصور والملفات الثابتة
    const cacheControlHeaders = document.createElement('meta');
    cacheControlHeaders.setAttribute('http-equiv', 'Cache-Control');
    cacheControlHeaders.setAttribute('content', 'max-age=86400, public'); // تخزين مؤقت لمدة 24 ساعة للأصول الثابتة
    document.head.appendChild(cacheControlHeaders);

    return () => {
      metaTags.forEach(tag => {
        const metaTag = document.querySelector(`meta[name="${tag.name}"]`);
        if (metaTag) {
          metaTag.remove();
        }
      });
      cacheControlHeaders.remove();
    };
  }, []);

  // تحديث تلقائي كل دقيقة للتحقق من التغييرات
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoRefresh) {
        console.log("Auto refreshing data...");
        refreshData();
        setLastManualRefresh(Date.now());
      }
    }, 60000); // تحديث كل دقيقة
    
    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshData]);

  // إجبار تحميل الصور حديثاً عند تحديث البيانات
  useEffect(() => {
    if (storeData?.bannerUrl) {
      const preloadImage = new Image();
      preloadImage.src = `${storeData.bannerUrl.split('?')[0]}?t=${Date.now()}`;
      preloadImage.loading = "eager"; // تحميل الصورة الرئيسية بشكل فوري
    }
  }, [storeData.bannerUrl, forceRefresh, lastManualRefresh]);

  // تفعيل الاستماع للتحديثات المباشرة بشكل هادئ في الخلفية
  useEffect(() => {
    if (!storeOwnerId) {
      return;
    }
    
    // اشتراك في تغييرات جدول المنتجات
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${storeOwnerId}` }, 
        (payload) => {
          if (isAutoRefresh) {
            toast.info("تم تحديث المنتجات");
            refreshData();
            setLastManualRefresh(Date.now());
          }
        }
      )
      .subscribe();
    
    // اشتراك في تغييرات إعدادات المتجر
    const settingsChannel = supabase
      .channel('settings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'store_settings', filter: `user_id=eq.${storeOwnerId}` }, 
        (payload) => {
          if (isAutoRefresh) {
            toast.info("تم تحديث إعدادات المتجر");
            refreshData();
            setLastManualRefresh(Date.now());
          }
        }
      )
      .subscribe();

    // اشتراك في تغييرات صور التصنيفات
    const categoryImagesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'category_images', filter: `user_id=eq.${storeOwnerId}` }, 
        (payload) => {
          if (isAutoRefresh) {
            toast.info("تم تحديث التصنيفات");
            refreshData();
            setLastManualRefresh(Date.now());
          }
        }
      )
      .subscribe();

    // تنظيف عند إزالة المكون
    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(categoryImagesChannel);
    };
  }, [storeOwnerId, refreshData, isAutoRefresh]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Suspense fallback={<LoadingState />}>
        <ProductPreviewContainer 
          colorTheme={storeData.colorTheme} 
          bannerUrl={storeData.bannerUrl}
          fontSettings={storeData.fontSettings}
          containerHeight="auto"
        >
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-md w-full" />}>
            <StoreProductsDisplay 
              products={storeData.products} 
              storeName={storeData.storeName} 
              colorTheme={storeData.colorTheme}
              fontSettings={storeData.fontSettings}
              contactInfo={storeData.contactInfo}
              categoryImages={storeData.categoryImages}
            />
          </Suspense>
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-12 rounded-md w-full mt-4" />}>
            <SocialIcons socialLinks={storeData.socialLinks} />
          </Suspense>
          {storeData.storeOwnerId && (
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-10 rounded-md w-40 mt-4" />}>
              <FeedbackDialog userId={storeData.storeOwnerId} />
            </Suspense>
          )}
        </ProductPreviewContainer>
      </Suspense>
    </>
  );
};

export default ProductPreview;
