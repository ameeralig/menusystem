import React, { useState } from "react";
import { Product } from "@/types/product";

interface CompactProductCardProps {
  product: Product;
  colorTheme?: string | null;
  onClick?: () => void;
}

// تحسين رابط الصورة لتحميل أسرع
const optimizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return "https://placehold.co/120x120/e2e8f0/64748b?text=No+Image";
  
  // تحويل إلى صيغة webp بجودة منخفضة للصور الصغيرة
  if (url.includes('supabase')) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('width', '120');
    urlObj.searchParams.set('height', '120');
    urlObj.searchParams.set('quality', '60');
    urlObj.searchParams.set('format', 'webp');
    return urlObj.toString();
  }
  
  return url;
};

// تنسيق السعر بفواصل
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price);
};

const CompactProductCard: React.FC<CompactProductCardProps> = ({ 
  product, 
  colorTheme,
  onClick
}) => {
  const optimizedImageUrl = optimizeImageUrl(product.image_url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* صورة المنتج - مربع صغير */}
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
        {/* Blur placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
        )}
        
        <img
          src={optimizedImageUrl}
          alt={product.name}
          width="120"
          height="120"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
          }`}
          style={{
            // إضافة cache control للمتصفح
            imageRendering: 'crisp-edges',
          }}
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
  );
};

export default CompactProductCard;
