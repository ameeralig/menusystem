
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
  
  // إذا كان الرابط ليس من Supabase، نعيد الرابط كما هو مع طابع زمني فقط
  if (!isSupabaseUrl) {
    return options.bustCache 
      ? `${baseUrl}?t=${Date.now()}`
      : url;
  }
  
  try {
    // إنشاء كائن URL جديد من الرابط الأساسي
    const optimizedUrl = new URL(baseUrl);
    const searchParams = optimizedUrl.searchParams;

    // إضافة معلمات تحسين الصورة
    
    // تعيين الصيغة (WebP أو auto)
    searchParams.set('format', options.format || 'webp');
    
    // تعيين الجودة
    searchParams.set('quality', (options.quality || 80).toString());
    
    // كسر التخزين المؤقت إذا لزم الأمر
    if (options.bustCache) {
      searchParams.set('t', Date.now().toString());
    }
    
    // إضافة معلمة للإشارة إلى أن هذه الصورة تم تحسينها
    searchParams.set('optimized', 'true');
    
    // إرجاع الرابط المحسن
    console.log(`[Image Optimizer] تم تحسين الصورة: ${optimizedUrl.toString()}`);
    return optimizedUrl.toString();
  } catch (error) {
    console.error(`[Image Optimizer] خطأ في تحسين الرابط: ${url}`, error);
    return url;
  }
};

/**
 * إنشاء عنصر صورة محسن مع خصائص مناسبة للأداء
 */
export const OptimizedImage = ({
  src,
  alt,
  className,
  isImportant = false,
  onClick,
  onLoad,
  onError,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  isImportant?: boolean;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}): JSX.Element => {
  // تحسين رابط الصورة
  const optimizedSrc = optimizeImageUrl(src, {
    isImportant,
    bustCache: true,
    format: 'webp',
    quality: 80,
  });

  return (
    <img
      src={optimizedSrc || ''}
      alt={alt}
      className={className}
      loading={isImportant ? "eager" : "lazy"}
      fetchpriority={isImportant ? "high" : "auto"}
      decoding="async"
      onClick={onClick}
      onLoad={onLoad}
      onError={onError}
    />
  );
};
