
import { motion } from "framer-motion";
import { CSSProperties, useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { Folder, Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  
  // تحميل مسبق للصورة قبل عرضها
  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      console.log(`✅ تم تحميل صورة التصنيف "${category}" بنجاح: ${imageUrl}`);
      setImgError(false);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.error(`❌ فشل تحميل صورة التصنيف "${category}": ${imageUrl}`);
      setImgError(true);
      setIsLoading(false);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, category]);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
      onClick={onClick}
    >
      <div className="h-[140px] overflow-hidden">
        {!imgError && imageUrl ? (
          <div className="relative w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            <img 
              src={imageUrl} 
              alt={category}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={() => setImgError(true)}
              style={{ transition: "opacity 0.3s ease" }}
              loading="eager"
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
  
  // معالجة الخط المخصص إذا كان متاحاً
  useEffect(() => {
    if (fontSettings?.categoryText?.isCustom && fontSettings?.categoryText?.customFontUrl) {
      const uniqueId = `category-text-font-${Math.random().toString(36).substring(2, 9)}`;
      setFontId(uniqueId);
      
      const fontFace = new FontFace(uniqueId, `url(${fontSettings.categoryText.customFontUrl})`);
      
      fontFace.load().then((loadedFontFace) => {
        document.fonts.add(loadedFontFace);
        setFontFaceLoaded(true);
      }).catch(err => {
        console.error("خطأ في تحميل الخط المخصص:", err);
      });
    }
  }, [fontSettings?.categoryText?.customFontUrl, fontSettings?.categoryText?.isCustom]);
  
  // إعداد نمط الخط
  const getCategoryTextStyle = (): CSSProperties => {
    if (fontSettings?.categoryText?.isCustom && fontId && fontFaceLoaded) {
      return { fontFamily: `"${fontId}", sans-serif` };
    }
    return {};
  };

  // وظيفة محسنة للحصول على صورة التصنيف مع طابع زمني جديد
  const getCategoryImageUrl = (category: string): string | null => {
    if (!categoryImages || categoryImages.length === 0) {
      return null;
    }
    
    const imageData = categoryImages.find(img => img.category === category);
    
    if (!imageData?.image_url) {
      return null;
    }
    
    // تأكد من أن الرابط يحتوي على طابع زمني حديث
    const timestamp = Date.now();
    const baseUrl = imageData.image_url.split('?')[0];
    const updatedUrl = `${baseUrl}?t=${timestamp}`;
    
    console.log(`استخدام صورة للتصنيف "${category}": ${updatedUrl}`);
    return updatedUrl;
  };

  // تسجيل معلومات التصحيح
  useEffect(() => {
    console.log(`عدد صور التصنيفات المتاحة: ${categoryImages?.length || 0}`);
    if (categoryImages?.length > 0) {
      console.log("تفاصيل صور التصنيفات المتاحة:");
      categoryImages.forEach(img => {
        console.log(`- التصنيف: ${img.category}, الرابط: ${img.image_url || 'غير متوفر'}`);
      });
    }
  }, [categoryImages]);

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
