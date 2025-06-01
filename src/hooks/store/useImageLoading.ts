
import { useState, useEffect } from "react";
import { formatImageUrl } from "@/utils/storageHelpers";

export const useImageLoading = (bannerUrl?: string | null) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (bannerUrl) {
      const loadImage = () => {
        try {
          const optimizedUrl = formatImageUrl(bannerUrl);
          
          const img = document.createElement('img');
          img.onload = () => {
            console.log("تم تحميل صورة البانر بنجاح:", optimizedUrl);
            setImgSrc(optimizedUrl);
            setImageError(false);
            setImageLoaded(true);
          };
          img.onerror = (e) => {
            console.error("خطأ في تحميل صورة البانر:", optimizedUrl, e);
            
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
          
          img.decoding = "async";
          img.loading = "eager";
          img.src = optimizedUrl;
        } catch (error) {
          console.error("خطأ في معالجة رابط البانر:", error);
          setImageError(true);
        }
      };

      loadImage();

      const retryTimeout = setTimeout(() => {
        if (imageError) {
          console.log("إعادة محاولة تحميل البانر بعد مهلة");
          setImageError(false);
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

  return {
    imageError,
    imageLoaded,
    imgSrc,
    setImageError,
    setImageLoaded
  };
};
