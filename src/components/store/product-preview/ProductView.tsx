
import { Product } from "@/types/product";
import { useEffect } from "react";

interface ProductViewProps {
  product: Product | null;
  isLoading: boolean;
}

const ProductView = ({ product, isLoading }: ProductViewProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium mb-2">لم يتم العثور على المنتج</h2>
        <p className="text-muted-foreground">
          المنتج غير موجود أو تم إزالته
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
      {product.image_url && (
        <div className="aspect-video w-full">
          <img 
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <span className="text-xl font-bold text-primary">
            {product.price.toLocaleString()} د.ع
          </span>
        </div>
        
        {product.description && (
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {product.description}
          </p>
        )}
        
        {/* التعامل مع الميزات إذا كان هناك أسطر متعددة في الوصف */}
        {product.description && product.description.includes('\n') && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2 text-lg">المميزات</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {product.description.split('\n').filter(Boolean).map((feature, index) => (
                <li key={index}>{feature.trim()}</li>
              ))}
            </ul>
          </div>
        )}
        
        {product.category && (
          <div className="text-sm text-muted-foreground mt-6">
            التصنيف: <span className="font-medium">{product.category}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductView;
