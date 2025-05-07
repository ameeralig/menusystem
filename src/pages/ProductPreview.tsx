
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
  const [isFetchAttempted, setIsFetchAttempted] = useState<boolean>(false);

  // إضافة meta tags للتحكم في التخزين المؤقت
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

  // إضافة تتبع المشاهدات
  useEffect(() => {
    const incrementPageView = async () => {
      if (storeOwnerId && !isFetchAttempted) {
        setIsFetchAttempted(true);
        try {
          // استخدام النافذة الجديدة لتتبع المشاهدات الفريدة فقط
          const viewKey = `view_${slug}_${new Date().toDateString()}`;
          if (!sessionStorage.getItem(viewKey)) {
            sessionStorage.setItem(viewKey, 'true');
            
            console.log("Incrementing page view for:", storeOwnerId);
            
            // استخدام وظيفة RPC مخصصة لزيادة عدد المشاهدات
            const { error } = await supabase.rpc('increment_page_view', {
              store_user_id: storeOwnerId
            });

            if (error) {
              console.error("Error incrementing page view:", error);
              // لا نُظهر خطأ للمستخدم في حالة فشل تتبع المشاهدات
            } else {
              console.log("Page view successfully incremented");
            }
          }
        } catch (error) {
          console.error("Error tracking page view:", error);
        }
      }
    };

    incrementPageView();
  }, [storeOwnerId, slug, isFetchAttempted]);

  // تفعيل الاستماع للتحديثات المباشرة بشكل هادئ في الخلفية
  useEffect(() => {
    if (!storeOwnerId) {
      return;
    }
    
    console.log("Setting up realtime subscriptions for:", storeOwnerId);
    
    // اشتراك في تغييرات جدول المنتجات
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${storeOwnerId}` }, 
        (payload) => {
          if (isAutoRefresh) {
            console.log("Products updated:", payload);
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
          if (isAutoRefresh) {
            console.log("Store settings updated:", payload);
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
          if (isAutoRefresh) {
            console.log("Category images updated:", payload);
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
      console.log("Cleaning up realtime subscriptions");
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
