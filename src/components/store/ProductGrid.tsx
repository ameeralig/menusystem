
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface ProductGridProps {
  products: Product[];
  colorTheme?: string | null;
}

const ProductCard = ({ product }: { product: Product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // تحويل الصورة إلى صيغة WebP عندما يكون ذلك ممكنًا
  const getOptimizedImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    
    const baseUrl = url.split('?')[0];
    
    // تحسين URL الصورة لاستخدام WebP إذا كان متاحًا عبر خدمة تخزين Supabase أو عبر CDN
    if (baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')) {
      return `${baseUrl}?format=webp&quality=80&t=${Date.now()}`;
    }
    
    // إضافة طابع زمني للتأكد من تحميل أحدث إصدار من الصورة
    return `${baseUrl}?t=${Date.now()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
    >
      {product.image_url && (
        <div className="aspect-[16/9] overflow-hidden relative">
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={getOptimizedImageUrl(product.image_url)}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100 hover:scale-105" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            decoding="async"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-right">{product.name}</h3>
          <span className="text-lg font-bold text-coral-500">{product.price.toLocaleString()} د.ع</span>
        </div>
        {product.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm text-right">
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
