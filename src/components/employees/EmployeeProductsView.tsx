import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface EmployeeProductsViewProps {
  products: Product[];
}

const EmployeeProductsView = ({ products }: EmployeeProductsViewProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`تمت إضافة ${product.name} للسلة`);
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
          <h3 className="text-lg font-semibold text-foreground sticky top-20 bg-background/95 backdrop-blur-sm py-2 z-10">
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {product.image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground line-clamp-2 flex-1">
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
                    <span className="text-xl font-bold text-primary">
                      {Number(product.price).toFixed(0)} د.ع
                    </span>

                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      إضافة للسلة
                    </Button>
                  </div>
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

export default EmployeeProductsView;
