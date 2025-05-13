
import { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import LoadingState from "@/components/store/LoadingState";
import StoreHeader from "@/components/store/StoreHeader";
import ProductPreviewContent from "./product-preview/ProductPreviewContent";
import StoreNotFound from "./product-preview/StoreNotFound";
import { FontSettings } from "@/types/store";

// واجهة المكون لدعم الـ children
interface ProductPreviewContainerProps {
  colorTheme?: string; 
  bannerUrl?: string | null;
  fontSettings?: FontSettings;
  containerHeight?: string;
  children?: ReactNode;
}

const ProductPreviewContainer = (props?: ProductPreviewContainerProps) => {
  const { slug } = useParams<{ slug: string }>();
  // استدعاء useStoreData بتمرير قيمة افتراضية للتحديث
  const { storeData, isLoading } = useStoreData(slug || "", 0);

  // استخدم القيم من props إذا تم تمريرها، وإلا استخدم القيم من storeData
  const colorTheme = props?.colorTheme || storeData?.colorTheme;
  const bannerUrl = props?.bannerUrl !== undefined ? props?.bannerUrl : storeData?.bannerUrl;
  const fontSettings = props?.fontSettings || storeData?.fontSettings;
  const containerHeight = props?.containerHeight || "auto";

  // إذا تم تمرير children استخدمهم بدلاً من عرض المنتج
  const hasCustomContent = !!props?.children;

  if (isLoading && !hasCustomContent) {
    return <LoadingState />;
  }

  if (!storeData && !hasCustomContent) {
    return <StoreNotFound />;
  }

  const fontFamily = fontSettings?.generalText?.family || '';

  return (
    <div 
      className={`min-h-screen bg-background ${fontFamily}`}
      style={{ 
        height: containerHeight,
        backgroundColor: colorTheme || 'inherit',
        color: 'inherit'
      }}
    >
      <StoreHeader 
        storeName={storeData?.storeName || ''} 
        colorTheme={colorTheme} 
        fontSettings={fontSettings}
      />
      
      {hasCustomContent ? (
        props?.children
      ) : (
        <ProductPreviewContent storeOwnerId={storeData?.storeOwnerId} />
      )}
    </div>
  );
};

export default ProductPreviewContainer;
