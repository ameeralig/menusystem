
import { motion } from "framer-motion";
import { CSSProperties, useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { Folder } from "lucide-react";
import { getUrlWithTimestamp } from "@/utils/storageHelpers";

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
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  
  // تحميل مسبق للصورة في خلفية آمنة
  useEffect(() => {
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.onload = () => {
        console.log(`تم التحميل المسبق لصورة التصنيف "${category}" بنجاح: ${imageUrl}`);
        setLoadedImage(imageUrl);
        setImgError(false);
      };
      img.onerror = () => {
        console.error(`فشل التحميل المسبق لصورة التصنيف "${category}": ${imageUrl}`);
        setImgError(true);
        setLoadedImage(null);
      };
    } else {
      setLoadedImage(null);
    }
  }, [imageUrl, category]);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
      onClick={onClick}
    >
      <div className="h-[140px] overflow-hidden">
        {loadedImage && !imgError ? (
          <img 
            src={loadedImage} 
            alt={category}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="eager"
            onLoad={() => console.log(`تم عرض صورة التصنيف "${category}" بنجاح`)}
            onError={() => {
              console.error(`فشل عرض صورة التصنيف "${category}": ${loadedImage}`);
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

  // وظيفة محسنة للحصول على صورة التصنيف
  const getCategoryImageUrl = (category: string): string | null => {
    // تسجيل معلومات التصحيح
    console.log(`البحث عن صورة للتصنيف "${category}" من بين ${categoryImages?.length || 0} صورة متاحة`);
    
    if (!categoryImages || categoryImages.length === 0) {
      console.log(`لا توجد صور تصنيفات متاحة للتصنيف "${category}"`);
      return null;
    }
    
    // البحث عن الصورة المطابقة للتصنيف
    const imageData = categoryImages.find(img => img.category === category);
    
    if (imageData?.image_url) {
      console.log(`تم العثور على صورة للتصنيف "${category}": ${imageData.image_url}`);
      
      // إضافة طابع زمني إذا لم يكن موجودًا بالفعل
      return getUrlWithTimestamp(imageData.image_url);
    }
    
    console.log(`لم يتم العثور على صورة للتصنيف "${category}"`);
    return null;
  };

  // عرض معلومات التصحيح عند تحميل المكون
  useEffect(() => {
    console.log(`تم تمرير ${categoryImages?.length || 0} صورة تصنيف إلى CategoryGrid`);
    
    if (categoryImages?.length > 0) {
      console.log("صور التصنيفات المتاحة:", 
        categoryImages.map(img => ({
          category: img.category,
          url: img.image_url
        }))
      );
    }
    
    console.log(`عدد التصنيفات للعرض: ${categories.length}`);
  }, [categories.length, categoryImages]);

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
