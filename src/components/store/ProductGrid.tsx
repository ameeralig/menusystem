
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, memo } from "react";

interface ProductGridProps {
  products: Product[];
  colorTheme?: string | null;
}

// استخدام memo للحد من إعادة الرسم غير الضرورية
const ProductCard = memo(({ product }: { product: Product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // تحسين URL الصورة عبر إضافة طابع زمني
  const getOptimizedImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?t=${Date.now()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
      style={{ minHeight: '300px' }} // تعيين ارتفاع أدنى ثابت
    >
      {product.image_url && (
        <div className="aspect-[16/9] overflow-hidden relative" style={{ height: '180px' }}>
          {/* هيكل عظمي يظهر قبل تحميل الصورة */}
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={getOptimizedImageUrl(product.image_url)}
            alt={product.name}
            width={320} // تحديد عرض ثابت
            height={180} // تحديد ارتفاع ثابت
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100 hover:scale-105" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            decoding="async"
            style={{ 
              aspectRatio: '16/9',
              objectFit: 'cover' 
            }}
          />
        </div>
      )}
      <div className="p-4" style={{ minHeight: '120px' }}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-right">{product.name}</h3>
          <span className="text-lg font-bold text-coral-500">{product.price.toLocaleString()} د.ع</span>
        </div>
        {product.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm text-right line-clamp-3">
            {product.description}
          </p>
        )}
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard'; // تعيين اسم للمكون لتسهيل التصحيح

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
