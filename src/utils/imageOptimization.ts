/**
 * Supabase Image Transformation Utility
 * يقوم بتحويل روابط صور Supabase لاستخدام Image Transformation API
 * مما يقلل حجم الصور بشكل كبير ويحسن الأداء
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * تحويل رابط صورة Supabase لاستخدام Image Transformation
 * @param url - رابط الصورة الأصلي
 * @param options - خيارات التحويل
 * @returns رابط الصورة المحسّن
 */
export function optimizeSupabaseImage(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // التحقق من أن الرابط من Supabase Storage
  if (!url || !url.includes('supabase.co/storage/v1/object/public/')) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover'
  } = options;

  try {
    // استخراج مسار الصورة من الرابط
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/public/');
    if (pathParts.length < 2) return url;

    const imagePath = pathParts[1].split('?')[0]; // إزالة query parameters
    
    // بناء رابط التحويل
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    const transformParams: string[] = [];

    if (width) transformParams.push(`width=${width}`);
    if (height) transformParams.push(`height=${height}`);
    if (quality) transformParams.push(`quality=${quality}`);
    if (format) transformParams.push(`format=${format}`);
    if (resize) transformParams.push(`resize=${resize}`);

    const transformQuery = transformParams.join('&');
    
    // استخدام render endpoint للتحويل
    return `${baseUrl}/storage/v1/render/image/public/${imagePath}?${transformQuery}`;
  } catch (error) {
    console.warn('فشل تحسين الصورة:', error);
    return url;
  }
}

/**
 * تحسين الصورة للأحجام الصغيرة (thumbnails)
 */
export function optimizeForThumbnail(url: string, size: number = 200): string {
  return optimizeSupabaseImage(url, {
    width: size,
    height: size,
    quality: 75,
    format: 'webp',
    resize: 'cover'
  });
}

/**
 * تحسين الصورة للشعارات
 */
export function optimizeForLogo(url: string, height: number = 100): string {
  return optimizeSupabaseImage(url, {
    height,
    quality: 85,
    format: 'webp',
    resize: 'contain'
  });
}

/**
 * إنشاء srcset للصور المتجاوبة
 */
export function createResponsiveSrcSet(url: string, sizes: number[]): string {
  return sizes
    .map(size => `${optimizeSupabaseImage(url, { width: size, format: 'webp' })} ${size}w`)
    .join(', ');
}
