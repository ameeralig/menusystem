import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { formatImageUrl } from "@/utils/storageHelpers";
import { CachedImage } from "./CachedImage";

interface ProductGridProps {
  products: Product[];
  colorTheme?: string | null;
}

const ProductCard = ({ product }: { product: Product }) => {
  // استخدام formatImageUrl المحسنة للحصول على روابط الصور المباشرة من أي مصدر
  const getOptimizedImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    try {
      return formatImageUrl(url);
    } catch (error) {
      console.error("خطأ في تحويل رابط الصورة:", error, url);
      return url; // استخدام الرابط الأصلي في حال فشل التحويل
    }
  };

  // دالة لتنسيق عرض السعر
  const formatPrice = (price: number) => {
    const priceString = price.toLocaleString();
    const firstDigit = priceString.charAt(0);
    const remainingDigits = priceString.slice(1);
    
    return (
      <span className="text-lg font-bold text-green-600 dark:text-green-400">
        <span className="text-lg">{firstDigit}</span>
        <span className="text-sm">{remainingDigits}</span>
        <span className="text-sm"> د.ع</span>
      </span>
    );
  };

  const isAvailable = product.is_available !== false;
  const isPopular = product.is_popular;
  const isNew = product.is_new;

  // تحديد فئات CSS للتأثيرات المختلفة
  const getCardClasses = () => {
    let baseClasses = "bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative";
    
    if (isPopular) {
      baseClasses += " fire-glow-red";
    } else if (isNew) {
      baseClasses += " fire-glow-blue";
    }
    
    return baseClasses;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={getCardClasses()}
    >
      {/* تأثير النيران للمنتجات عالية الطلب */}
      {isPopular && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="fire-effect-red"></div>
        </div>
      )}
      
      {/* تأثير النيران الزرقاء للمنتجات الجديدة */}
      {isNew && !isPopular && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="fire-effect-blue"></div>
        </div>
      )}

      {product.image_url && (
        <div className="aspect-[16/9] overflow-hidden relative">
          <CachedImage
            src={getOptimizedImageUrl(product.image_url) || product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105"
            isUnavailable={!isAvailable}
          />
        </div>
      )}
      <div className="p-4 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-lg font-semibold text-right ${
            !isAvailable ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
          }`}>
            {product.name}
          </h3>
          <div className={!isAvailable ? "opacity-60" : ""}>
            {formatPrice(product.price)}
          </div>
        </div>
        {product.description && (
          <p className={`text-sm text-right ${
            !isAvailable ? "text-gray-400" : "text-gray-600 dark:text-gray-300"
          }`}>
            {product.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const ProductGrid = ({ products, colorTheme }: ProductGridProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
