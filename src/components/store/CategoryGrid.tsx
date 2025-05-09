
import { motion } from "framer-motion";
import { CSSProperties, useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { Folder } from "lucide-react";

interface FontSettings {
  categoryText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
}

interface CategoryGridProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  fontSettings?: FontSettings;
  categoryImages?: CategoryImage[];
}

const CategoryCard = ({ 
  category, 
  imageUrl, 
  onClick,
  fontStyle 
}: { 
  category: string; 
  imageUrl: string | null; 
  onClick: () => void;
  fontStyle: CSSProperties;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
    onClick={onClick}
  >
    <div className="h-[140px] overflow-hidden">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={category}
          className="w-full aspect-[16/9] object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <Folder className="h-12 w-12 text-gray-400" />
        </div>
      )}
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
  onCategorySelect,
  fontSettings,
  categoryImages = []
}: CategoryGridProps) => {
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  
  useEffect(() => {
    if (fontSettings?.categoryText?.isCustom && fontSettings?.categoryText?.customFontUrl) {
      // Generate a unique ID for the font
      const uniqueId = `category-text-font-${Math.random().toString(36).substring(2, 9)}`;
      setFontId(uniqueId);
      
      // Create a font face rule
      const fontFace = new FontFace(uniqueId, `url(${fontSettings.categoryText.customFontUrl})`);
      
      // Load the font and add it to the document
      fontFace.load().then((loadedFontFace) => {
        document.fonts.add(loadedFontFace);
        setFontFaceLoaded(true);
      }).catch(err => {
        console.error("Error loading custom font:", err);
      });
      
      return () => {
        // Clean up by removing the style element when the component unmounts
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

  // دالة الحصول على صورة التصنيف
  const getCategoryImageUrl = (category: string): string | null => {
    // البحث عن صورة مخصصة للتصنيف من قائمة الصور المخصصة
    const customImage = categoryImages?.find(img => img.category === category);
    
    // إذا وجدنا صورة مخصصة، نستخدمها
    if (customImage && customImage.image_url) {
      console.log(`Using custom image for category ${category}:`, customImage.image_url);
      return customImage.image_url;
    }
    
    // إذا لم نجد صورة مخصصة، نعيد null ليتم عرض الأيقونة الافتراضية
    return null;
  };

  console.log("CategoryGrid rendering with", categoryImages?.length || 0, "custom category images");
  if (categoryImages?.length > 0) {
    console.log("Available category images:", categoryImages.map(img => ({ category: img.category, url: img.image_url })));
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
      {categories.map((category) => (
        category && (
          <CategoryCard
            key={category}
            category={category}
            imageUrl={getCategoryImageUrl(category)}
            onClick={() => onCategorySelect(category)}
            fontStyle={getCategoryTextStyle()}
          />
        )
      ))}
    </div>
  );
};

export default CategoryGrid;
