
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
