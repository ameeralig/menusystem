import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";
import { formatImageUrl } from "@/utils/storageHelpers";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { optimizeSupabaseImage } from "@/utils/imageOptimization";

interface ProductGridProps {
  products: Product[];
  colorTheme?: string | null;
  isEmployeeView?: boolean;
}

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// مكون صورة محسن مع Intersection Observer
const LazyImage = ({ src, alt, className = "", onLoad, onError }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // تحسين الصورة للأبعاد المناسبة
  const optimizedSrc = optimizeSupabaseImage(src, {
    width: 400,
    quality: 75,
    format: 'webp'
  });

  // مراقب التقاطع لتحميل الصور فقط عند الحاجة
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "100px" // تحميل مسبق قبل وصول الصورة للعرض
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={containerRef} className="aspect-[16/9] overflow-hidden relative">
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isLoaded ? "opacity-100 hover:scale-105" : "opacity-0"
          } ${className}`}
          loading="lazy"
          decoding="async"
          fetchPriority="auto"
          width="400"
          height="225"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">
            {alt}
          </p>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product, isEmployeeView }: { product: Product; isEmployeeView?: boolean }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const cart = isEmployeeView ? useCart() : null;

  // تحسين رابط الصورة
  const getOptimizedImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    try {
      return formatImageUrl(url);
    } catch (error) {
      console.error("خطأ في تحويل رابط الصورة:", error, url);
      return url;
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

  const handleAddToCart = () => {
    if (cart && isAvailable) {
      cart.addItem(product, 1);
      toast.success(`تمت إضافة ${product.name} للسلة`);
    }
  };

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
      transition={{ duration: 0.3 }}
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
        <LazyImage
          src={getOptimizedImageUrl(product.image_url) || product.image_url}
          alt={product.name}
          className={!isAvailable ? "grayscale opacity-60" : ""}
          onLoad={() => setImageLoaded(true)}
        />
      )}

      {/* عرض حالة عدم التوفر */}
      {!isAvailable && imageLoaded && (
        <div className="absolute top-0 right-0 left-0 bottom-[60%] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
            غير متوفر
          </div>
        </div>
      )}

      <div className="p-4 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-lg font-semibold text-right line-clamp-2 ${
            !isAvailable ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
          }`}>
            {product.name}
          </h3>
          <div className={!isAvailable ? "opacity-60" : ""}>
            {formatPrice(product.price)}
          </div>
        </div>
        {product.description && (
          <p className={`text-sm text-right line-clamp-2 ${
            !isAvailable ? "text-gray-400" : "text-gray-600 dark:text-gray-300"
          }`}>
            {product.description}
          </p>
        )}
        
        {isEmployeeView && isAvailable && (
          <Button
            onClick={handleAddToCart}
            className="w-full mt-3 gap-2"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            إضافة للسلة
          </Button>
        )}
      </div>
    </motion.div>
  );
};

const OptimizedProductGrid = ({ products, colorTheme, isEmployeeView = false }: ProductGridProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} isEmployeeView={isEmployeeView} />
      ))}
    </div>
  );
};

export default OptimizedProductGrid;