
import React from "react";
import { Product } from "@/types/product";
import { CategoryImage } from "@/types/categoryImage";
import { FontSettings, ContactInfo } from "@/types/store";

interface DemoProductsDisplayProps {
  products: Product[];
  storeName: string;
  colorTheme: string;
  fontSettings?: FontSettings;
  contactInfo?: ContactInfo;
  categoryImages: CategoryImage[];
}

const DemoProductsDisplay: React.FC<DemoProductsDisplayProps> = ({
  products,
  storeName,
  colorTheme,
  fontSettings,
  categoryImages
}) => {
  return (
    <div className="py-6 space-y-8">
      <h2 className="text-2xl font-semibold text-right">منتجات تجريبية</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-muted-foreground text-sm mt-2">{product.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-lg">{product.price.toLocaleString()} د.ع</span>
                {product.category && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                    {product.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemoProductsDisplay;
