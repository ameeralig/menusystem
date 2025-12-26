import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2, ShoppingBag } from "lucide-react";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
          />

          {/* الشيت */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl"
          >
            {/* الهيدر */}
            <div 
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: themeColor }} />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  المفضلة ({favoriteProducts.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* المحتوى */}
            <div className="flex-1 overflow-y-auto h-[calc(100vh-140px)] p-4">
              {favoriteProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <Heart className="w-10 h-10" style={{ color: themeColor }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    لا توجد منتجات مفضلة
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    اضغط على أيقونة القلب لإضافة منتجات للمفضلة
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      {/* الصورة */}
                      <div 
                        onClick={() => onProductClick?.(product)}
                        className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer hover:scale-105 transition-transform"
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
                        onClick={() => onProductClick?.(product)}
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h3>
                        <p 
                          className="text-sm font-bold"
                          style={{ color: themeColor }}
                        >
                          {formatPrice(product.price)} د.ع
                        </p>
                      </div>

                      {/* زر الحذف */}
                      <button
                        onClick={() => onRemove(product.id)}
                        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* الفوتر */}
            {favoriteProducts.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onClear}
                  className="w-full h-11 rounded-xl text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  مسح الكل
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FavoritesSheet;
