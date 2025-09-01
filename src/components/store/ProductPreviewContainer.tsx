
import { ReactNode, useEffect } from "react";
import BannerSection from "./preview/BannerSection";
import { useImageLoading } from "@/hooks/store/useImageLoading";
import { useCustomFonts } from "@/hooks/store/useCustomFonts";

interface FontSettings {
  generalText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  storeName?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  categoryText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
}

interface ProductPreviewContainerProps {
  children: ReactNode;
  colorTheme: string | null;
  bannerUrl?: string | null;
  fontSettings?: FontSettings;
  containerHeight?: string;
  darkMode?: boolean;
}

const ProductPreviewContainer = ({ 
  children, 
  colorTheme,
  bannerUrl,
  fontSettings,
  containerHeight = "auto",
  darkMode = false
}: ProductPreviewContainerProps) => {
  const { imageError, imageLoaded, imgSrc, setImageError, setImageLoaded } = useImageLoading(bannerUrl);
  const { getContainerStyle } = useCustomFonts(fontSettings);
  
  // تسجيل تغييرات اللون للتصحيح
  useEffect(() => {
    console.log("تم تحديث اللون في ProductPreviewContainer:", colorTheme);
  }, [colorTheme]);

  return (
    <div className={`flex flex-col ${darkMode ? 'dark' : ''}`} style={getContainerStyle()}>
      <BannerSection
        bannerUrl={bannerUrl}
        imgSrc={imgSrc}
        imageLoaded={imageLoaded}
        imageError={imageError}
        onImageError={() => setImageError(true)}
        onImageLoad={() => setImageLoaded(true)}
      />
      
      {/* الخلفية الافتراضية مع تطبيق الوضع الداكن */}
      <div className="bg-gray-50 dark:bg-gray-900 transition-all duration-300">
        {imgSrc && !imageError && (
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/20 to-transparent"></div>
        )}
        <div className="w-full relative">
          <div className={`bg-white dark:bg-gray-800 rounded-tl-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 ${imgSrc && !imageError ? 'mt-[-1rem]' : ''}`} style={{ minHeight: containerHeight }}>
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewContainer;
