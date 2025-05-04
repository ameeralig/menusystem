
import { Product } from "@/types/product";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImagePlus, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPreviewCardProps {
  product: Partial<Product>;
  className?: string;
}

const ProductPreviewCard = ({ product, className }: ProductPreviewCardProps) => {
  // تنسيق السعر
  const formatPrice = (price: number | string | undefined) => {
    if (!price) return "0";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice.toLocaleString("ar-IQ");
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 h-full flex flex-col",
        className
      )}
    >
      <div className="relative">
        <AspectRatio ratio={1} className="bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <ImagePlus className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </AspectRatio>

        {/* قسم العلامات (جديد، الأكثر طلباً) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.is_new && (
            <div className="bg-yellow-500 text-white text-xs py-1 px-2 rounded-sm flex items-center">
              <Star className="w-3 h-3 ml-1" />
              <span>جديد</span>
            </div>
          )}

          {product.is_popular && (
            <div className="bg-red-500 text-white text-xs py-1 px-2 rounded-sm flex items-center">
              <TrendingUp className="w-3 h-3 ml-1" />
              <span>الأكثر طلباً</span>
            </div>
          )}
        </div>

        {/* التصنيف */}
        {product.category && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/70 text-white text-xs py-1 px-2 rounded-sm">
              {product.category}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-3 flex-grow">
        <h3 className="font-medium truncate">{product.name || "اسم المنتج"}</h3>
        {product.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
            {product.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <div className="text-primary font-bold">
          {formatPrice(product.price)} د.ع
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductPreviewCard;
