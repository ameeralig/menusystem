
/**
 * أداة تحسين الصور - تستخدم Supabase Image API لتحسين عرض الصور
 */

/**
 * تحويل رابط الصورة إلى رابط محسن باستخدام Supabase Image API
 * @param url رابط الصورة الأصلي
 * @param options خيارات التحسين
 * @returns رابط محسن للصورة
 */
export const optimizeImageUrl = (
  url: string | null | undefined,
  options: {
    // هل الصورة مهمة؟ (مثل صور الغلاف أو الهيدر)
    isImportant?: boolean;
    // توليد معرف زمني فريد لكسر التخزين المؤقت؟
    bustCache?: boolean;
    // جودة الصورة (افتراضيًا 80%)
    quality?: number;
    // صيغة الصورة (webp أو auto)
    format?: 'webp' | 'auto';
  } = {}
): string | null => {
  if (!url) return null;

  // استخراج عنوان URL الأساسي بدون معلمات
  const baseUrl = url.split('?')[0];

  // فحص ما إذا كان الرابط يشير إلى Supabase Storage أو أي CDN معروف
  const isSupabaseUrl = 
    baseUrl.includes('supabase.co/storage/v1') || 
    baseUrl.includes('supabase.in') || 
    baseUrl.includes('lovable-app') || 
    baseUrl.includes('zqlckixwpyrwdwrsuhsg.supabase');
  
  // تحديد نوع الصورة لتحسين الأداء
  const isUploadedImage = baseUrl.includes('/product-images') || 
                          baseUrl.includes('/category-images') || 
                          baseUrl.includes('/banners');
  
  try {
    // إنشاء كائن URL جديد من الرابط الأساسي
    const optimizedUrl = new URL(baseUrl);
    const searchParams = optimizedUrl.searchParams;

    // إذا كانت الصورة مرفوعة من المستخدم، نقوم بتطبيق تحسينات إضافية
    if (isSupabaseUrl && isUploadedImage) {
      // تعيين الصيغة (WebP أو auto)
      searchParams.set('format', options.format || 'webp');
      
      // تعيين الجودة - زيادة الجودة قليلاً للصور المرفوعة
      searchParams.set('quality', (options.quality || 85).toString());
      
      // إضافة إعدادات التخزين المؤقت الأمثل
      searchParams.set('cache-control', 'public, max-age=31536000, immutable');
      
      // كسر التخزين المؤقت عبر إضافة طابع زمني فريد للتأكد من تحديث الصور دائما
      if (options.bustCache) {
        searchParams.set('t', Date.now().toString());
      }
      
      // إشارة لنظام التخزين المؤقت للمتصفح بأن هذه الصورة مهمة
      if (options.isImportant) {
        searchParams.set('priority', 'high');
      }
    } 
    // للصور الخارجية، نطبق تحسينات بسيطة فقط
    else if (!isSupabaseUrl) {
      // إضافة طابع زمني للروابط الخارجية
      if (options.bustCache) {
        searchParams.set('t', Date.now().toString());
      }
    }
    // للصور الأخرى في Supabase ولكن ليست مرفوعة مباشرة
    else {
      // تطبيق تحسينات أساسية
      searchParams.set('format', options.format || 'webp');
      searchParams.set('quality', (options.quality || 80).toString());
      
      if (options.bustCache) {
        searchParams.set('t', Date.now().toString());
      }
    }
    
    // إضافة معلمة للإشارة إلى أن هذه الصورة تم تحسينها
    searchParams.set('optimized', 'true');
    
    return optimizedUrl.toString();
  } catch (error) {
    console.error(`[Image Optimizer] خطأ في تحسين الرابط: ${url}`, error);
    return url;
  }
};

/**
 * دالة مساعدة لإنشاء خصائص عنصر img المحسن
 */
export const createOptimizedImageProps = (
  src: string | null | undefined,
  alt: string,
  options: {
    className?: string;
    isImportant?: boolean;
    onClick?: () => void;
    onLoad?: () => void;
    onError?: () => void;
  } = {}
) => {
  // تحسين رابط الصورة
  const optimizedSrc = optimizeImageUrl(src, {
    isImportant: options.isImportant,
    bustCache: true,
    format: 'webp',
    quality: options.isImportant ? 90 : 80,  // جودة أعلى للصور المهمة
  });

  return {
    src: optimizedSrc || '',
    alt,
    className: options.className,
    loading: options.isImportant ? "eager" : "lazy",
    fetchPriority: options.isImportant ? "high" : "auto",
    decoding: "async",
    onClick: options.onClick,
    onLoad: options.onLoad,
    onError: options.onError,
  };
};
