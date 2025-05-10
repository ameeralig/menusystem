
import { motion } from "framer-motion";
import { CSSProperties, useEffect, useState, useRef } from "react";
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
}) => {
  const [imgError, setImgError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // اختبار تحميل الصورة مسبقًا
  useEffect(() => {
    if (!imageUrl) return;
    
    const preloadImage = new Image();
    preloadImage.src = imageUrl;
    preloadImage.onload = () => {
      console.log(`تم تحميل الصورة مسبقًا للتصنيف ${category} بنجاح`);
      setImgError(false);
    };
    preloadImage.onerror = () => {
      console.error(`فشل تحميل الصورة للتصنيف ${category}`);
      setImgError(true);
    };
  }, [imageUrl, category]);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
      onClick={onClick}
    >
      <div className="h-[140px] overflow-hidden">
        {imageUrl && !imgError ? (
          <img 
            ref={imgRef}
            src={imageUrl} 
            alt={category}
            className="w-full aspect-[16/9] object-cover transition-transform duration-300 group-hover:scale-110"
            loading="eager"
            onLoad={() => console.log(`تم تحميل صورة التصنيف ${category} بنجاح`)}
            onError={() => {
              console.error(`خطأ في تحميل صورة التصنيف ${category}`);
              setImgError(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Folder className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h3 
            className="text-white text-2xl font-bold tracking-wide px-3 text-center"
            style={fontStyle}
          >
            {category}
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

const CategoryGrid = ({ 
  categories, 
  onCategorySelect,
  fontSettings,
  categoryImages = []
}: CategoryGridProps) => {
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
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
  
  useEffect(() => {
    // تحميل الصور مسبقًا عند تغيير categoryImages
    if (categoryImages && categoryImages.length > 0) {
      const newLoadedState: Record<string, boolean> = {};
      
      categoryImages.forEach(img => {
        if (img.image_url) {
          const preloadImage = new Image();
          const imageUrl = img.image_url.includes('?') 
            ? img.image_url 
            : `${img.image_url}?t=${Date.now()}`;
            
          preloadImage.src = imageUrl;
          preloadImage.onload = () => {
            setLoadedImages(prev => ({
              ...prev,
              [img.category]: true
            }));
            console.log(`تم تحميل صورة مسبقًا للتصنيف ${img.category} بنجاح`);
          };
          preloadImage.onerror = () => {
            setLoadedImages(prev => ({
              ...prev, 
              [img.category]: false
            }));
            console.error(`فشل تحميل الصورة مسبقًا للتصنيف ${img.category}`);
          };
          
          newLoadedState[img.category] = false;
        }
      });
      
      setLoadedImages(prev => ({ ...prev, ...newLoadedState }));
    }
  }, [categoryImages]);
  
  const getCategoryTextStyle = (): CSSProperties => {
    if (fontSettings?.categoryText?.isCustom && fontId && fontFaceLoaded) {
      return { fontFamily: `"${fontId}", sans-serif` };
    }
    return {};
  };

  // دالة الحصول على صورة التصنيف - تم تحسينها
  const getCategoryImageUrl = (category: string): string | null => {
    if (!categoryImages || categoryImages.length === 0) {
      console.log(`لا توجد صور تصنيفات متاحة للتصنيف ${category}`);
      return null;
    }
    
    // البحث عن صورة مخصصة للتصنيف من قائمة الصور المخصصة
    const customImage = categoryImages.find(img => img.category === category);
    
    // إذا وجدنا صورة مخصصة، نستخدمها
    if (customImage && customImage.image_url) {
      const currentUrl = customImage.image_url;
      const baseUrl = currentUrl.split('?')[0];
      const finalUrl = `${baseUrl}?t=${Date.now()}`;
      
      console.log(`استخدام صورة مخصصة للتصنيف ${category}:`, finalUrl);
      return finalUrl;
    }
    
    // إذا لم نجد صورة مخصصة، نعيد null ليتم عرض الأيقونة الافتراضية
    console.log(`لم يتم العثور على صورة للتصنيف ${category}`);
    return null;
  };

  // تسجيل معلومات التصحيح حول صور التصنيفات المتاحة
  console.log("CategoryGrid rendering with", categoryImages?.length || 0, "custom category images");
  if (categoryImages?.length > 0) {
    console.log("Available category images:", categoryImages.map(img => ({ 
      category: img.category, 
      url: img.image_url 
    })));
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
