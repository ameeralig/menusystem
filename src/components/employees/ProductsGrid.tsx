import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { CachedImage } from "@/components/store/CachedImage";
import { formatImageUrl } from "@/utils/storageHelpers";

interface ProductsGridProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductsGrid = ({ products, onAddToCart }: ProductsGridProps) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const incrementQuantity = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }));
  };

  const decrementQuantity = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1),
    }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = getQuantity(product.id);
    onAddToCart(product, quantity);
    // إعادة تعيين الكمية
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[product.id];
      return newQuantities;
    });
  };

  // تجميع المنتجات حسب التصنيف
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || "غير مصنف";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryProducts.map((product) => (
              <Card key={product.id} className="p-4 space-y-3">
                {product.image_url && (
                  <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                    <CachedImage
                      src={formatImageUrl(product.image_url) || product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      isUnavailable={!product.is_available}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-foreground line-clamp-1">
                      {product.name}
                    </h4>
                    {(product.is_new || product.is_popular) && (
                      <div className="flex gap-1 flex-shrink-0">
                        {product.is_new && (
                          <Badge variant="secondary" className="text-xs">
                            جديد
                          </Badge>
                        )}
                        {product.is_popular && (
                          <Badge variant="default" className="text-xs">
                            مميز
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-primary">
                      {Number(product.price).toFixed(0)} د.ع
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => decrementQuantity(product.id)}
                      className="h-9 flex-1"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-base font-medium min-w-[30px] text-center">
                      {getQuantity(product.id)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementQuantity(product.id)}
                      className="h-9 flex-1"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    className="w-full mt-2"
                    onClick={() => handleAddToCart(product)}
                  >
                    إضافة للسلة
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد منتجات متاحة</p>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
