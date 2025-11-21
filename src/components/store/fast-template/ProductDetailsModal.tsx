import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { X, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string | null;
  isStoreOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
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
  isStoreOwner,
  onEdit,
  onDelete,
}) => {
  // Progressive Loading: تحميل thumbnail أولاً ثم medium
  const [displayedImageSrc, setDisplayedImageSrc] = useState<string>("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (product?.image_url && isOpen) {
      // البدء بصورة thumbnail للعرض الفوري
      const thumbnailUrl = optimizeImageUrl(product.image_url, 'thumbnail');
      setDisplayedImageSrc(thumbnailUrl);
      setIsImageLoaded(false);

      // تحميل صورة medium في الخلفية
      const mediumImg = new Image();
      mediumImg.src = optimizeImageUrl(product.image_url, 'medium');
      
      mediumImg.onload = () => {
        setDisplayedImageSrc(mediumImg.src);
        setIsImageLoaded(true);
      };

      mediumImg.onerror = () => {
        // في حالة الفشل، نبقى على thumbnail
        setIsImageLoaded(true);
      };
    }
  }, [product?.image_url, isOpen]);

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

              {/* صورة المنتج مع Progressive Loading */}
              <div className="relative w-full h-64 sm:h-80 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img
                  src={displayedImageSrc || optimizeImageUrl(product.image_url, 'thumbnail')}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isImageLoaded ? 'blur-0 scale-100' : 'blur-sm scale-105'
                  }`}
                  onError={(e) => {
                    e.currentTarget.src = optimizeImageUrl(null, 'medium');
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

                {/* أزرار المالك */}
                {isStoreOwner && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => {
                        onEdit?.();
                        onClose();
                      }}
                      className="flex-1"
                      variant="default"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل المنتج
                    </Button>
                    <Button
                      onClick={() => {
                        onDelete?.();
                        onClose();
                      }}
                      className="flex-1"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف المنتج
                    </Button>
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
