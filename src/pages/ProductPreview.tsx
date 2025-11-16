
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LoadingState from "@/components/store/LoadingState";
import { useOptimizedStoreData } from "@/hooks/store/useOptimizedStoreData";
import { useRefreshData } from "@/hooks/useRefreshData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useEmployeeAuth } from "@/hooks/employees/useEmployeeAuth";
import EmployeePanel from "@/components/employees/EmployeePanel";
import EmployeeProductsView from "@/components/employees/EmployeeProductsView";
import { CartProvider } from "@/contexts/CartContext";
import InstallPWAButton from "@/components/store/InstallPWAButton";

// استخدام التحميل البطيء للمكونات غير الأساسية
const ProductPreviewContainer = lazy(() => import("@/components/store/ProductPreviewContainer"));
const StoreProductsDisplay = lazy(() => import("@/components/store/StoreProductsDisplay"));
const FeedbackTrigger = lazy(() => import("@/components/store/feedback/FeedbackTrigger"));

const ProductPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const { forceRefresh, refreshData } = useRefreshData();
  const { 
    storeData, 
    isLoading, 
    storeOwnerId, 
    identificationError,
    loadingProgress,
    loadingStates 
  } = useOptimizedStoreData(slug, forceRefresh);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [lastManualRefresh, setLastManualRefresh] = useState<number>(Date.now());
  const [employeeSystemEnabled, setEmployeeSystemEnabled] = useState(false);
  const { employee, logout } = useEmployeeAuth(storeOwnerId);

  // دمج جلب حالة الموظفين وتسجيل المشاهدة في useEffect واحد
  useEffect(() => {
    if (!storeOwnerId || isLoading) return;

    const initializeStoreData = async () => {
      // جلب حالة نظام الموظفين
      const { data } = await supabase
        .from('store_settings')
        .select('employee_system_enabled')
        .eq('user_id', storeOwnerId)
        .single();
      
      if (data) {
        setEmployeeSystemEnabled(data.employee_system_enabled || false);
      }

      // تسجيل المشاهدة
      try {
        await supabase.rpc('increment_page_view', { store_user_id: storeOwnerId });
      } catch (error) {
        console.error("خطأ في تسجيل المشاهدة:", error);
      }
    };

    initializeStoreData();
  }, [storeOwnerId, isLoading]);

  // دمج meta tags وتحميل الصور في useEffect واحد
  useEffect(() => {
    // إعداد meta tags
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

    const cacheControlHeaders = document.createElement('meta');
    cacheControlHeaders.setAttribute('http-equiv', 'Cache-Control');
    cacheControlHeaders.setAttribute('content', 'max-age=86400, public');
    document.head.appendChild(cacheControlHeaders);

    // تحميل الصور مسبقاً
    if (storeData?.bannerUrl) {
      const preloadImage = new Image();
      preloadImage.src = `${storeData.bannerUrl.split('?')[0]}?t=${Date.now()}`;
      preloadImage.loading = "eager";
    }

    return () => {
      metaTags.forEach(tag => {
        const metaTag = document.querySelector(`meta[name="${tag.name}"]`);
        if (metaTag) metaTag.remove();
      });
      cacheControlHeaders.remove();
    };
  }, [storeData?.bannerUrl, forceRefresh, lastManualRefresh]);

  // تفعيل الاستماع للتحديثات المباشرة - subscription موحد مع debounce
  useEffect(() => {
    if (!storeOwnerId || !isAutoRefresh) return;
    
    let debounceTimer: NodeJS.Timeout;
    
    // دمج جميع الـ subscriptions في قناة واحدة
    const unifiedChannel = supabase
      .channel('store-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${storeOwnerId}` },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            toast.info("تم تحديث البيانات");
            refreshData();
            setLastManualRefresh(Date.now());
          }, 2000); // تأخير 2 ثانية
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings', filter: `user_id=eq.${storeOwnerId}` },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            toast.info("تم تحديث البيانات");
            refreshData();
            setLastManualRefresh(Date.now());
          }, 2000);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'category_images', filter: `user_id=eq.${storeOwnerId}` },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            toast.info("تم تحديث البيانات");
            refreshData();
            setLastManualRefresh(Date.now());
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(unifiedChannel);
    };
  }, [storeOwnerId, refreshData, isAutoRefresh]);

  // عرض رسالة خطأ إذا لم يتم العثور على المتجر
  if (identificationError && !loadingStates.identifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl">😔</div>
          <h2 className="text-2xl font-bold text-foreground">المتجر غير موجود</h2>
          <p className="text-muted-foreground">{identificationError}</p>
        </div>
      </div>
    );
  }

  // عرض شاشة التحميل السريع
  if (isLoading || loadingStates.identifying) {
    return (
      <LoadingState 
        progress={loadingProgress} 
        message={loadingStates.identifying ? "جاري التعرف على المتجر..." : "جاري تحميل البيانات..."}
      />
    );
  }

  // تحديد لون الثيم للـ PWA
  const getThemeColor = (theme: string | null) => {
    if (theme && theme.startsWith('#')) {
      return theme;
    }
    
    const themeColors: Record<string, string> = {
      coral: '#ff9178',
      purple: '#8b5cf6',
      blue: '#3b82f6',
      green: '#10b981',
      pink: '#ec4899',
      teal: '#14b8a6',
      amber: '#f59e0b',
      indigo: '#6366f1',
      rose: '#f43f5e',
    };
    
    return themeColors[theme || ''] || '#3b82f6';
  };

  const manifestUrl = `/manifest-${slug}.json`;
  const themeColor = getThemeColor(storeData.colorTheme);

  return (
    <>
      <Helmet>
        {/* PWA Meta Tags */}
        <title>{storeData.storeName || 'متجري'}</title>
        <meta name="description" content={`تصفح منتجات ${storeData.storeName || 'متجرنا'}`} />
        <meta name="theme-color" content={themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={storeData.storeName || 'متجري'} />
        <link rel="apple-touch-icon" href={storeData.bannerUrl || '/qr-logo-og.png'} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={storeData.storeName || 'متجري'} />
        <meta property="og:description" content={`تصفح منتجات ${storeData.storeName || 'متجرنا'}`} />
        <meta property="og:image" content={storeData.bannerUrl || '/qr-logo-og.png'} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={storeData.storeName || 'متجري'} />
        <meta name="twitter:description" content={`تصفح منتجات ${storeData.storeName || 'متجرنا'}`} />
        <meta name="twitter:image" content={storeData.bannerUrl || '/qr-logo-og.png'} />
      </Helmet>
      
      <CartProvider>
        {employee && (
          <EmployeePanel
            employee={employee}
            onLogout={logout}
            products={storeData.products || []}
            storeOwnerId={storeOwnerId!}
          />
        )}
        
        <div className={employee ? "pt-20" : ""}>
          <Suspense fallback={<LoadingState />}>
            <ProductPreviewContainer
              colorTheme={storeData.colorTheme} 
              bannerUrl={storeData.bannerUrl}
              fontSettings={storeData.fontSettings}
              darkMode={storeData.darkMode}
              containerHeight="auto"
            >
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-md w-full" />}>
                <StoreProductsDisplay 
                  storeName={storeData.storeName} 
                  colorTheme={storeData.colorTheme}
                  fontSettings={storeData.fontSettings}
                  contactInfo={storeData.contactInfo}
                  categoryImages={storeData.categoryImages}
                  slug={slug}
                  storeOwnerId={storeOwnerId}
                  forceRefresh={forceRefresh}
                  isEmployeeView={!!employee}
                  template={storeData.template}
                  socialLinks={storeData.socialLinks}
                />
              </Suspense>
            </ProductPreviewContainer>
          </Suspense>
          
          {/* زر تثبيت PWA - يظهر فقط للزوار */}
          {!employee && <InstallPWAButton colorTheme={storeData.colorTheme} storeName={storeData.storeName} />}
        </div>
      </CartProvider>
    </>
  );
};

export default ProductPreview;
