
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingState from "@/components/store/LoadingState";
import { useStoreData } from "@/hooks/useStoreData";
import { useRefreshData } from "@/hooks/useRefreshData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// استخدام التحميل البطيء للمكونات غير الأساسية
const ProductPreviewContainer = lazy(() => import("@/components/store/ProductPreviewContainer"));
const StoreProductsDisplay = lazy(() => import("@/components/store/StoreProductsDisplay"));
const SocialIcons = lazy(() => import("@/components/store/SocialIcons"));
const FeedbackDialog = lazy(() => import("@/components/store/FeedbackDialog"));

// مكون الهيكل العظمي الذي سيعرض أثناء التحميل
const ProductPreviewSkeleton = () => (
  <div className="flex flex-col w-full">
    {/* هيكل عظمي للبانر */}
    <div className="w-full" style={{ height: '320px' }}>
      <Skeleton className="w-full h-full" />
    </div>
    
    {/* هيكل عظمي للمحتوى */}
    <div className="bg-white dark:bg-gray-800 rounded-tl-[2.5rem] border border-gray-100 dark:border-gray-700 mt-[-1rem] p-4 sm:p-6">
      {/* هيكل عظمي لاسم المتجر */}
      <div className="flex flex-col items-center justify-center mb-6">
        <Skeleton className="h-10 w-60 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      
      {/* هيكل عظمي لشريط البحث */}
      <Skeleton className="h-12 w-full mb-8" />
      
      {/* هيكل عظمي للتصنيفات */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 mb-8">
        <Skeleton className="h-[140px] rounded-[30px]" />
        <Skeleton className="h-[140px] rounded-[30px]" />
        <Skeleton className="h-[140px] rounded-[30px]" />
        <Skeleton className="h-[140px] rounded-[30px]" />
      </div>
      
      {/* هيكل عظمي للأيقونات الاجتماعية */}
      <Skeleton className="h-10 w-full max-w-xs mx-auto mt-8" />
    </div>
  </div>
);

const ProductPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const { forceRefresh, refreshData } = useRefreshData();
  const { storeData, isLoading, storeOwnerId } = useStoreData(slug, forceRefresh);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [lastManualRefresh, setLastManualRefresh] = useState<number>(Date.now());
  const [pageReady, setPageReady] = useState<boolean>(false);

  // تأخير صغير للتأكد من أن الصفحة جاهزة قبل عرض المحتوى الكامل
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setPageReady(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // إعداد meta tags لتجنب التخزين المؤقت والتعامل مع LCP
  useEffect(() => {
    // إضافة وسوم meta لمنع التخزين المؤقت للبيانات الديناميكية
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

    // إضافة الأنماط المباشرة للمساعدة في منع CLS
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .content-container {
        min-height: 100vh;
      }
      .banner-placeholder {
        height: 320px;
        width: 100%;
      }
      .product-card {
        min-height: 300px;
      }
      .category-card {
        min-height: 140px;
        aspect-ratio: 16/9;
      }
      img {
        content-visibility: auto;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      // تنظيف وسوم meta عند إزالة المكون
      metaTags.forEach(tag => {
        const metaTag = document.querySelector(`meta[name="${tag.name}"]`);
        if (metaTag) {
          metaTag.remove();
        }
      });
      cacheControlHeaders.remove();
      styleElement.remove();
    };
  }, []);

  // تحديث تلقائي كل دقيقة للتحقق من التغييرات
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoRefresh) {
        console.log("تحديث البيانات تلقائيًا...");
        refreshData();
        setLastManualRefresh(Date.now());
      }
    }, 60000); // تحديث كل دقيقة
    
    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshData]);

  // إجبار تحميل الصور حديثاً عند تحديث البيانات
  useEffect(() => {
    if (storeData?.bannerUrl) {
      // تحميل مسبق للصورة الرئيسية
      const preloadImage = new Image();
      preloadImage.src = `${storeData.bannerUrl.split('?')[0]}?t=${Date.now()}`;
      preloadImage.fetchPriority = "high"; 
      preloadImage.width = 1600;  // تعيين أبعاد محددة
      preloadImage.height = 320;  // تعيين أبعاد محددة
    }
  }, [storeData?.bannerUrl, forceRefresh, lastManualRefresh]);

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

  // عرض حالة التحميل مع هيكل عظمي للصفحة
  if (isLoading || !pageReady) {
    return <ProductPreviewSkeleton />;
  }

  return (
    <>
      {/* استخدام Suspense مع هياكل عظمية مفصلة */}
      <Suspense fallback={<ProductPreviewSkeleton />}>
        <ProductPreviewContainer 
          colorTheme={storeData.colorTheme} 
          bannerUrl={storeData.bannerUrl}
          fontSettings={storeData.fontSettings}
          containerHeight="auto"
        >
          <Suspense fallback={
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center mb-6">
                <Skeleton className="h-10 w-60 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-12 w-full mb-8" />
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                <Skeleton className="h-[140px] rounded-[30px]" />
                <Skeleton className="h-[140px] rounded-[30px]" />
              </div>
            </div>
          }>
            <StoreProductsDisplay 
              products={storeData.products} 
              storeName={storeData.storeName} 
              colorTheme={storeData.colorTheme}
              fontSettings={storeData.fontSettings}
              contactInfo={storeData.contactInfo}
              categoryImages={storeData.categoryImages}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-12 rounded-md w-full mt-4" />}>
            <SocialIcons socialLinks={storeData.socialLinks} />
          </Suspense>
          {storeData.storeOwnerId && (
            <Suspense fallback={<Skeleton className="h-10 rounded-md w-40 mt-4" />}>
              <FeedbackDialog userId={storeData.storeOwnerId} />
            </Suspense>
          )}
        </ProductPreviewContainer>
      </Suspense>
    </>
  );
};

export default ProductPreview;
