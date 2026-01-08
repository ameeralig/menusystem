
import { Suspense, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import StoreSkeleton from "@/components/store/skeletons/StoreSkeleton";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import { useOptimizedStoreData } from "@/hooks/store/useOptimizedStoreData";
import { useRefreshData } from "@/hooks/useRefreshData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useEmployeeAuth } from "@/hooks/employees/useEmployeeAuth";
import EmployeePanel from "@/components/employees/EmployeePanel";
import { CartProvider } from "@/contexts/CartContext";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import { logVisitorActivity } from "@/hooks/analytics/useActivityLogger";

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
  const [isStoreOwner, setIsStoreOwner] = useState(false);
  const hasRecordedViewRef = useRef(false);

  // التحقق من أن المستخدم الحالي هو مالك المتجر
  useEffect(() => {
    const checkStoreOwner = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsStoreOwner(user?.id === storeOwnerId);
    };
    
    if (storeOwnerId) {
      checkStoreOwner();
    }
  }, [storeOwnerId]);

  // دمج جلب حالة الموظفين وتسجيل المشاهدة في useEffect واحد
  useEffect(() => {
    if (!storeOwnerId || isLoading) return;

    const getVisitDayKey = () => {
      const d = new Date();
      d.setHours(3, 0, 0, 0);
      if (new Date().getHours() < 3) d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    };

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

      // تسجيل المشاهدة (مرة واحدة لكل تحميل صفحة)
      if (hasRecordedViewRef.current) return;
      hasRecordedViewRef.current = true;

      // 1) تحديث إجمالي المشاهدات
      try {
        await supabase.rpc('increment_page_view', { store_user_id: storeOwnerId });
      } catch (error) {
        console.error("خطأ في تسجيل المشاهدة:", error);
      }

      // 2) تسجيل زيارة اليوم (لـ Live counter) - لا نحسب زيارة المالك أو الموظف
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const isOwner = user?.id === storeOwnerId;
        if (isOwner || employee) return;

        const dayKey = getVisitDayKey();
        const storageKey = `visit_logged_${storeOwnerId}_${dayKey}`;
        if (sessionStorage.getItem(storageKey)) return;

        sessionStorage.setItem(storageKey, '1');
        await logVisitorActivity(storeOwnerId, 'page_view', { slug });
      } catch (error) {
        console.error("خطأ في تسجيل زيارة اليوم:", error);
      }
    };

    initializeStoreData();
  }, [storeOwnerId, isLoading, employee, slug]);

  // تحسين meta tags - إنشاء مرة واحدة فقط
  useEffect(() => {
    const metaConfigs = [
      { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { name: 'Pragma', content: 'no-cache' },
      { name: 'Expires', content: '0' }
    ];

    const createdTags: HTMLMetaElement[] = [];

    metaConfigs.forEach(config => {
      let metaTag = document.querySelector(`meta[name="${config.name}"]`) as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', config.name);
        metaTag.setAttribute('content', config.content);
        document.head.appendChild(metaTag);
        createdTags.push(metaTag);
      }
    });

    return () => {
      createdTags.forEach(tag => tag.remove());
    };
  }, []);

  // تحسين realtime subscriptions مع debounce أطول
  useEffect(() => {
    if (!storeOwnerId || !isAutoRefresh) return;

    let updateTimeout: NodeJS.Timeout;
    let lastUpdateTime = 0;
    
    const debouncedRefresh = () => {
      const now = Date.now();
      // منع التحديثات المتكررة جداً (أقل من 3 ثواني)
      if (now - lastUpdateTime < 3000) return;
      
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        lastUpdateTime = Date.now();
        toast.info("تم تحديث البيانات");
        refreshData();
        setLastManualRefresh(Date.now());
      }, 3000); // زيادة debounce من 2000ms إلى 3000ms
    };

    // دمج جميع subscriptions في channel واحد لتحسين الأداء
    const channel = supabase
      .channel(`store-realtime-${storeOwnerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `user_id=eq.${storeOwnerId}`,
        },
        debouncedRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_settings",
          filter: `user_id=eq.${storeOwnerId}`,
        },
        debouncedRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "category_images",
          filter: `user_id=eq.${storeOwnerId}`,
        },
        debouncedRefresh
      )
      .subscribe();

    return () => {
      clearTimeout(updateTimeout);
      supabase.removeChannel(channel);
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

  // عرض Skeleton أثناء التحميل (مرة واحدة فقط: ننتظر تعريف المتجر + المنتجات)
  if (
    isLoading ||
    loadingStates.identifying ||
    (loadingStates.products && (storeData?.products?.length ?? 0) === 0)
  ) {
    return <StoreSkeleton />;
  }

  return (
    <>
      <Helmet>
        {/* Preload Banner Image */}
        {storeData.bannerUrl && (
          <link 
            rel="preload" 
            as="image" 
            href={storeData.bannerUrl} 
            fetchPriority="high"
          />
        )}
        
        {/* SEO Meta Tags */}
        <title>{storeData.storeName || 'متجري'}</title>
        <meta name="description" content={`تصفح منتجات ${storeData.storeName || 'متجرنا'}`} />
        
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
            storeOwnerId={storeOwnerId!}
          />
        )}
        
        <div className={employee ? "pt-20" : ""}>
          <ProductPreviewContainer
            colorTheme={storeData.colorTheme} 
            bannerUrl={storeData.bannerUrl}
            fontSettings={storeData.fontSettings}
            darkMode={storeData.darkMode}
            containerHeight="auto"
            isStoreOwner={isStoreOwner}
            storeOwnerId={storeOwnerId || undefined}
            onUpdate={refreshData}
          >
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
              isStoreOwner={isStoreOwner}
              refreshData={refreshData}
              products={storeData.products || []}
              productsLoading={loadingStates.products}
              logoUrl={storeData.logoUrl}
            />
          </ProductPreviewContainer>
        </div>
      </CartProvider>
    </>
  );
};

export default ProductPreview;
