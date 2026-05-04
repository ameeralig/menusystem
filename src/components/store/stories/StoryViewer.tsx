import React, { useState, useEffect, useCallback, useRef } from "react";
import { Product, getDiscountedPrice, hasDiscount, getOriginalPrice } from "@/types/product";
import { X, ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { optimizeImageUrl } from "@/utils/imageOptimizer";
import { createPortal } from "react-dom";

interface StoryViewerProps {
  products: Product[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string | null;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string, productName?: string) => void;
  onShare?: (product: Product) => void;
  isFavorite?: (productId: string) => boolean;
  showAddButton?: boolean;
  onViewed?: (productId: string) => void;
}

const STORY_DURATION = 5000; // 5 ثوان لكل ستوري

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price);
};

const StoryViewer: React.FC<StoryViewerProps> = ({
  products,
  initialIndex,
  isOpen,
  onClose,
  colorTheme,
  onAddToCart,
  onToggleFavorite,
  onShare,
  isFavorite,
  showAddButton = false,
  onViewed,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const product = products[currentIndex];
  const themeColor = colorTheme?.startsWith('#') ? colorTheme : '#8B5CF6';

  // إعادة التهيئة عند الفتح
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setIsPaused(false);
      setImageLoaded(false);
    }
  }, [isOpen, initialIndex]);

  // تسجيل المشاهدة
  useEffect(() => {
    if (isOpen && product) {
      onViewed?.(product.id);
    }
  }, [isOpen, currentIndex, product, onViewed]);

  // مؤقت التقدم التلقائي
  useEffect(() => {
    if (!isOpen || isPaused || !imageLoaded) return;

    const interval = 50;
    const step = (interval / STORY_DURATION) * 100;

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, imageLoaded, currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setImageLoaded(false);
    } else {
      onClose();
    }
  }, [currentIndex, products.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setImageLoaded(false);
    }
  }, [currentIndex]);

  // التعامل مع النقر على يمين/يسار الشاشة
  const handleTap = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;

    if (x < third) {
      goNext();
    } else if (x > third * 2) {
      goPrev();
    }
  }, [goPrev, goNext]);

  // التعامل مع اللمس (hold للإيقاف المؤقت + swipe)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    holdTimerRef.current = setTimeout(() => setIsPaused(true), 200);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setIsPaused(false);

    if (touchStart !== null) {
      const diff = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext();
        else goPrev();
      }
    }
    setTouchStart(null);
  }, [touchStart, goNext, goPrev]);

  if (!isOpen || !product) return null;

  const imgUrl = optimizeImageUrl(product.image_url, 'medium');
  const productIsFav = isFavorite?.(product.id) || false;
  const showDiscount = hasDiscount(product.discount_percentage, product.original_price, product.price);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          {/* شريط التقدم */}
          <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2 pt-3">
            {products.map((_, idx) => (
              <div key={idx} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/30">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: themeColor }}
                  initial={{ width: '0%' }}
                  animate={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                  }}
                  transition={{ duration: 0.05, ease: 'linear' }}
                />
              </div>
            ))}
          </div>

          {/* رأس الستوري */}
          <div className="absolute top-8 left-0 right-0 z-50 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full overflow-hidden border-2"
                style={{ borderColor: themeColor }}
              >
                {product.image_url ? (
                  <img src={optimizeImageUrl(product.image_url, 'thumbnail')} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: themeColor }}>
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-tight">{product.name}</p>
                {product.category && (
                  <p className="text-white/60 text-[10px]">{product.category}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsPaused(p => !p)} className="text-white/80 hover:text-white p-1">
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
              <button onClick={onClose} className="text-white/80 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* منطقة النقر واللمس */}
          <div
            className="absolute inset-0 z-10"
            onClick={handleTap}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {/* صورة المنتج */}
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {product.image_url ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-3 border-t-transparent animate-spin" style={{ borderColor: `${themeColor}40`, borderTopColor: 'transparent' }} />
                    </div>
                  )}
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  {/* تدرج سفلي */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}20` }}>
                  <span className="text-8xl font-bold text-white/20">{product.name.charAt(0)}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* معلومات المنتج السفلية */}
          <motion.div
            key={`info-${product.id}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 z-30 p-5 pb-8"
          >
            {/* الشارات */}
            <div className="flex gap-2 mb-3">
              {product.is_new && (
                <span className="bg-green-500/90 text-white text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm">
                  ✨ جديد
                </span>
              )}
              {product.is_popular && (
                <span className="bg-amber-500/90 text-white text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm">
                  🔥 الأكثر طلباً
                </span>
              )}
              {showDiscount && (
                <span className="bg-red-500/90 text-white text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm">
                  خصم {product.discount_percentage}%
                </span>
              )}
              {product.is_available === false && (
                <span className="bg-red-800/90 text-white text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm">
                  غير متوفر
                </span>
              )}
            </div>

            {/* اسم المنتج */}
            <h2 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">{product.name}</h2>

            {/* الوصف */}
            {product.description && (
              <p className="text-white/80 text-sm mb-3 line-clamp-2 drop-shadow">{product.description}</p>
            )}

            {/* السعر */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-white drop-shadow-lg">
                {showDiscount
                  ? formatPrice(getDiscountedPrice(product.price, product.discount_percentage, product.original_price))
                  : formatPrice(product.price)}
              </span>
              <span className="text-white/70 text-lg">د.ع</span>
              {showDiscount && (
                <span className="text-white/40 line-through text-base">
                  {formatPrice(getOriginalPrice(product.price, product.discount_percentage, product.original_price))}
                </span>
              )}
            </div>

            {/* أزرار التفاعل */}
            <div className="flex items-center gap-3 relative z-40">
              {showAddButton && product.is_available !== false && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart?.(product);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base shadow-xl"
                  style={{ backgroundColor: themeColor }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  أضف للسلة
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(product.id, product.name);
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-xl ${
                  productIsFav ? 'bg-red-500' : 'bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 text-white ${productIsFav ? 'fill-current' : ''}`} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(product);
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-xl shadow-xl"
              >
                <Share2 className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </motion.div>

          {/* أسهم التنقل (Desktop) */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-white/20 transition hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {currentIndex < products.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-white/20 transition hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* مؤشر العدد */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 text-white/40 text-xs">
            {currentIndex + 1} / {products.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default StoryViewer;
