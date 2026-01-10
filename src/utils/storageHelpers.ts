
import { supabase } from "@/lib/supabase";

/**
 * حذف صورة من مستودع Supabase
 * @param bucket اسم المستودع
 * @param path المسار الكامل للملف
 * @returns نجاح أو فشل العملية
 */
export const deleteImage = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    console.log(`محاولة حذف صورة من ${bucket}: ${path}`);
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error("خطأ في حذف الصورة:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("خطأ في حذف الصورة:", error);
    return false;
  }
};

/**
 * إنشاء مسار فريد للملف مع هيكل تنظيمي حسب المستخدم
 * @param userId معرّف المستخدم
 * @param folder المجلد الفرعي (اختياري)
 * @param file الملف
 * @returns المسار الفريد للملف
 */
export const createUniqueFilePath = (userId: string, folder: string = '', file: File): string => {
  const fileExt = file.name.split('.').pop();
  // استبدال الأحرف الخاصة والمسافات بشرطة سفلية
  const sanitizedFolder = folder ? folder.replace(/\s+/g, '_').replace(/[^\w.-]/g, '_') : '';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  // إنشاء مسار منظم: معرف_المستخدم/المجلد_الفرعي/اسم_الملف
  if (sanitizedFolder) {
    return `${userId}/${sanitizedFolder}/${fileName}`;
  } else {
    return `${userId}/${fileName}`;
  }
};

/**
 * تحسين الصورة قبل الرفع لتقليل الحجم
 * @param file ملف الصورة الأصلي
 * @returns وعد بملف الصورة المحسن
 */
export const optimizeImage = async (file: File): Promise<File> => {
  // تحقق ما إذا كان الملف صورة
  if (!file.type.startsWith('image/')) {
    return file;
  }
  
  try {
    // إذا كانت الصورة كبيرة جدًا، قم بضغطها
    if (file.size > 500 * 1024) { // أكبر من 500 كيلوبايت
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      
      const img = new Image();
      
      // إنشاء وعد لتحميل الصورة
      const blobUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = blobUrl;
      });
      
      // تنظيف blob URL
      URL.revokeObjectURL(blobUrl);
      
      // تحديد أبعاد الصورة المضغوطة (الحد الأقصى 1200 بكسل)
      const maxWidth = 1200;
      const maxHeight = 1200;
      let width = img.width;
      let height = img.height;
      
      // تقليص الأبعاد إذا تجاوزت الحد الأقصى
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height *= maxWidth / width;
          width = maxWidth;
        } else {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      // ضبط أبعاد Canvas
      canvas.width = width;
      canvas.height = height;
      
      // رسم الصورة على Canvas بالأبعاد الجديدة
      ctx.drawImage(img, 0, 0, width, height);
      
      // محاولة استخدام WebP (دعم أفضل من AVIF)
      const quality = 0.85;
      let blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, 'image/webp', quality)
      );
      
      // إذا فشل WebP، استخدم JPEG كبديل
      if (!blob) {
        blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob(resolve, 'image/jpeg', quality)
        );
      }
      
      if (blob && blob.size < file.size) {
        const extension = blob.type === 'image/webp' ? '.webp' : '.jpg';
        const optimizedFile = new File(
          [blob], 
          file.name.replace(/\.[^.]+$/, extension), 
          { type: blob.type }
        );
        return optimizedFile;
      }
    }
    
    // إذا كانت الصورة صغيرة بالفعل أو فشلت عملية التحسين، أرجع الملف الأصلي
    return file;
  } catch (error) {
    console.error("خطأ أثناء تحسين الصورة:", error);
    return file; // إرجاع الملف الأصلي في حالة حدوث خطأ
  }
};

/**
 * رفع صورة إلى مستودع Supabase
 * @param bucket اسم المستودع (مثل 'product-images' أو 'category-images')
 * @param file ملف الصورة
 * @param userId معرف المستخدم
 * @param folder اسم المجلد الفرعي (اختياري)
 * @param retryCount عدد المحاولات المتبقية
 * @returns رابط الصورة العام
 */
