
import { useState, useEffect, useRef } from "react";
import { formatImageUrl } from "@/utils/storageHelpers";
import { isSafari, isIOS } from "@/utils/browserDetect";

export const useImageLoading = (bannerUrl?: string | null) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isSafariBrowser = isSafari() || isIOS();

  useEffect(() => {
    if (bannerUrl) {
      const loadImage = () => {
        try {
          const optimizedUrl = formatImageUrl(bannerUrl);
          
          const img = document.createElement('img');
          imgRef.current = img;
          
          // Safari: استخدام eager loading للبانر
          if (isSafariBrowser) {
            img.loading = 'eager';
          }
          
          img.onload = () => {
            console.log("تم تحميل صورة البانر بنجاح:", optimizedUrl);
            
            // Safari: استخدام decode() للتأكد من الرسم السلس
            if ('decode' in img) {
              img.decode()
                .then(() => {
                  setImgSrc(optimizedUrl);
                  setImageError(false);
                  setImageLoaded(true);
                })
                .catch(() => {
                  // fallback إذا فشل decode
                  setImgSrc(optimizedUrl);
                  setImageError(false);
                  setImageLoaded(true);
                });
            } else {
              setImgSrc(optimizedUrl);
              setImageError(false);
              setImageLoaded(true);
            }
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
          img.src = optimizedUrl;
        } catch (error) {
          console.error("خطأ في معالجة رابط البانر:", error);
          setImageError(true);
        }
      };

      loadImage();
      
      return () => {
        imgRef.current = null;
      };
    } else {
      setImgSrc(null);
    }
  }, [bannerUrl, isSafariBrowser]);

  return {
    imageError,
    imageLoaded,
    imgSrc,
    setImageError,
    setImageLoaded
  };
};
