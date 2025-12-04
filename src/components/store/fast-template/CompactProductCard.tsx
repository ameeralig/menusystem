import React, { useState, useRef, useEffect } from "react";
import { Product } from "@/types/product";
import { Edit, Trash2, Plus } from "lucide-react";
import { optimizeImageUrl } from "@/utils/imageOptimizer";
import { Button } from "@/components/ui/button";
import { isSafari, isIOS } from "@/utils/browserDetect";

interface CompactProductCardProps {
  product: Product;
  colorTheme?: string | null;
  onClick?: () => void;
  isStoreOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToCart?: (product: Product) => void;
  showAddButton?: boolean;
}

// تنسيق السعر بفواصل
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price);
};

const CompactProductCard: React.FC<CompactProductCardProps> = ({ 
  product, 
  colorTheme,
  onClick,
  isStoreOwner,
  onEdit,
  onDelete,
  onAddToCart,
  showAddButton = false
}) => {
  // استخدام حجم thumbnail للبطاقات الصغيرة (120x120, quality 60)
  const optimizedImageUrl = optimizeImageUrl(product.image_url, 'thumbnail');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const isSafariBrowser = isSafari() || isIOS();
  
  // Safari: استخدام decode() للتحميل الأسلس
  useEffect(() => {
    if (imageLoaded && imgRef.current && 'decode' in imgRef.current) {
      imgRef.current.decode().catch(() => {});
    }
  }, [imageLoaded]);
  
  return (
    <div 
      className="relative group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      {/* أزرار التعديل والحذف للمالك */}
      {isStoreOwner && (
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-lg"
            title="تعديل"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-lg"
            title="حذف"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div 
        onClick={onClick}
        className="flex items-center gap-3 flex-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
      {/* صورة المنتج - مربع صغير */}
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
        {/* Blur placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
        )}
        
        <img
          ref={imgRef}
          src={optimizedImageUrl}
          alt={product.name}
          width="120"
          height="120"
          loading={isSafariBrowser ? "eager" : "lazy"}
          decoding="async"
          // @ts-ignore
          fetchpriority="low"
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageError(true);
            e.currentTarget.src = "https://placehold.co/120x120/e2e8f0/64748b?text=No+Image";
          }}
        />
        
        {/* شارة جديد أو غير متوفر */}
        {product.is_new && (
          <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            جديد
          </span>
        )}
        {product.is_available === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-[10px] font-medium">غير متوفر</span>
          </div>
        )}
      </div>

      {/* معلومات المنتج */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
          {product.name}
        </h3>
        
        {/* السعر */}
        <div className="flex items-center gap-2">
          <span 
            className="text-base sm:text-lg font-bold text-gray-900 dark:text-white"
            style={{ 
              color: colorTheme?.startsWith('#') ? colorTheme : undefined 
            }}
          >
            {formatPrice(product.price)} د.ع
          </span>
          
          {product.is_popular && (
            <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full font-medium">
              مميز
            </span>
          )}
        </div>
        
        {/* الوصف - اختياري على الشاشات الكبيرة فقط */}
        {product.description && (
          <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
            {product.description}
          </p>
        )}
      </div>
      </div>

      {/* زر الإضافة للسلة */}
      {showAddButton && product.is_available !== false && !isStoreOwner && (
        <Button
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          style={{
            backgroundColor: colorTheme?.startsWith('#') ? colorTheme : undefined,
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default CompactProductCard;
