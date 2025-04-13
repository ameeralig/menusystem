
import { ReactNode, useState, useEffect, CSSProperties } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  containerHeight?: string; // إضافة خاصية جديدة للتحكم بارتفاع الحاوية
}

const ProductPreviewContainer = ({ 
  children, 
  colorTheme,
  bannerUrl,
  fontSettings,
  containerHeight = "100vh" // القيمة الافتراضية هي ارتفاع الشاشة الكامل
}: ProductPreviewContainerProps) => {
  const [imageError, setImageError] = useState(false);
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  
  useEffect(() => {
    if (fontSettings?.generalText?.isCustom && fontSettings?.generalText?.customFontUrl) {
      const uniqueId = `general-text-font-${Math.random().toString(36).substring(2, 9)}`;
      setFontId(uniqueId);
      
      const fontFace = new FontFace(uniqueId, `url(${fontSettings.generalText.customFontUrl})`);
      
      fontFace.load().then((loadedFontFace) => {
        document.fonts.add(loadedFontFace);
        setFontFaceLoaded(true);
      }).catch(err => {
        console.error("Error loading custom font:", err);
      });
      
      return () => {
        const styleElement = document.getElementById(`style-${uniqueId}`);
        if (styleElement) {
          styleElement.remove();
        }
      };
    }
  }, [fontSettings?.generalText?.customFontUrl, fontSettings?.generalText?.isCustom]);
  
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

  const getContainerStyle = (): CSSProperties => {
    if (fontSettings?.generalText?.isCustom && fontId && fontFaceLoaded) {
      return { fontFamily: `"${fontId}", sans-serif` };
    }
    return {};
  };

  return (
    <div className="flex flex-col" style={getContainerStyle()}>
      {bannerUrl && !imageError ? (
        <div className="relative w-full overflow-hidden">
          <AspectRatio ratio={16 / 5} className="w-full">
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
      <div className={`flex-1 ${getThemeClasses(colorTheme)} transition-colors duration-300 relative`} style={{ minHeight: containerHeight }}>
        {bannerUrl && !imageError && (
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/20 to-transparent"></div>
        )}
        <div className="w-full relative">
          <div className={`bg-white dark:bg-gray-800 rounded-tr-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 ${bannerUrl && !imageError ? 'mt-[-2rem]' : ''}`} style={{ minHeight: containerHeight }}>
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
