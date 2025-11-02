
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
const SocialIcons = lazy(() => import("@/components/store/SocialIcons"));
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

  // جلب حالة نظام الموظفين
  useEffect(() => {
    const fetchEmployeeSystemStatus = async () => {
      if (storeOwnerId) {
        const { data } = await supabase
          .from('store_settings')
          .select('employee_system_enabled')
          .eq('user_id', storeOwnerId)
          .single();
        
        if (data) {
          setEmployeeSystemEnabled(data.employee_system_enabled || false);
        }
      }
    };

    fetchEmployeeSystemStatus();
  }, [storeOwnerId]);

  // تسجيل المشاهدة عند تحميل الصفحة
  useEffect(() => {
    const recordPageView = async () => {
      if (storeOwnerId) {
        try {
          console.log("تسجيل مشاهدة جديدة لصاحب المتجر:", storeOwnerId);
          
          // استدعاء دالة تسجيل المشاهدة
          const { error } = await supabase
            .rpc('increment_page_view', { store_user_id: storeOwnerId });
          
          if (error) {
            console.error("خطأ في تسجيل المشاهدة:", error);
          } else {
            console.log("تم تسجيل المشاهدة بنجاح");
          }
        } catch (error) {
          console.error("خطأ غير متوقع في تسجيل المشاهدة:", error);
        }
      }
    };

    if (storeOwnerId && !isLoading) {
      recordPageView();
    }
  }, [storeOwnerId, isLoading]);

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

  const themeColor = getThemeColor(storeData.colorTheme);

  // إنشاء manifest ديناميكي لكل صفحة معاينة
  useEffect(() => {
    if (!slug || !storeData.storeName) return;

    const manifest = {
      id: window.location.pathname,
      name: storeData.storeName,
      short_name: storeData.storeName,
      start_url: window.location.pathname,
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: themeColor,
      icons: [
        {
          src: storeData.bannerUrl || "/qr-logo-og.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: storeData.bannerUrl || "/qr-logo-og.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);

    const oldLinks = document.querySelectorAll('link[rel="manifest"]');
    oldLinks.forEach(link => link.remove());

    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestURL;
    document.head.appendChild(link);

    return () => {
      URL.revokeObjectURL(manifestURL);
    };
  }, [slug, storeData.storeName, storeData.bannerUrl, themeColor]);

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
                />
              </Suspense>
              {!employee && (
                <Suspense fallback={<div className="animate-pulse bg-gray-200 h-12 rounded-md w-full mt-4" />}>
                  <SocialIcons socialLinks={storeData.socialLinks} />
                </Suspense>
              )}
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
