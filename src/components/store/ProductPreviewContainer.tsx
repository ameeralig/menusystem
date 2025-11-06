
import { ReactNode, useEffect } from "react";
import BannerSection from "./preview/BannerSection";
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
}

const ProductPreviewContainer = ({ 
  children, 
  colorTheme,
  bannerUrl,
  fontSettings,
  containerHeight = "auto",
  darkMode = false
}: ProductPreviewContainerProps) => {
  const { getContainerStyle } = useCustomFonts(fontSettings);
  
  // تسجيل تغييرات اللون للتصحيح
  useEffect(() => {
    console.log("تم تحديث اللون في ProductPreviewContainer:", colorTheme);
  }, [colorTheme]);

  // إنشاء الأنماط المخصصة للخلفية
  const customBackgroundStyle = getBackgroundStyle(colorTheme, darkMode);
  const themeClasses = getThemeClasses(colorTheme, darkMode);

  return (
    <div className={`flex flex-col ${themeClasses}`} style={getContainerStyle()}>
      <BannerSection bannerUrl={bannerUrl} />
      
      {/* الخلفية المخصصة مع تطبيق لون المستخدم */}
      <div 
        className={`${colorTheme && colorTheme.startsWith('#') ? '' : 'bg-gray-50 dark:bg-gray-900'} transition-all duration-300`}
        style={colorTheme && colorTheme.startsWith('#') ? customBackgroundStyle : undefined}
      >
        {bannerUrl && (
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/20 to-transparent"></div>
        )}
        <div className="w-full relative">
          <div className={`bg-white dark:bg-gray-800 rounded-tl-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 ${bannerUrl ? 'mt-[-1rem]' : ''}`} style={{ minHeight: containerHeight }}>
            <div className="p-4 sm:p-6">
              {children}
            </div>
            
            {/* رابط للصفحة الرئيسية */}
            <div className="py-4 text-center border-t border-gray-200 dark:border-gray-700">
              <a 
                href="https://qrmenuc.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1"
              >
                تحول للتجربة الرقمية مع <span className="font-semibold">QRM</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewContainer;
