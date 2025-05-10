
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
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // إعادة تعيين حالات تحميل الصورة عند تغيير الرابط
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
      onClick={onClick}
    >
      <div className="h-[140px] overflow-hidden">
        {imageUrl && !imageError ? (
          <div className="relative w-full h-full">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              src={imageUrl} 
              alt={category}
              className={`w-full aspect-[16/9] object-cover transition-transform duration-300 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="eager"
              onLoad={() => {
                console.log(`تم تحميل صورة التصنيف ${category} بنجاح من الرابط ${imageUrl}`);
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error(`خطأ في تحميل صورة التصنيف ${category}:`, e);
                setImageError(true);
              }}
            />
          </div>
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
  
  // طباعة معلومات للتصحيح عن صور التصنيفات المتاحة
  useEffect(() => {
    console.log("صور التصنيفات المتاحة في CategoryGrid:", categoryImages);
    if (categoryImages?.length > 0) {
      console.log("تفاصيل صور التصنيفات:", categoryImages.map(img => ({ 
        category: img.category, 
        url: img.image_url 
      })));
    }
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

  // دالة الحصول على صورة التصنيف - تحسين عملية البحث وإضافة طابع زمني لمنع التخزين المؤقت
  const getCategoryImageUrl = (category: string): string | null => {
    if (!categoryImages || categoryImages.length === 0) {
      console.log(`لا توجد صور تصنيفات متاحة للتصنيف ${category}`);
      return null;
    }
    
    // البحث عن صورة مخصصة للتصنيف من قائمة الصور المخصصة
    const customImage = categoryImages.find(img => img.category === category);
    
    // إذا وجدنا صورة مخصصة، نستخدمها مع إضافة طابع زمني لتجنب المشاكل
    if (customImage && customImage.image_url) {
      let finalUrl = customImage.image_url;
      
      // إضافة طابع زمني لمنع التخزين المؤقت إذا لم يكن موجوداً بالفعل
      if (!finalUrl.includes('?')) {
        finalUrl = `${finalUrl}?t=${Date.now()}`;
      } else if (!finalUrl.includes('t=')) {
        finalUrl = `${finalUrl}&t=${Date.now()}`;
      }
      
      console.log(`استخدام صورة مخصصة للتصنيف ${category}:`, finalUrl);
      return finalUrl;
    }
    
    // إذا لم نجد صورة مخصصة، نعيد null ليتم عرض الأيقونة الافتراضية
    console.log(`لم يتم العثور على صورة للتصنيف ${category}`);
    return null;
  };

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
