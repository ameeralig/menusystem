
import ProductPreviewContainer from "@/components/store/ProductPreviewContainer";
import StoreProductsDisplay from "@/components/store/StoreProductsDisplay";
import SocialIcons from "@/components/store/SocialIcons";
import FeedbackDialog from "@/components/store/FeedbackDialog";
import { useState } from "react";
import { useStorePreviewData } from "@/hooks/useStorePreviewData";
import RefreshButton from "@/components/store/RefreshButton";

const ProductPreview = () => {
  const [forceRefresh, setForceRefresh] = useState<number>(Date.now());
  const {
    products,
    storeName,
    colorTheme,
    socialLinks,
    contactInfo,
    bannerUrl,
    fontSettings,
    storeOwnerId,
    categoryImages,
    isLoading,
    refresh
  } = useStorePreviewData(forceRefresh);

  // تنفيذ التحديث اليدوي
  const handleManualRefresh = () => {
    setForceRefresh(Date.now());
    refresh?.();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <>
      <ProductPreviewContainer
        colorTheme={colorTheme}
        bannerUrl={bannerUrl}
        fontSettings={fontSettings}
        containerHeight="auto"
      >
        <StoreProductsDisplay
          products={products}
          storeName={storeName}
          colorTheme={colorTheme}
          fontSettings={fontSettings}
          contactInfo={contactInfo}
          categoryImages={categoryImages}
        />
        <SocialIcons socialLinks={socialLinks} />
        {storeOwnerId && <FeedbackDialog userId={storeOwnerId} />}
      </ProductPreviewContainer>

      <RefreshButton onRefresh={handleManualRefresh} />
    </>
  );
};

export default ProductPreview;
