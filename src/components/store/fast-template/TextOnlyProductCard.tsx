import React from "react";
import { Product, getDiscountedPrice, hasDiscount, getOriginalPrice } from "@/types/product";
import { Edit, Trash2, Plus, Heart, Share2 } from "lucide-react";
import { logVisitorActivity } from "@/hooks/analytics/useActivityLogger";

interface TextOnlyProductCardProps {
  product: Product;
  colorTheme?: string | null;
  onClick?: () => void;
  isStoreOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToCart?: (product: Product) => void;
  showAddButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string, productName?: string) => void;
  onShare?: (product: Product) => void;
  storeOwnerId?: string;
}

// تنسيق السعر بفواصل
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price);
};

/**
 * بطاقة منتج نصية بدون صور - للإنترنت البطيء
 * قالب N-0: تصميم خفيف وسريع
 */
const TextOnlyProductCard: React.FC<TextOnlyProductCardProps> = ({ 
  product, 
  colorTheme,
  onClick,
  isStoreOwner,
  onEdit,
  onDelete,
  onAddToCart,
  showAddButton = false,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  storeOwnerId,
}) => {
  const themeColor = colorTheme?.startsWith('#') ? colorTheme : '#3b82f6';
  
  return (
    <div 
      className="relative group p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
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

      {/* أزرار المفضلة والمشاركة والإضافة - للزوار */}
      {!isStoreOwner && (
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          {showAddButton && product.is_available !== false && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product);
              }}
              className="p-1.5 rounded-md transition-all shadow-lg text-white"
              style={{ backgroundColor: themeColor }}
              title="إضافة للسلة"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(product.id, product.name);
            }}
            className={`p-1.5 rounded-md transition-all shadow-lg ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 dark:bg-gray-700/80 text-gray-500 hover:text-red-500 backdrop-blur-sm'
            }`}
            title={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(product);
            }}
            className="p-1.5 bg-white/80 dark:bg-gray-700/80 text-gray-500 hover:text-blue-500 rounded-md transition-all shadow-lg backdrop-blur-sm"
            title="مشاركة"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div 
        onClick={() => {
          onClick?.();
          if (storeOwnerId && !isStoreOwner) {
            logVisitorActivity(storeOwnerId, 'product_click', { 
              product_id: product.id,
              product_name: product.name 
            });
          }
        }}
        className="cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
      >
        {/* اسم المنتج */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex-1">
            {product.name}
          </h3>
          
          {/* شارات المنتج */}
          <div className="flex gap-1 flex-shrink-0">
            {product.is_new && (
              <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                جديد
              </span>
            )}
            {product.is_popular && (
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                مميز
              </span>
            )}
          </div>
        </div>
        
        {/* الوصف */}
        {product.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {product.description}
          </p>
        )}
        
        {/* السعر والحالة */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {hasDiscount(product.discount_percentage, product.original_price, product.price) ? (
              <>
                <span 
                  className="text-base sm:text-lg font-bold"
                  style={{ color: themeColor }}
                >
                  {formatPrice(getDiscountedPrice(product.price, product.discount_percentage, product.original_price))} د.ع
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(getOriginalPrice(product.price, product.discount_percentage, product.original_price))} د.ع
                </span>
              </>
            ) : (
              <span 
                className="text-base sm:text-lg font-bold"
                style={{ color: themeColor }}
              >
                {formatPrice(product.price)} د.ع
              </span>
            )}
          </div>
          
          {product.is_available === false && (
            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded-full">
              غير متوفر
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextOnlyProductCard;
