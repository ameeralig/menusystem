import { motion } from "framer-motion";
import { CSSProperties, useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";

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
  categoryImages?: CategoryImage[];
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
        loading="eager"
        fetchPriority="high" // Corrected to camel case
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
  fontSettings,
  categoryImages = []
}: CategoryGridProps) => {
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());
  
  // تحديث مفتاح التحديث عند تغير قائمة categoryImages
  useEffect(() => {
    setRefreshKey(Date.now());
  }, [categoryImages]);
  
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

  // دالة محسنة للحصول على صورة التصنيف المخصصة مع التأكد من تحديث الصورة
  const getCustomCategoryImage = (category: string): string => {
    // البحث عن صورة التصنيف المخصصة في المصفوفة
    const customImage = categoryImages?.find(img => img.category === category);
    
    if (customImage && customImage.image_url) {
      // إضافة معرف زمني وقيمة عشوائية للتأكد من منع التخزين المؤقت
      const baseUrl = customImage.image_url.split('?')[0];
      const cacheParams = `?v=${refreshKey}&nocache=${Math.random().toString(36).substring(2)}`;
      
      return `${baseUrl}${cacheParams}`;
    }
    
    // استخدام دالة الصورة الافتراضية إذا لم تكن هناك صورة مخصصة
    return getCategoryImage(category);
  };

  // إضافة زر لتحديث الصور يدويًا
  const forceRefresh = () => {
    setRefreshKey(Date.now());
  };

  return (
    <div className="space-y-6">
      {categories.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={forceRefresh}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث الصور
          </button>
        </div>
      )}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {categories.map((category) => (
          category && (
            <CategoryCard
              key={`${category}-${refreshKey}`}
              category={category}
              image={getCustomCategoryImage(category)}
              onClick={() => onCategorySelect(category)}
              fontStyle={getCategoryTextStyle()}
            />
          )
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
