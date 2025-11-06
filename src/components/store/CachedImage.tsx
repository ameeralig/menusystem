import React, { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { imageCache } from "@/utils/imageCache";

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  isUnavailable?: boolean;
}

/**
 * مكون صورة محسّن مع lazy loading و caching ذكي
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  className = "",
  onLoad,
  onError,
  isUnavailable = false,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // إعداد Intersection Observer للـ lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            // إلغاء المراقبة بعد بدء التحميل
            if (imgRef.current && observerRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: "50px", // بدء التحميل قبل 50px من ظهور الصورة
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src]);

  const loadImage = async () => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);

      // تحميل الصورة مع الـ cache
      const cachedUrl = await imageCache.loadImage(src);
      setImageSrc(cachedUrl);
      setIsLoading(false);
      onLoad?.();
    } catch (error) {
      console.error("خطأ في تحميل الصورة:", error);
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div className={`relative ${className}`}>
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <span className="text-muted-foreground text-sm">فشل تحميل الصورة</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={imageSrc || undefined}
          alt={alt}
          className={`${className} transition-all duration-500 ${
            isLoading ? "blur-lg scale-105 opacity-70" : "blur-0 scale-100 opacity-100"
          } ${isUnavailable ? "grayscale opacity-50" : ""}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      )}
      
      {isUnavailable && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <span className="text-white font-bold text-lg">غير متوفر</span>
        </div>
      )}
    </div>
  );
};
