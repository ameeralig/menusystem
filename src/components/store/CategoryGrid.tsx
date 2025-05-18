
import { motion } from "framer-motion";
import { CSSProperties, useEffect, useState, memo } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { Folder } from "lucide-react";
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

// استخدام memo للحد من إعادة الرسم غير الضرورية
const CategoryCard = memo(({ 
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
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-[30px] cursor-pointer shadow-md group"
      onClick={onClick}
      style={{ minHeight: "140px" }} // تثبيت ارتفاع أدنى
    >
      <div className="h-[140px] overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {!imgError && imageUrl ? (
          <>
            {isLoading && (
              <Skeleton className="absolute inset-0 bg-gray-100 w-full h-full" />
            )}
            <img 
              src={imageUrl} 
              alt={category}
              width={320} // تحديد عرض ثابت
              height={140} // تحديد ارتفاع ثابت
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => {
                console.error(`خطأ في تحميل صورة التصنيف: ${category}`);
                setImgError(true);
                setIsLoading(false);
              }}
              onLoad={() => {
                console.log(`تم تحميل صورة التصنيف بنجاح: ${category}`);
                setIsLoading(false);
              }}
              loading="eager" // تحميل الصور الأساسية فورًا
              style={{ 
                aspectRatio: '16/9',
                objectFit: 'cover' 
              }}
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
            style={{...fontStyle, maxWidth: '100%'}}
          >
            {category}
          </h3>
        </div>
      </div>
    </motion.div>
  );
});

CategoryCard.displayName = 'CategoryCard'; // تعيين اسم للمكون لتسهيل التصحيح

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

  // الحصول على رابط صورة التصنيف مع التحقق من وجودها
  const getCategoryImageUrl = (category: string): string | null => {
    if (!categoryImages || categoryImages.length === 0) return null;
    
    const imageData = categoryImages.find(img => img.category === category);
    if (!imageData?.image_url) return null;
    
    return imageData.image_url;
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
      
      {/* إذا كان عدد التصنيفات قليلًا، أضف بطاقات نائبة لتجنب تغيير تخطيط الصفحة */}
      {categories.length === 1 && (
        <div className="h-[140px] rounded-[30px] bg-transparent" />
      )}
    </div>
  );
};

export default CategoryGrid;
