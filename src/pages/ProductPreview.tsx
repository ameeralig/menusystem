
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import SocialIcons from "@/components/store/SocialIcons";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import RefreshButton from "@/components/store/RefreshButton";
import LoadingState from "@/components/store/LoadingState";
import { useStoreData } from "@/hooks/useStoreData";
import { useRefreshData } from "@/hooks/useRefreshData";

const ProductPreview = () => {
  const { slug } = useParams<{ slug: string }>();
  const { forceRefresh, refreshData } = useRefreshData();
  const { storeData, isLoading } = useStoreData(slug, forceRefresh);

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
      <RefreshButton onClick={refreshData} />
    </>
  );
};

export default ProductPreview;
