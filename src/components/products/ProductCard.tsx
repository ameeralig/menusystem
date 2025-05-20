
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product as ProductType } from "@/types/product";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string | null;
  is_new: boolean;
  is_popular: boolean;
}

interface ProductCardProps {
  product: Product;
  layout: "grid" | "list";
}

export const ProductCard = ({ product, layout }: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // تحسين رابط الصورة باستخدام أداة التحسين الجديدة
  const optimizedImageUrl = product.image_url 
    ? optimizeImageUrl(product.image_url, {
        format: 'webp',
        quality: 80,
        bustCache: true
      }) 
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={layout === "list" ? "w-full" : "w-full"}
    >
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 dark:bg-gray-800">
        {product.image_url && (
          <div className="relative aspect-[4/3] overflow-hidden">
            {!imageLoaded && !imageError && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            <motion.img
              loading="lazy"
              fetchPriority="auto"
              decoding="async"
              src={optimizedImageUrl || product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {product.is_new && (
                <Badge variant="secondary" className="bg-yellow-500/90 text-white border-none">
                  جديد 🔥
                </Badge>
              )}
              {product.is_popular && (
                <Badge variant="secondary" className="bg-red-500/90 text-white border-none">
                  الأكثر طلباً ⭐
                </Badge>
              )}
            </div>
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-lg font-bold text-right line-clamp-1 flex-1">
                {product.name}
              </h3>
              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}
            </div>
            
            {product.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm text-right line-clamp-2">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                {product.is_new && (
                  <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                    <Star className="h-3 w-3" />
                    منتج جديد
                  </span>
                )}
                {product.is_popular && (
                  <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <TrendingUp className="h-3 w-3" />
                    الأكثر طلباً
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 text-right">
                {product.price.toLocaleString()} د.ع
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
