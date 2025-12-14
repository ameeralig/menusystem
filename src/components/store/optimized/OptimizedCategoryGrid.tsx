/**
 * شبكة تصنيفات محسّنة مع تحكم في ترتيب التحميل
 * المرحلة الثانية: تُحمّل بعد البانر
 */

import React, { memo, useEffect, useState, CSSProperties } from 'react';
import { CategoryImage } from "@/types/categoryImage";
import { sortCategoriesByOrder } from "@/utils/categorySort";
import OptimizedCategoryCard from './OptimizedCategoryCard';

interface FontSettings {
  categoryText?: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
}

interface OptimizedCategoryGridProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  fontSettings?: FontSettings;
  categoryImages?: CategoryImage[];
  isLoadingEnabled?: boolean;
  onLoadComplete?: () => void;
}

const OptimizedCategoryGrid = memo(({
  categories,
  onCategorySelect,
  fontSettings,
  categoryImages = [],
  isLoadingEnabled = false,
  onLoadComplete
}: OptimizedCategoryGridProps) => {
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");
  const [loadedCount, setLoadedCount] = useState(0);

  // تحميل الخط المخصص
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

  // إعلام بإتمام التحميل
  useEffect(() => {
    const totalImages = categoryImages.filter(img => img.image_url).length;
    if (loadedCount >= totalImages && totalImages > 0) {
      onLoadComplete?.();
    }
  }, [loadedCount, categoryImages, onLoadComplete]);

  // نمط الخط
  const getCategoryTextStyle = (): CSSProperties => {
    if (fontSettings?.categoryText?.isCustom && fontId && fontFaceLoaded) {
      return { fontFamily: `"${fontId}", sans-serif` };
    }
    return {};
  };

  // الحصول على رابط صورة التصنيف
  const getCategoryImageUrl = (category: string): string | null => {
    if (!categoryImages || categoryImages.length === 0) {
      return null;
    }

    const imageData = categoryImages.find(img => img.category === category);
    return imageData?.image_url || null;
  };

  // ترتيب التصنيفات
  const sortedCategories = sortCategoriesByOrder(categories, categoryImages);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
      {sortedCategories.map((category) =>
        category && (
          <OptimizedCategoryCard
            key={category}
            category={category}
            imageUrl={getCategoryImageUrl(category)}
            onClick={() => onCategorySelect(category)}
            fontStyle={getCategoryTextStyle()}
            isLoadingEnabled={isLoadingEnabled}
          />
        )
      )}
    </div>
  );
});

OptimizedCategoryGrid.displayName = 'OptimizedCategoryGrid';

export default OptimizedCategoryGrid;
