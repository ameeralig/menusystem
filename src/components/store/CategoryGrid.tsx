
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
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const handleImageError = () => {
    console.error(`خطأ في تحميل صورة التصنيف: ${category}`, { imageUrl });
    
    if (retryCount < maxRetries) {
      // إضافة طابع زمني جديد ومحاولة التحميل مرة أخرى
      const newTimestamp = Date.now();
      const baseUrl = imageUrl?.split('?')[0] || '';
      const newUrl = `${baseUrl}?t=${newTimestamp}&retry=${retryCount}`;
      
      console.log(`محاولة إعادة تحميل الصورة: ${category}`, { newUrl, retryCount: retryCount + 1 });
      
      const imgElement = document.getElementById(`category-image-${category}`) as HTMLImageElement;
      if (imgElement) {
        imgElement.src = newUrl;
      }
      
      setRetryCount(retryCount + 1);
    } else {
      console.error(`فشلت جميع محاولات تحميل صورة التصنيف: ${category} بعد ${maxRetries} محاولات`);
      setImgError(true);
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
      onClick={onClick}
    >
      <div className="h-[140px] overflow-hidden">
        {!imgError && imageUrl ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              id={`category-image-${category}`}
              src={imageUrl} 
              alt={category}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={handleImageError}
              onLoad={() => {
                console.log(`تم تحميل صورة التصنيف بنجاح: ${category}`);
                setIsLoading(false);
              }}
              loading="eager"
              crossOrigin="anonymous"
              fetchPriority="high"
            />
          </>
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
  const [localCategoryImages, setLocalCategoryImages] = useState<CategoryImage[]>([]);
  
  // تحميل الصور المحلية مع طابع زمني جديد لتجنب التخزين المؤقت
  useEffect(() => {
    if (categoryImages && categoryImages.length > 0) {
      console.log("تحديث صور التصنيفات المحلية في CategoryGrid");
      
      const timestamp = Date.now();
      const updated = categoryImages.map(img => {
        if (!img.image_url) return img;
        
        const baseUrl = img.image_url.split('?')[0];
        const optimizedUrl = `${baseUrl}?t=${timestamp}&format=webp&quality=80`;
        
        return {
          ...img,
          image_url: optimizedUrl
        };
      });
      
      console.log(`تم تحديث ${updated.length} صورة تصنيف محليًا في CategoryGrid`);
      setLocalCategoryImages(updated);
      
      // تحميل مسبق للصور
      updated.forEach(img => {
        if (img.image_url) {
          const preloadImage = new Image();
          preloadImage.src = img.image_url;
          preloadImage.fetchPriority = "high";
          preloadImage.crossOrigin = "anonymous";
        }
      });
    } else {
      setLocalCategoryImages([]);
    }
  }, [categoryImages]);
  
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

  // الحصول على رابط صورة التصنيف مع التحقق من وجودها
  const getCategoryImageUrl = (category: string): string | null => {
    if (!localCategoryImages || localCategoryImages.length === 0) return null;
    
    const imageData = localCategoryImages.find(img => img.category === category);
    if (!imageData?.image_url) return null;
    
    // تسجيل معلومات التصحيح
    console.log(`استخدام صورة للتصنيف: ${category} - الرابط: ${imageData.image_url}`);
    
    return imageData.image_url;
  };

  // تسجيل معلومات للتصحيح
  useEffect(() => {
    console.log(`CategoryGrid: تلقي ${categoryImages?.length || 0} صورة تصنيف`);
    if (categoryImages?.length > 0) {
      console.log("تفاصيل صور التصنيفات المتاحة في CategoryGrid:");
      categoryImages.forEach(img => {
        console.log(`- التصنيف: ${img.category}, الرابط: ${img.image_url || 'غير متوفر'}`);
      });
    }
    
    console.log("التصنيفات المتاحة:", categories);
  }, [categoryImages, categories]);

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
