
import { ReactNode, useEffect } from "react";
import BannerSection from "./preview/BannerSection";
import InlineBannerEditor from "./inline-edit/InlineBannerEditor";
import { useImageLoading } from "@/hooks/store/useImageLoading";
import { useCustomFonts } from "@/hooks/store/useCustomFonts";
import { getBackgroundStyle, getThemeClasses } from "@/utils/previewStyles";

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
  isStoreOwner?: boolean;
  storeOwnerId?: string;
  onUpdate?: () => void;
}

const ProductPreviewContainer = ({ 
  children, 
  colorTheme,
  bannerUrl,
  fontSettings,
  containerHeight = "auto",
  darkMode = false,
  isStoreOwner = false,
  storeOwnerId,
  onUpdate
}: ProductPreviewContainerProps) => {
  const { imageError, imageLoaded, imgSrc, setImageError, setImageLoaded } = useImageLoading(bannerUrl);
  const { getContainerStyle } = useCustomFonts(fontSettings);
  
  // تطبيق الوضع الداكن على عنصر الـ html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return () => {
      // لا نحذف الكلاس عند unmount لتجنب الوميض
    };
  }, [darkMode]);
  
  // تسجيل تغييرات اللون للتصحيح
  useEffect(() => {
    console.log("تم تحديث اللون في ProductPreviewContainer:", colorTheme, "Dark Mode:", darkMode);
  }, [colorTheme, darkMode]);

  // إنشاء الأنماط المخصصة للخلفية
  const customBackgroundStyle = getBackgroundStyle(colorTheme, darkMode);
  const themeClasses = getThemeClasses(colorTheme, darkMode);

  return (
    <div className={`flex flex-col ${themeClasses}`} style={getContainerStyle()}>
      {isStoreOwner && storeOwnerId && onUpdate ? (
        <InlineBannerEditor
          bannerUrl={bannerUrl}
          imgSrc={imgSrc}
          imageLoaded={imageLoaded}
          imageError={imageError}
          onImageError={() => setImageError(true)}
          onImageLoad={() => setImageLoaded(true)}
          storeOwnerId={storeOwnerId}
          onUpdate={onUpdate}
          showHiddenLogin={true}
        />
      ) : (
        <BannerSection
          bannerUrl={bannerUrl}
          imgSrc={imgSrc}
          imageLoaded={imageLoaded}
          imageError={imageError}
          onImageError={() => setImageError(true)}
          onImageLoad={() => setImageLoaded(true)}
        />
      )}
      
      {/* الخلفية المخصصة مع تطبيق لون المستخدم */}
      <div 
        className={`${colorTheme && colorTheme.startsWith('#') ? '' : 'bg-gray-50 dark:bg-gray-900'} transition-all duration-300`}
        style={colorTheme && colorTheme.startsWith('#') ? customBackgroundStyle : undefined}
      >
        {imgSrc && !imageError && (
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/20 to-transparent"></div>
        )}
        <div className="w-full relative">
          <div className={`bg-white dark:bg-gray-800 rounded-tl-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 ${imgSrc && !imageError ? 'mt-[-1rem]' : ''}`} style={{ minHeight: containerHeight }}>
            <div className="p-4 sm:p-6 pb-40">
              {children}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductPreviewContainer;
