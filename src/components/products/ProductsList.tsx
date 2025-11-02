import { Product } from "@/types/product";
import EmptyProducts from "./EmptyProducts";
import ProductsTable from "./ProductsTable";

interface ProductsListProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductsList = ({ products, onSelectProduct, onDeleteProduct }: ProductsListProps) => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-base md:text-lg font-medium">اختر المنتج الذي تريد تعديله</h4>
        <p className="text-xs md:text-sm text-muted-foreground">انقر على المنتج الذي تريد تعديله</p>
      </div>
      
      {products.length === 0 ? (
        <EmptyProducts />
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <ProductsTable 
            products={products} 
            onEdit={onSelectProduct}
            onDelete={onDeleteProduct || (() => {})} 
          />
        </div>
      )}
    </div>
  );
};

export default ProductsList;
