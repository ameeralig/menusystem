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
      
      const fontFace = new FontFace(uniqueId, `url(${fontSettings.storeName.customFontUrl})`);
      
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
  }, [fontSettings?.storeName?.customFontUrl, fontSettings?.storeName?.isCustom]);
  
  const getThemeClasses = (theme: string | null) => {
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
    if (fontSettings?.storeName?.isCustom && fontId && fontFaceLoaded) {
      return { fontFamily: `"${fontId}", sans-serif` };
    }
    return {};
  };

  return storeName ? (
    <h1 
      className={`text-3xl font-bold text-right mb-8 ${getThemeClasses(colorTheme)}`}
      style={getStoreNameStyle()}
    >
      {storeName}
    </h1>
  ) : null;
};

export default StoreHeader;
