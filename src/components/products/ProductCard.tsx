
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product as ProductType } from "@/types/product";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string | null;
  is_new: boolean;
  is_popular: boolean;
  is_available?: boolean | null;
}

interface ProductCardProps {
  product: Product;
  layout: "grid" | "list";
}

export const ProductCard = ({ product, layout }: ProductCardProps) => {
  // دالة لتنسيق عرض السعر
  const formatPrice = (price: number) => {
    const priceString = price.toLocaleString();
    const firstDigit = priceString.charAt(0);
    const remainingDigits = priceString.slice(1);
    
    return (
      <span className="text-xl font-bold text-green-600 dark:text-green-400 text-right">
        <span className="text-xl">{firstDigit}</span>
        <span className="text-base">{remainingDigits}</span>
        <span className="text-base"> د.ع</span>
      </span>
    );
  };

  const isAvailable = product.is_available !== false;
  const isPopular = product.is_popular;
  const isNew = product.is_new;

  // تحديد فئات CSS للتأثيرات المختلفة
  const getCardClasses = () => {
    let baseClasses = "group overflow-hidden h-full hover:shadow-lg transition-all duration-300 dark:bg-gray-800 relative";
    
    if (isPopular) {
      baseClasses += " fire-glow-red";
    } else if (isNew) {
      baseClasses += " fire-glow-blue";
    }
    
    return baseClasses;
  };

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
      <Card className={getCardClasses()}>
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
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.img
              loading="lazy"
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                !isAvailable ? "grayscale opacity-60" : ""
              }`}
            />
            
            {/* عرض حالة عدم التوفر */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  غير متوفر
                </div>
              </div>
            )}
            
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
        <CardContent className="p-4 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start gap-2">
              <h3 className={`text-lg font-bold text-right line-clamp-1 flex-1 ${
                !isAvailable ? "text-gray-500" : ""
              }`}>
                {product.name}
              </h3>
              {product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}
            </div>
            
            {product.description && (
              <p className={`text-sm text-right line-clamp-2 ${
                !isAvailable ? "text-gray-400" : "text-gray-600 dark:text-gray-300"
              }`}>
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
              <div className={!isAvailable ? "opacity-60" : ""}>
                {formatPrice(product.price)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
