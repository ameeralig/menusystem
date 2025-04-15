import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { CSSProperties, useEffect, useState } from "react";

interface FontSettings {
  categoryText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
}

interface CategoryGridProps {
  categories: string[];
  getCategoryImage: (category: string) => string;
  onCategorySelect: (category: string) => void;
  fontSettings?: FontSettings;
}

const CategoryCard = ({ 
  category, 
  image, 
  onClick,
  fontStyle 
}: { 
  category: string; 
  image: string; 
  onClick: () => void;
  fontStyle: CSSProperties;
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
        <h3 
          className="text-white text-2xl font-bold tracking-wide"
          style={fontStyle}
        >
          {category}
        </h3>
      </div>
    </div>
  </motion.div>
);

const CategoryGrid = ({ 
  categories, 
  getCategoryImage, 
  onCategorySelect,
  fontSettings 
}: CategoryGridProps) => {
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  
  useEffect(() => {
    if (fontSettings?.categoryText?.isCustom && fontSettings?.categoryText?.customFontUrl) {
      const uniqueId = `category-text-font-${Math.random().toString(36).substring(2, 9)}`;
      setFontId(uniqueId);
      
      const fontFace = new FontFace(uniqueId, `url(${fontSettings.categoryText.customFontUrl})`);
      
      fontFace.load().then((loadedFontFace) => {
        document.fonts.add(loadedFontFace);
        setFontFaceLoaded(true);
      }).catch(err => {
        console.error("Error loading custom font:", err);
      });
      
      return () => {
        const styleElement = document.getElementById(`style-${uniqueId}`);
        if (styleElement) {
          styleElement.remove();
        }
      };
    }
  }, [fontSettings?.categoryText?.customFontUrl, fontSettings?.categoryText?.isCustom]);
  
  const getCategoryTextStyle = (): CSSProperties => {
    if (fontSettings?.categoryText?.isCustom && fontId && fontFaceLoaded) {
      return { fontFamily: `"${fontId}", sans-serif` };
    }
    return {};
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
      {categories.map((category) => (
        category && (
          <CategoryCard
            key={category}
            category={category}
            image={getCategoryImage(category)}
            onClick={() => onCategorySelect(category)}
            fontStyle={getCategoryTextStyle()}
          />
        )
      ))}
    </div>
  );
};

export default CategoryGrid;
