
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import EmptyProducts from "./EmptyProducts";
import { ProductCard } from "../products/ProductCard";
import { Grid, ListFilter, Rows } from "lucide-react";
import { useState } from "react";
import ProductsTable from "./ProductsTable";

interface ProductsListProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductsList = ({ products, onSelectProduct, onDeleteProduct }: ProductsListProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-base md:text-lg font-medium">اختر المنتج الذي تريد تعديله</h4>
          <p className="text-xs md:text-sm text-muted-foreground">انقر على المنتج الذي تريد تعديله</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("list")}
            className="h-8 w-8 p-0"
          >
            <Rows className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="h-8 text-xs font-normal"
          >
            <ListFilter className="h-3 w-3 ml-1" />
            تغيير العرض
          </Button>
        </div>
      </div>
      
      {products.length === 0 ? (
        <EmptyProducts />
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <ProductCard 
                    product={{
                      ...product,
                      description: product.description || "",
                      image_url: product.image_url || null,
                      category: product.category || null,
                      is_new: product.is_new || false,
                      is_popular: product.is_popular || false,
                    }} 
                    layout="grid" 
                  />
                </div>
              ))}
            </div>
          ) : (
            <ProductsTable 
              products={products} 
              onEdit={onSelectProduct}
              onDelete={onDeleteProduct || (() => {})} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
