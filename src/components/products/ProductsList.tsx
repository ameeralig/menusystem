
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProductsTable from "./ProductsTable";
import EmptyProducts from "./EmptyProducts";
import { Product } from "@/types/product";

interface ProductsListProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
}

const ProductsList = ({ products, onSelectProduct }: ProductsListProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-lg md:text-2xl">اختر المنتج الذي تريد تعديله</CardTitle>
        <CardDescription className="text-xs md:text-sm">انقر على زر "تعديل" بجانب المنتج الذي تريد تعديله</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <EmptyProducts />
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <ProductsTable 
              products={products} 
              onEdit={onSelectProduct}
              onDelete={() => {}} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsList;
