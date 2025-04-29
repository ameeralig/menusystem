
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

const ProductPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const { forceRefresh, refreshData } = useRefreshData();
  const { storeData, isLoading, storeOwnerId } = useStoreData(slug, forceRefresh);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);

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

  // تسجيل معلومات تصحيح الأخطاء لتتبع المشكلة
  useEffect(() => {
    console.log("Realtime setup - storeOwnerId:", storeOwnerId);
  }, [storeOwnerId]);

  // تفعيل الاستماع للتحديثات المباشرة
  useEffect(() => {
    if (!storeOwnerId) {
      console.log("No storeOwnerId available, skipping realtime setup");
      return;
    }
    
    console.log("Setting up realtime listeners for user ID:", storeOwnerId);
    
    // اشتراك في تغييرات جدول المنتجات
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${storeOwnerId}` }, 
        (payload) => {
          console.log("Products change detected:", payload);
          if (isAutoRefresh) {
            toast.info("تم تحديث المنتجات");
            refreshData();
          }
        }
      )
      .subscribe((status) => {
        console.log("Products channel status:", status);
      });
    
    // اشتراك في تغييرات إعدادات المتجر
    const settingsChannel = supabase
      .channel('settings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'store_settings', filter: `user_id=eq.${storeOwnerId}` }, 
        (payload) => {
          console.log("Store settings change detected:", payload);
          if (isAutoRefresh) {
            toast.info("تم تحديث إعدادات المتجر");
            refreshData();
          }
        }
      )
      .subscribe((status) => {
        console.log("Settings channel status:", status);
      });

    // اشتراك في تغييرات صور التصنيفات
    const categoryImagesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'category_images', filter: `user_id=eq.${storeOwnerId}` }, 
        (payload) => {
          console.log("Category images change detected:", payload);
          if (isAutoRefresh) {
            toast.info("تم تحديث التصنيفات");
            refreshData();
          }
        }
      )
      .subscribe((status) => {
        console.log("Category images channel status:", status);
      });

    // تنظيف عند إزالة المكون
    return () => {
      console.log("Cleaning up realtime channels");
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
        <StoreProductsDisplay 
          products={storeData.products} 
          storeName={storeData.storeName} 
          colorTheme={storeData.colorTheme}
          fontSettings={storeData.fontSettings}
          contactInfo={storeData.contactInfo}
          categoryImages={storeData.categoryImages}
        />
        <SocialIcons socialLinks={storeData.socialLinks} />
        {storeData.storeOwnerId && <FeedbackDialog userId={storeData.storeOwnerId} />}
      </ProductPreviewContainer>
    </>
  );
};

export default ProductPreview;
