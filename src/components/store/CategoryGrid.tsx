
import { motion } from "framer-motion";
import { CSSProperties, useEffect, useState } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { Folder } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // إعداد الصورة مع طابع زمني جديد وتجنب التخزين المؤقت
  useEffect(() => {
    if (imageUrl) {
      // إنشاء طابع زمني جديد لتجنب التخزين المؤقت
      const timestamp = Date.now();
      const baseUrl = imageUrl.split('?')[0];
      
      // تحسين الصورة إذا كانت من Supabase
      const useWebP = baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app');
      const optimizedUrl = useWebP 
        ? `${baseUrl}?t=${timestamp}&format=webp&quality=80` 
        : `${baseUrl}?t=${timestamp}`;
      
      console.log(`تهيئة صورة التصنيف ${category} مع الرابط: ${optimizedUrl}`);
      
      // إنشاء كائن صورة جديد للتحميل المسبق
      const img = new Image();
      img.onload = () => {
        console.log(`تم تحميل صورة التصنيف ${category} بنجاح`);
        setImgSrc(optimizedUrl);
        setIsLoading(false);
        setImgError(false);
      };
      
      img.onerror = (e) => {
        console.error(`فشل تحميل صورة التصنيف ${category}:`, e);
        setImgError(true);
        setIsLoading(false);
      };
      
      // تعيين خصائص الصورة لتحسين التحميل
      img.decoding = "async";
      img.fetchPriority = "high";
      img.crossOrigin = "anonymous";
      img.src = optimizedUrl;
      
      // إعادة المحاولة بعد فترة وجيزة إذا كانت صورة جديدة
      const retryTimeout = setTimeout(() => {
        if (img.complete === false) {
          console.log(`إعادة محاولة تحميل صورة التصنيف ${category} بعد المهلة`);
          const newTimestamp = Date.now();
          const retryUrl = useWebP 
            ? `${baseUrl}?t=${newTimestamp}&format=webp&quality=80&retry=true` 
            : `${baseUrl}?t=${newTimestamp}&retry=true`;
          img.src = retryUrl;
        }
      }, 2000);
      
      return () => {
        clearTimeout(retryTimeout);
        img.onload = null;
        img.onerror = null;
      };
    } else {
      setImgSrc(null);
      setIsLoading(false);
    }
  }, [imageUrl, category]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
      onClick={onClick}
    >
      <div className="h-[140px] overflow-hidden">
        <AspectRatio ratio={16 / 9} className="w-full h-full">
          {isLoading && (
            <Skeleton className="w-full h-full absolute inset-0" />
          )}
          
          {!imgError && imgSrc ? (
            <img 
              src={imgSrc}
              alt={category}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={() => {
                console.error(`خطأ في عرض صورة التصنيف: ${category}`);
                setImgError(true);
              }}
              loading="eager"
              fetchPriority="high"
              crossOrigin="anonymous"
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
        </AspectRatio>
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

  // الحصول على رابط صورة التصنيف
  const getCategoryImageUrl = (category: string): string | null => {
    if (!categoryImages || categoryImages.length === 0) return null;
    
    const imageData = categoryImages.find(img => img.category === category);
    if (!imageData?.image_url) return null;
    
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
