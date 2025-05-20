
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface ProductGridProps {
  products: Product[];
  colorTheme?: string | null;
}

const ProductCard = ({ product }: { product: Product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);

  // تحسين معالجة الصور - إضافة تحميل مسبق ومعالجة أكثر فعالية
  useEffect(() => {
    if (product.image_url) {
      // إنشاء رابط محسن للصورة
      const optimized = optimizeImageUrl(product.image_url, { 
        format: 'webp',
        quality: 85,  // تحسين الجودة قليلاً
        bustCache: true,
        isImportant: product.is_popular || product.is_new // إعطاء أولوية للمنتجات الجديدة والمشهورة
      });
      
      setOptimizedUrl(optimized);
      
      // تحميل مسبق للصورة في الخلفية
      if (optimized) {
        const img = new Image();
        img.src = optimized;
      }
    }
  }, [product.image_url, product.is_popular, product.is_new]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
    >
      {optimizedUrl && (
        <div className="aspect-[16/9] overflow-hidden relative">
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={optimizedUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100 hover:scale-105" : "opacity-0"
            }`}
            loading="lazy"
            fetchPriority={product.is_popular || product.is_new ? "high" : "auto"}
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
  // تحميل مسبق للمنتجات المهمة
  useEffect(() => {
    // تحميل صور المنتجات الشعبية والجديدة مسبقاً
    const importantProducts = products.filter(p => p.is_popular || p.is_new);
    
    if (importantProducts.length > 0) {
      importantProducts.forEach(product => {
        if (product.image_url) {
          const optimized = optimizeImageUrl(product.image_url, { 
            format: 'webp',
            quality: 90,
            bustCache: true,
            isImportant: true
          });
          
          if (optimized) {
            const img = new Image();
            img.src = optimized;
            img.fetchPriority = "high";
          }
        }
      });
    }
  }, [products]);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
