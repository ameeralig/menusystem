
import { ReactNode, useState, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FontSettings } from "@/components/store/FontStyleSelector";
import { supabase } from "@/integrations/supabase/client";

interface ProductPreviewContainerProps {
  children: ReactNode;
  colorTheme: string | null;
  bannerUrl?: string | null;
  userId?: string;
}

const ProductPreviewContainer = ({ 
  children, 
  colorTheme,
  bannerUrl,
  userId
}: ProductPreviewContainerProps) => {
  const [imageError, setImageError] = useState(false);
  const [fontSettings, setFontSettings] = useState<FontSettings | null>(null);
  
  // جلب إعدادات الخطوط إذا كان هناك معرف مستخدم
  useEffect(() => {
    if (userId) {
      fetchFontSettings();
    }
  }, [userId]);

  const fetchFontSettings = async () => {
    try {
      const { data: storeSettings, error } = await supabase
        .from("store_settings")
        .select("font_settings")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching font settings:", error);
        return;
      }

      if (storeSettings?.font_settings) {
        setFontSettings(storeSettings.font_settings as FontSettings);
      }
    } catch (error) {
      console.error("Error fetching font settings:", error);
    }
  };
  
  const getThemeClasses = (theme: string | null) => {
    switch (theme) {
      case 'coral':
        return 'bg-gradient-to-br from-[#fff5f2] to-[#ffede9] dark:from-[#ff9178]/10 dark:to-[#ff9178]/20';
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30';
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30';
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30';
      case 'pink':
        return 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/30';
      case 'teal':
        return 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/30';
      case 'amber':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30';
      case 'indigo':
        return 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/30';
      case 'rose':
        return 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  // تطبيق الخط العام على الحاوية
  const generalFontStyle = fontSettings?.general?.fontFamily 
    ? (fontSettings.general.fontFamily === "custom" && fontSettings.general.customFont 
      ? { fontFamily: fontSettings.general.customFont } 
      : { fontFamily: fontSettings.general.fontFamily })
    : {};

  // إضافة CSS لتطبيق الخطوط المخصصة
  const fontCSSClasses = () => {
    if (!fontSettings) return null;

    return (
      <style>
        {`
          .store-name-font {
            font-family: ${fontSettings.storeName.fontFamily === "custom" && fontSettings.storeName.customFont 
              ? fontSettings.storeName.customFont 
              : fontSettings.storeName.fontFamily};
          }
          .category-font {
            font-family: ${fontSettings.categories.fontFamily === "custom" && fontSettings.categories.customFont 
              ? fontSettings.categories.customFont 
              : fontSettings.categories.fontFamily};
          }
        `}
      </style>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={generalFontStyle}>
      {fontCSSClasses()}
      
      {bannerUrl && !imageError ? (
        <div className="relative w-full overflow-hidden">
          <AspectRatio ratio={16 / 9} className="w-full">
            <img 
              src={bannerUrl} 
              alt="صورة الغلاف" 
              className="w-full h-full object-cover"
              onError={() => {
                console.error("Error loading image:", bannerUrl);
                setImageError(true);
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </AspectRatio>
        </div>
      ) : null}
      <div className={`flex-1 ${getThemeClasses(colorTheme)} transition-colors duration-300`}>
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewContainer;
