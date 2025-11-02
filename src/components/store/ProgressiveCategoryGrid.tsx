import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CategoryImage } from "@/types/categoryImage";
import { FontSettings } from "@/types/store";

interface ProgressiveCategoryGridProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  fontSettings?: FontSettings;
  categoryImages?: CategoryImage[];
  isLoading?: boolean;
  categoryStyle?: string;
}

const ProgressiveCategoryGrid = ({
  categories,
  onCategorySelect,
  fontSettings,
  categoryImages = [],
  isLoading = false,
  categoryStyle
}: ProgressiveCategoryGridProps) => {
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ترتيب التصنيفات حسب display_order
  const sortedCategories = [...categories].sort((a, b) => {
    const aImage = categoryImages.find(img => img.category === a);
    const bImage = categoryImages.find(img => img.category === b);
    
    const aOrder = aImage?.display_order || 999;
    const bOrder = bImage?.display_order || 999;
    
    return aOrder - bOrder;
  });

  // تحميل التصنيفات تدريجياً
  useEffect(() => {
    if (sortedCategories.length === 0 || isLoading) {
      setVisibleCategories([]);
      setCurrentIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next <= sortedCategories.length) {
          setVisibleCategories(sortedCategories.slice(0, next));
          return next;
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 150); // تأخير 150ms بين كل تصنيف

    return () => clearInterval(timer);
  }, [sortedCategories, isLoading]);

  const getCategoryImage = (category: string) => {
    return categoryImages.find(img => img.category === category)?.image_url;
  };

  // تحديد فئات CSS للخط
  const getCategoryTextClasses = () => {
    if (fontSettings?.categoryText?.isCustom) {
      return "text-lg font-semibold";
    }
    
    switch (fontSettings?.categoryText?.family) {
      case 'Cairo':
        return "text-lg font-semibold font-cairo";
      case 'Amiri':
        return "text-lg font-semibold font-amiri";
      case 'Tajawal':
        return "text-lg font-semibold font-tajawal";
      default:
        return "text-lg font-semibold";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          جاري تحميل التصنيفات...
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          لا توجد تصنيفات متاحة
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          ابدأ بإضافة منتجات إلى متجرك لإنشاء التصنيفات
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* عداد التقدم */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary">
            {visibleCategories.length} من {sortedCategories.length} تصنيف
          </span>
        </div>
      </motion.div>

      {/* شبكة التصنيفات */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {visibleCategories.map((category, index) => {
            const imageUrl = getCategoryImage(category);
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategorySelect(category)}
                className="group cursor-pointer"
              >
                <div className={categoryStyle || "relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"}>
                  
                  {/* صورة التصنيف */}
                  {imageUrl ? (
                    <div className="aspect-square overflow-hidden">
                      <motion.img
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        src={imageUrl}
                        alt={category}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                      <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="text-4xl"
                      >
                        📦
                      </motion.div>
                    </div>
                  )}

                  {/* تأثير التدرج */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* اسم التصنيف */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <motion.h3
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className={`${getCategoryTextClasses()} text-white text-center drop-shadow-lg`}
                      style={{
                        fontFamily: fontSettings?.categoryText?.isCustom 
                          ? fontSettings.categoryText.family 
                          : undefined
                      }}
                    >
                      {category}
                    </motion.h3>
                  </div>

                  {/* تأثير الهوفر */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* رقم التصنيف */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                  >
                    {index + 1}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* مؤشر التحميل المتبقي */}
      {visibleCategories.length < sortedCategories.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            <span className="text-sm">
              تحميل المزيد من التصنيفات...
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressiveCategoryGrid;