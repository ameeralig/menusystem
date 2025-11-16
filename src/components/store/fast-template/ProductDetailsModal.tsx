import React from "react";
import { Product } from "@/types/product";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string | null;
}

// تنسيق السعر بفواصل
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price);
};

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  colorTheme,
}) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* خلفية ضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* الحاوية العائمة */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* زر الإغلاق */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* صورة المنتج */}
              <div className="relative w-full h-64 sm:h-80 bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.image_url || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                  }}
                />

                {/* شارات */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_new && (
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                      جديد
                    </span>
                  )}
                  {product.is_popular && (
                    <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                      مميز
                    </span>
                  )}
                  {product.is_available === false && (
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                      غير متوفر
                    </span>
                  )}
                </div>
              </div>

              {/* تفاصيل المنتج */}
              <div className="p-6">
                {/* اسم المنتج */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h2>

                {/* التصنيف */}
                {product.category && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {product.category}
                  </p>
                )}

                {/* السعر */}
                <div 
                  className="text-3xl sm:text-4xl font-bold mb-4"
                  style={{ 
                    color: colorTheme?.startsWith('#') ? colorTheme : undefined 
                  }}
                >
                  {formatPrice(product.price)} د.ع
                </div>

                {/* الوصف */}
                {product.description && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      الوصف
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailsModal;
