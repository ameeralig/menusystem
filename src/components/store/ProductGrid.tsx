
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface ProductGridProps {
  products: Product[];
  colorTheme?: string | null;
}

const ProductCard = ({ product }: { product: Product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // تحويل الصورة إلى صيغة محسنة باستخدام أداة التحسين الجديدة
  const optimizedImageUrl = product.image_url 
    ? optimizeImageUrl(product.image_url, { 
        format: 'webp',
        quality: 80,
        bustCache: true
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
    >
      {optimizedImageUrl && (
        <div className="aspect-[16/9] overflow-hidden relative">
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={optimizedImageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100 hover:scale-105" : "opacity-0"
            }`}
            loading="lazy"
            fetchpriority="auto"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
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
