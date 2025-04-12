
import { motion } from "framer-motion";
import { Product } from "@/types/product";

interface CategoryGridProps {
  categories: string[];
  getCategoryImage: (category: string) => string;
  onCategorySelect: (category: string) => void;
}

const CategoryCard = ({ 
  category, 
  image, 
  onClick 
}: { 
  category: string; 
  image: string; 
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
    onClick={onClick}
  >
    <div className="h-[140px] overflow-hidden">
      <img 
        src={image} 
        alt={category}
        className="w-full aspect-[16/9] object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h3 className="text-white text-2xl font-bold tracking-wide">
          {category}
        </h3>
      </div>
    </div>
  </motion.div>
);

const CategoryGrid = ({ categories, getCategoryImage, onCategorySelect }: CategoryGridProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
      {categories.map((category) => (
        category && (
          <CategoryCard
            key={category}
            category={category}
            image={getCategoryImage(category)}
            onClick={() => onCategorySelect(category)}
          />
        )
      ))}
    </div>
  );
};

export default CategoryGrid;
