
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import SocialIcons from "@/components/store/SocialIcons";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import LoadingState from "@/components/store/LoadingState";
import { useStoreData } from "@/hooks/useStoreData";
import { useRefreshData } from "@/hooks/useRefreshData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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

    return () => {
      metaTags.forEach(tag => {
        const metaTag = document.querySelector(`meta[name="${tag.name}"]`);
        if (metaTag) {
          metaTag.remove();
        }
      });
    };
  }, []);

  // التحديث اليدوي الآن
  const handleManualRefresh = () => {
    console.log("تحديث يدوي للبيانات...");
    refreshData();
    
    // تحديث الطابع الزمني
    const newRefreshTime = Date.now();
    setLastManualRefresh(newRefreshTime);
    
    toast.success("تم تحديث البيانات");
  };

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
    }
    
    // تحميل مسبق لصور التصنيفات
    if (storeData?.categoryImages && storeData.categoryImages.length > 0) {
      console.log(`[ProductPreview] تحميل مسبق لـ ${storeData.categoryImages.length} صور تصنيفات`);
      storeData.categoryImages.forEach(img => {
        if (img.image_url) {
          const preloadImage = new Image();
          const timestamp = Date.now();
          preloadImage.src = `${img.image_url.split('?')[0]}?t=${timestamp}`;
        }
      });
    }
  }, [storeData, forceRefresh, lastManualRefresh]);

  // تفعيل الاستماع للتحديثات المباشرة 
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
      <ProductPreviewContainer 
        colorTheme={storeData.colorTheme} 
        bannerUrl={storeData.bannerUrl}
        fontSettings={storeData.fontSettings}
        containerHeight="auto"
      >
        <div className="flex justify-end mb-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleManualRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
        
        <StoreProductsDisplay 
          products={storeData.products} 
          storeName={storeData.storeName} 
          colorTheme={storeData.colorTheme}
          fontSettings={storeData.fontSettings}
          contactInfo={storeData.contactInfo}
          categoryImages={storeData.categoryImages}
          key={`store-display-${lastManualRefresh}`}
        />
        <SocialIcons socialLinks={storeData.socialLinks} />
        {storeData.storeOwnerId && <FeedbackDialog userId={storeData.storeOwnerId} />}
      </ProductPreviewContainer>
    </>
  );
};

export default ProductPreview;
