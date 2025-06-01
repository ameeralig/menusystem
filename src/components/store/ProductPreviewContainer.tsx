
import { ReactNode, useState, useEffect, CSSProperties } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { formatImageUrl } from "@/utils/storageHelpers";

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
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  
  // هذا التأثير يتعامل مع تحميل الخطوط المخصصة
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
  
  // هذا التأثير يتعامل مع تحميل الصور مع تجنب التخزين المؤقت
  useEffect(() => {
    if (bannerUrl) {
      const loadImage = () => {
        try {
          // استخدام وظيفة formatImageUrl المحسنة لدعم أي نوع من روابط الصور
          const optimizedUrl = formatImageUrl(bannerUrl);
          
          // إنشاء كائن صورة جديد للتحقق من تحميل الصورة
          const img = document.createElement('img');
          img.onload = () => {
            console.log("تم تحميل صورة البانر بنجاح:", optimizedUrl);
            setImgSrc(optimizedUrl);
            setImageError(false);
            setImageLoaded(true);
          };
          img.onerror = (e) => {
            console.error("خطأ في تحميل صورة البانر:", optimizedUrl, e);
            
            // محاولة استخدام الرابط الأصلي إذا فشل الرابط المحسّن
            if (optimizedUrl !== bannerUrl) {
              console.log("محاولة استخدام الرابط الأصلي للبانر:", bannerUrl);
              const fallbackImg = document.createElement('img');
              fallbackImg.onload = () => {
                setImgSrc(bannerUrl);
                setImageError(false);
                setImageLoaded(true);
              };
              fallbackImg.onerror = () => {
                setImageError(true);
              };
              fallbackImg.src = bannerUrl;
            } else {
              setImageError(true);
            }
          };
          
          // تعيين خصائص إضافية للتحميل السريع
          img.decoding = "async";
          img.loading = "eager"; // تحميل فوري للصور المهمة مثل البانر
          img.src = optimizedUrl;
        } catch (error) {
          console.error("خطأ في معالجة رابط البانر:", error);
          setImageError(true);
        }
      };

      // تحميل الصورة مباشرة
      loadImage();

      // إعادة محاولة التحميل بعد فترة إذا كانت صورة جديدة تم رفعها حديثًا
      const retryTimeout = setTimeout(() => {
        if (imageError) {
          console.log("إعادة محاولة تحميل البانر بعد مهلة");
          setImageError(false); // إعادة تعيين حالة الخطأ قبل المحاولة مرة أخرى
          loadImage();
        }
      }, 1500);
      
      return () => {
        clearTimeout(retryTimeout);
      };
    } else {
      setImgSrc(null);
    }
  }, [bannerUrl]);
  
  const getThemeClasses = (theme: string | null) => {
    const baseClasses = darkMode ? 'dark' : '';
    
    // إذا كان اللون يبدأ بـ # فهو لون مخصص
    if (theme && theme.startsWith('#')) {
      return `${baseClasses} transition-colors duration-300`;
    }
    
    // استخدام الألوان المحددة مسبقاً للألوان التقليدية
    switch (theme) {
      case 'coral':
        return `${baseClasses} bg-gradient-to-br from-[#fff5f2] to-[#ffede9] dark:from-[#ff9178]/10 dark:to-[#ff9178]/20`;
      case 'purple':
        return `${baseClasses} bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30`;
      case 'blue':
        return `${baseClasses} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30`;
      case 'green':
        return `${baseClasses} bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30`;
      case 'pink':
        return `${baseClasses} bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/30`;
      case 'teal':
        return `${baseClasses} bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/30`;
      case 'amber':
        return `${baseClasses} bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30`;
      case 'indigo':
        return `${baseClasses} bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/30`;
      case 'rose':
        return `${baseClasses} bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/30`;
      default:
        return `${baseClasses} bg-gray-50 dark:bg-gray-900`;
    }
  };

  const getCustomThemeStyle = (theme: string | null): CSSProperties => {
    if (theme && theme.startsWith('#')) {
      // تحويل اللون إلى rgba للتدرجات
      const hex = theme.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      if (darkMode) {
        return {
          background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.1) 0%, rgba(${r}, ${g}, ${b}, 0.2) 100%)`,
        };
      } else {
        return {
          background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.05) 0%, rgba(${r}, ${g}, ${b}, 0.15) 100%)`,
        };
      }
    }
    return {};
  };

  const getContainerStyle = (): CSSProperties => {
    let style: CSSProperties = {};
    
    // إضافة نمط الخط المخصص
    if (fontSettings?.generalText?.isCustom && fontId && fontFaceLoaded) {
      style.fontFamily = `"${fontId}", sans-serif`;
    }
    
    // إضافة نمط اللون المخصص
    const customStyle = getCustomThemeStyle(colorTheme);
    return { ...style, ...customStyle };
  };

  return (
    <div className="flex flex-col" style={getContainerStyle()}>
      {bannerUrl && (
        <div className="relative w-full overflow-hidden">
          <AspectRatio ratio={16 / 5} className="w-full">
            {!imageLoaded && !imageError && (
              <Skeleton className="w-full h-full absolute inset-0" />
            )}
            {imgSrc && !imageError ? (
              <img 
                src={imgSrc} 
                alt="صورة الغلاف" 
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onError={() => {
                  console.error("خطأ في عرض البانر:", imgSrc);
                  setImageError(true);
                }}
                onLoad={() => setImageLoaded(true)}
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              imageError && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">لا يمكن تحميل صورة الغلاف</p>
                </div>
              )
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </AspectRatio>
        </div>
      )}
      <div className={`flex-1 ${getThemeClasses(colorTheme)} transition-colors duration-300 relative`}>
        {imgSrc && !imageError && (
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/20 to-transparent"></div>
        )}
        <div className="w-full relative">
          <div className={`bg-white dark:bg-gray-800 rounded-tl-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 ${imgSrc && !imageError ? 'mt-[-1rem]' : ''}`} style={{ minHeight: containerHeight }}>
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
