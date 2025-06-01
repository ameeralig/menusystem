
import { ReactNode, useEffect, useState } from "react";
import { FontSettings } from "@/types/store";

interface ProductPreviewContainerProps {
  colorTheme: string;
  bannerUrl?: string | null;
  fontSettings?: FontSettings;
  containerHeight?: string;
  darkMode?: boolean;
  children: ReactNode;
}

const ProductPreviewContainer = ({ 
  colorTheme, 
  bannerUrl, 
  fontSettings, 
  containerHeight = "100vh",
  darkMode = false,
  children 
}: ProductPreviewContainerProps) => {
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (bannerUrl) {
      // إضافة طابع زمني لضمان عدم استخدام النسخة المخزنة مؤقتاً
      const timestamp = Date.now();
      const url = new URL(bannerUrl, window.location.origin);
      url.searchParams.set('t', `${timestamp}`);
      setBannerImageUrl(url.toString());
    } else {
      setBannerImageUrl(null);
    }
  }, [bannerUrl]);

  // تطبيق الخطوط المخصصة
  useEffect(() => {
    if (fontSettings) {
      const applyCustomFont = (fontSetting: any, className: string) => {
        if (fontSetting?.isCustom && fontSetting?.customFontUrl) {
          const link = document.createElement('link');
          link.href = fontSetting.customFontUrl;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
        
        const elements = document.querySelectorAll(`.${className}`);
        elements.forEach(element => {
          (element as HTMLElement).style.fontFamily = fontSetting?.family || 'inherit';
        });
      };

      // تطبيق خط اسم المتجر
      applyCustomFont(fontSettings.storeName, 'store-name-font');
      
      // تطبيق خط النصوص العامة
      applyCustomFont(fontSettings.generalText, 'general-text-font');
      
      // تطبيق خط التصنيفات
      applyCustomFont(fontSettings.categoryText, 'category-text-font');
    }
  }, [fontSettings]);

  const getColorThemeClasses = () => {
    const baseClasses = `min-h-[${containerHeight}] w-full transition-all duration-300`;
    
    if (darkMode) {
      return `${baseClasses} bg-gray-900 text-white`;
    }

    switch (colorTheme) {
      case "warm":
        return `${baseClasses} bg-gradient-to-br from-orange-50 to-red-50`;
      case "cool":
        return `${baseClasses} bg-gradient-to-br from-blue-50 to-indigo-50`;
      case "nature":
        return `${baseClasses} bg-gradient-to-br from-green-50 to-emerald-50`;
      case "elegant":
        return `${baseClasses} bg-gradient-to-br from-purple-50 to-pink-50`;
      case "minimal":
        return `${baseClasses} bg-white`;
      case "vibrant":
        return `${baseClasses} bg-gradient-to-br from-yellow-50 to-orange-50`;
      default:
        return `${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100`;
    }
  };

  const getBannerStyle = () => {
    if (!bannerImageUrl) return {};
    
    return {
      backgroundImage: `url(${bannerImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <div 
      className={getColorThemeClasses()}
      style={getBannerStyle()}
    >
      <div className={`w-full h-full ${bannerImageUrl ? 'bg-black/20 backdrop-blur-sm' : ''} ${darkMode ? 'bg-gray-900/90' : ''}`}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewContainer;
