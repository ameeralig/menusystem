import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface FavoritesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  products: Product[];
  colorTheme?: string | null;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onProductClick?: (product: Product) => void;
}

// تنسيق السعر
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price);
};

const FavoritesSheet: React.FC<FavoritesSheetProps> = ({
  isOpen,
  onClose,
  favorites,
  products,
  colorTheme,
  onRemove,
  onClear,
  onProductClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // الحصول على لون الثيم
  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) {
      return colorTheme;
    }
    const themeColors: { [key: string]: string } = {
      coral: '#fb923c',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
    };
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  // فلترة المنتجات المفضلة
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية الضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
          />

          {/* البطاقة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm">
              {/* زر الإغلاق */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* البطاقة الزجاجية */}
              <div 
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* تأثير الإضاءة العلوي */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-30"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                  }}
                />

                {/* هيدر البطاقة */}
                <div className="relative p-5 text-center text-white border-b border-white/20">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg"
                  >
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold drop-shadow-lg"
                  >
                    المفضلة
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 text-sm"
                  >
                    {favoriteProducts.length} منتج محفوظ
                  </motion.p>
                </div>

                {/* محتوى المفضلات */}
                <div className="relative max-h-[50vh] overflow-y-auto p-4">
                  {favoriteProducts.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-8 text-center text-white/80"
                    >
                      <Heart className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm">لا توجد منتجات مفضلة</p>
                      <p className="text-xs opacity-70">اضغط على أيقونة القلب لإضافة منتجات</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {favoriteProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-2.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/10"
                        >
                          {/* الصورة */}
                          <div 
                            onClick={() => {
                              onClose();
                              setTimeout(() => onProductClick?.(product), 300);
                            }}
                            className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white/20 cursor-pointer hover:scale-105 transition-transform"
                          >
                            <img
                              src={optimizeImageUrl(product.image_url, 'thumbnail')}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/120x120/e2e8f0/64748b?text=No+Image";
                              }}
                            />
                          </div>

                          {/* التفاصيل */}
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => {
                              onClose();
                              setTimeout(() => onProductClick?.(product), 300);
                            }}
                          >
                            <h3 className="font-semibold text-white text-sm truncate">
                              {product.name}
                            </h3>
                            <p className="text-white/90 text-xs font-medium">
                              {formatPrice(product.price)} د.ع
                            </p>
                          </div>

                          {/* زر الحذف */}
                          <button
                            onClick={() => onRemove(product.id)}
                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-red-500/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* أزرار الإجراءات - خارج البطاقة */}
              {favoriteProducts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-2 mt-4"
                >
                  <Button
                    variant="outline"
                    onClick={onClear}
                    className="flex-1 h-12 rounded-2xl bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-red-500/30"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    <span className="text-sm">مسح الكل</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FavoritesSheet;
