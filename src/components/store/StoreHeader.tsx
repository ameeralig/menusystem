
import { CSSProperties, useEffect, useState } from "react";

interface FontSettings {
  storeName?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
}

interface StoreHeaderProps {
  storeName: string | null;
  colorTheme: string | null;
  fontSettings?: FontSettings;
}

const StoreHeader = ({ storeName, colorTheme, fontSettings }: StoreHeaderProps) => {
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  
  useEffect(() => {
    if (fontSettings?.storeName?.isCustom && fontSettings?.storeName?.customFontUrl) {
      const uniqueId = `store-name-font-${Math.random().toString(36).substring(2, 9)}`;
      setFontId(uniqueId);
      
      // إضافة preload للخط
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'font';
      preloadLink.href = fontSettings.storeName.customFontUrl;
      preloadLink.crossOrigin = 'anonymous';
      preloadLink.id = `preload-${uniqueId}`;
      document.head.appendChild(preloadLink);
      
      const fontFace = new FontFace(
        uniqueId, 
        `url(${fontSettings.storeName.customFontUrl})`,
        { display: 'swap' }
      );
      
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
        const preloadElement = document.getElementById(`preload-${uniqueId}`);
        if (preloadElement) {
          preloadElement.remove();
        }
      };
    }
  }, [fontSettings?.storeName?.customFontUrl, fontSettings?.storeName?.isCustom]);
  
  const getThemeColors = (theme: string | null) => {
    // إذا كان اللون مخصص (يبدأ بـ #)
    if (theme && theme.startsWith('#')) {
      return { color: theme };
    }
    
    // الألوان المحددة مسبقاً
    switch (theme) {
      case 'coral':
        return 'text-[#ff9178] dark:text-[#ffbcad]';
      case 'purple':
        return 'text-purple-900 dark:text-purple-100';
      case 'blue':
        return 'text-blue-900 dark:text-blue-100';
      case 'green':
        return 'text-green-900 dark:text-green-100';
      case 'pink':
        return 'text-pink-900 dark:text-pink-100';
      case 'teal':
        return 'text-teal-900 dark:text-teal-100';
      case 'amber':
        return 'text-amber-900 dark:text-amber-100';
      case 'indigo':
        return 'text-indigo-900 dark:text-indigo-100';
      case 'rose':
        return 'text-rose-900 dark:text-rose-100';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  const getStoreNameStyle = (): CSSProperties => {
    let style: CSSProperties = {
      minHeight: '3.5rem',
      fontSizeAdjust: '0.5',
    };
    
    if (fontSettings?.storeName?.isCustom && fontId) {
      style.fontFamily = fontFaceLoaded 
        ? `${fontId}, Arial, sans-serif`
        : `Arial, sans-serif`;
    }
    
    // تطبيق اللون المخصص إذا كان موجوداً
    if (colorTheme && colorTheme.startsWith('#')) {
      style.color = colorTheme;
    }
    
    return style;
  };

  const themeColors = getThemeColors(colorTheme);
  const isCustomColor = colorTheme && colorTheme.startsWith('#');

  return storeName ? (
    <h1 
      className={`text-2xl md:text-3xl font-bold text-center mb-0 ${isCustomColor ? '' : themeColors}`}
      style={getStoreNameStyle()}
      dir="rtl"
    >
      {storeName}
    </h1>
  ) : null;
};

export default StoreHeader;