export const uploadImage = async (
  bucket: string,
  file: File,
  userId: string,
  folder: string = '',
  retryCount: number = 2
): Promise<string> => {
  try {
    console.log(`بدء رفع صورة إلى دلو ${bucket} للمستخدم ${userId}`);
    
    // تحسين الصورة قبل الرفع
    const optimizedFile = await optimizeImage(file);
    
    const filePath = createUniqueFilePath(userId, folder, optimizedFile);
    console.log(`مسار الملف: ${filePath}`);
    
    // خيارات الرفع المحسّنة
    const options = {
      cacheControl: 'public, max-age=31536000, immutable', // كاش لمدة سنة
      upsert: false, // لا نستبدل الملفات القديمة (كل ملف له اسم فريد)
      contentType: optimizedFile.type
    };
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, optimizedFile, options);

    if (uploadError) {
      console.error("خطأ في رفع الصورة:", uploadError);
      
      // إعادة المحاولة فقط إذا كانت هناك محاولات متبقية
      if (retryCount > 0 && (uploadError.message.includes("bucket") || uploadError.message.includes("not found"))) {
        console.log(`إعادة المحاولة... المحاولات المتبقية: ${retryCount}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return uploadImage(bucket, file, userId, folder, retryCount - 1);
      }
      
      throw uploadError;
    }

    // الحصول على الرابط العام (بدون timestamp لتفعيل الكاش)
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    console.log(`تم رفع الصورة بنجاح. الرابط العام: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("خطأ في رفع الصورة:", error);
    throw error;
  }
};

/**
 * تحويل URL الصورة (مثل blob) إلى كائن File
 * @param url رابط الصورة
 * @param filename اسم الملف
 * @returns كائن File
 */
export const urlToFile = async (url: string, filename: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

/**
 * إنشاء رابط مع طابع زمني (فقط عند الحاجة لإعادة التحميل)
 * @param url الرابط الأصلي
 * @param forceReload إجبار إعادة التحميل (اختياري)
 * @returns رابط مع أو بدون طابع زمني
 */
export const getUrlWithTimestamp = (url: string | null, forceReload: boolean = false): string | null => {
  if (!url) return null;
  
  // إرجاع الرابط بدون timestamp للسماح بالكاش (ما لم يُطلب forceReload)
  if (!forceReload) {
    return url;
  }
  
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
};

/**
 * تنسيق رابط الصورة (مبسط للأداء مع تحسينات Safari)
 * @param url رابط الصورة الأصلي
 * @returns رابط الصورة المنسق
 */
export const formatImageUrl = (url: string): string => {
  if (!url) return url;
  
  // معالجة روابط Supabase فقط (الحالة الأكثر شيوعاً)
  const isSupabaseUrl = url.includes('supabase.co') || 
                        url.includes('supabase.in') || 
                        url.includes('zqlckixwpyrwdwrsuhsg');
  
  if (isSupabaseUrl) {
    // إرجاع الرابط بدون معلمات استعلام للكاش الأفضل
    return url.split('?')[0];
  }
  
  // إرجاع الروابط الخارجية كما هي
  return url;
};

/**
 * تحسين رابط الصورة حسب المتصفح
 * Safari يحتاج معاملة خاصة للأداء الأفضل
 */
export const getOptimizedImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  const formattedUrl = formatImageUrl(url);
  
  // للصور من Supabase، نضيف headers مناسبة عبر URL parameters
  if (formattedUrl.includes('supabase')) {
    // إضافة cache-control hint
    return formattedUrl;
  }
  
  return formattedUrl;
};

/**
 * فحص ما إذا كان الرابط صالح للصورة (مبسط وأسرع)
 * @param url رابط الصورة
 * @returns وعد يحل إلى صحة الرابط
 */
export const checkImageUrl = async (url: string | null): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const processedUrl = formatImageUrl(url);
    
    // محاولة واحدة فقط بدون retries
    return new Promise((resolve) => {
      const img = document.createElement('img');
      const timeout = setTimeout(() => {
        console.warn(`⏱️ انتهت مهلة تحميل الصورة: ${processedUrl}`);
        resolve(false);
      }, 3000); // 3 ثوان فقط
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.error(`❌ الصورة غير صالحة: ${processedUrl}`);
        resolve(false);
      };
      
      img.src = processedUrl;
    });
  } catch (error) {
    console.error("خطأ في فحص رابط الصورة:", error);
    return false;
  }
};

/**
 * استخراج مسار الملف من رابط Supabase العام
 * @param url الرابط العام للصورة من Supabase
 * @param bucket اسم المستودع للتحقق
 * @returns مسار الملف (بدون اسم المستودع)
 */
export const extractFilePathFromUrl = (url: string, bucket: string): string | null => {
  try {
    // البحث عن نمط URL Supabase
    const regex = new RegExp(`/storage/v1/object/public/${bucket}/(.+?)(?:\\?|$)`);
    const match = url.match(regex);
    
    if (match && match[1]) {
      console.log(`تم استخراج مسار الملف: ${match[1]} من ${url}`);
      return decodeURIComponent(match[1]);
    }
    
    console.log(`لم يتم العثور على مسار الملف في الرابط: ${url}`);
    return null;
  } catch (e) {
    console.error("خطأ في استخراج مسار الملف:", e);
    return null;
  }
};

/**
 * حذف الصورة القديمة من التخزين عند استبدالها
 * @param oldImageUrl رابط الصورة القديمة
 * @param bucket اسم المستودع
 * @returns نجاح أو فشل العملية
 */
export const deleteOldImageIfExists = async (
  oldImageUrl: string | null | undefined,
  bucket: string = 'product-images'
): Promise<boolean> => {
  try {
    // لا حاجة لحذف إذا لم تكن هناك صورة قديمة
    if (!oldImageUrl) {
      console.log("لا توجد صورة قديمة لحذفها");
      return true;
    }

    // تجاهل روابط المستودع المشترك (صور shared)
    if (oldImageUrl.includes('/shared/')) {
      console.log("تجاهل حذف صورة من المستودع المشترك");
      return true;
    }

    // تجاهل الروابط الخارجية (غير Supabase)
    if (!oldImageUrl.includes('supabase.co') && !oldImageUrl.includes('supabase.in') && !oldImageUrl.includes('zqlckixwpyrwdwrsuhsg')) {
      console.log("تجاهل حذف صورة خارجية (غير Supabase)");
      return true;
    }

    // استخراج مسار الملف من الرابط
    const filePath = extractFilePathFromUrl(oldImageUrl, bucket);
    
    if (!filePath) {
      console.log("لم يتم العثور على مسار الملف للحذف");
      return true;
    }

    console.log(`جاري حذف الصورة القديمة: ${filePath}`);
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.warn("تحذير: فشل حذف الصورة القديمة:", error);
      // لا نريد إيقاف العملية بسبب فشل الحذف
      return false;
    }

    console.log("تم حذف الصورة القديمة بنجاح");
    return true;
  } catch (error) {
    console.warn("تحذير: خطأ أثناء حذف الصورة القديمة:", error);
    // لا نريد إيقاف العملية بسبب خطأ في الحذف
    return false;
  }
};
