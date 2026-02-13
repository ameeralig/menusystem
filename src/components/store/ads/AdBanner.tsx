import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdBannerProps {
  adsType: "google" | "custom";
  customAds: string[];
  colorTheme?: string | null;
}

const AdBanner = ({ adsType, customAds, colorTheme }: AdBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (customAds.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % customAds.length);
  }, [customAds.length]);

  const prevSlide = useCallback(() => {
    if (customAds.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + customAds.length) % customAds.length);
  }, [customAds.length]);

  // تبديل تلقائي كل 4 ثواني
  useEffect(() => {
    if (adsType !== "custom" || customAds.length <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [adsType, customAds.length, nextSlide]);

  // إعلانات جوجل
  if (adsType === "google") {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4 py-2">
          <div 
            className="w-full min-h-[90px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-400"
            id="google-ad-banner"
          >
            {/* مكان إعلان جوجل AdSense - يتم استبداله بكود AdSense الحقيقي */}
            <div className="text-center space-y-1">
              <p className="text-gray-400 dark:text-gray-500">إعلان مُموّل</p>
              <p className="text-[10px] text-gray-300 dark:text-gray-600">Google AdSense</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // إعلانات مخصصة (سلايدر)
  if (adsType === "custom" && customAds.length > 0) {
    return (
      <div className="w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
        <div className="relative w-full h-[120px] sm:h-[160px] md:h-[200px]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={customAds[currentIndex]}
              alt={`إعلان ${currentIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>

          {/* أزرار التنقل */}
          {customAds.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* نقاط المؤشر */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {customAds.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-white w-5"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* علامة إعلان صغيرة */}
        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full z-10">
          إعلان
        </div>
      </div>
    );
  }

  return null;
};

export default AdBanner;
