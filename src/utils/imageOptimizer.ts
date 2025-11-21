/**
 * نظام موحد لتحسين الصور في جميع أنحاء التطبيق
 * يدعم ثلاثة أحجام مختلفة حسب الاستخدام
 */

export type ImageSize = 'thumbnail' | 'medium' | 'large';

interface ImageSizeConfig {
  width: number;
  height: number;
  quality: number;
}

const IMAGE_SIZES: Record<ImageSize, ImageSizeConfig> = {
  thumbnail: { width: 120, height: 120, quality: 60 },  // للبطاقات الصغيرة
  medium: { width: 600, height: 600, quality: 75 },     // للمودال والمعاينة
  large: { width: 1200, height: 1200, quality: 85 }     // للصور الكبيرة
};

/**
 * تحسين رابط الصورة بناءً على الحجم المطلوب
 * @param url - رابط الصورة الأصلي
 * @param size - حجم الصورة المطلوب (thumbnail | medium | large)
 * @returns رابط الصورة المحسّن
 */
export const optimizeImageUrl = (
  url: string | null | undefined, 
  size: ImageSize = 'medium'
): string => {
  if (!url) {
    const { width, height } = IMAGE_SIZES[size];
    return `https://placehold.co/${width}x${height}/e2e8f0/64748b?text=No+Image`;
  }
  
  const config = IMAGE_SIZES[size];
  
  // إذا كان الرابط من Supabase Storage، نضيف معاملات التحسين
  if (url.includes('supabase')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('width', config.width.toString());
      urlObj.searchParams.set('height', config.height.toString());
      urlObj.searchParams.set('quality', config.quality.toString());
      urlObj.searchParams.set('format', 'webp');
      return urlObj.toString();
    } catch (error) {
      console.error('Error optimizing image URL:', error);
      return url;
    }
  }
  
  // إرجاع الرابط الأصلي للروابط الخارجية
  return url;
};
