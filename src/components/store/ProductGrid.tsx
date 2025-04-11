
import { motion } from "framer-motion";
import { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
}

const ProductCard = ({ product }: { product: Product }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
  >
    {product.image_url && (
      <div className="aspect-[16/9] overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
    )}
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-right">{product.name}</h3>
        <span className="text-lg font-bold text-coral-500">{product.price.toLocaleString()} د.ع</span>
      </div>
      {product.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm text-right">
          {product.description}
        </p>
      )}
    </div>
  </motion.div>
);

const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
