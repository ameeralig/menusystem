
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

interface ProductsListProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductsList = ({ products, onSelectProduct, onDeleteProduct }: ProductsListProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg md:text-2xl">اختر المنتج الذي تريد تعديله</CardTitle>
            <CardDescription className="text-xs md:text-sm">انقر على المنتج الذي تريد تعديله</CardDescription>
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
      </CardHeader>
      <CardContent>
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
                    <ProductCard product={product} layout="grid" />
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
      </CardContent>
    </Card>
  );
};

export default ProductsList;
