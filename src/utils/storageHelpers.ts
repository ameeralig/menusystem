
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
    if (file.size > 500 * 1024) { // أكبر من 500 كيلوبايت (تم تخفيض الحد)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // إنشاء وعد لتحميل الصورة
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(file);
      });
      
      // تحديد أبعاد الصورة المضغوطة (الحد الأقصى 1000 بكسل بدلاً من 1200)
      const maxWidth = 1000;
      const maxHeight = 1000;
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
      ctx?.drawImage(img, 0, 0, width, height);
      
      // تحويل Canvas إلى Blob بصيغة WebP لتحسين الحجم
      const supportWebP = !!HTMLCanvasElement.prototype.toBlob;
      const quality = 0.75; // تقليل الجودة قليلاً من 0.8 إلى 0.75 للتحسين
      
      if (supportWebP) {
        // محاولة استخدام صيغة WebP
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob(resolve, 'image/webp', quality)
        );
        
        if (blob) {
          // إنشاء ملف جديد بصيغة WebP
          const optimizedFile = new File(
            [blob], 
            file.name.replace(/\.[^.]+$/, '.webp'), 
            { type: 'image/webp' }
          );
          
          console.log(`✅ تم تحسين الصورة: ${file.size / 1024}KB -> ${optimizedFile.size / 1024}KB`);
          // إذا كان الملف المحسن أصغر، استخدمه
          return optimizedFile.size < file.size ? optimizedFile : file;
        }
      }
      
      // إذا لم يكن WebP مدعومًا، استخدم نفس صيغة الملف الأصلي
      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, file.type, quality)
      );
      
      if (blob) {
        const optimizedFile = new File([blob], file.name, { type: file.type });
        console.log(`✅ تم تحسين الصورة: ${file.size / 1024}KB -> ${optimizedFile.size / 1024}KB`);
        return optimizedFile.size < file.size ? optimizedFile : file;
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
 * @returns رابط الصورة العام
 */
export const uploadImage = async (
  bucket: string,
  file: File,
  userId: string,
  folder: string = ''
): Promise<string> => {
  try {
    console.log(`بدء رفع صورة إلى دلو ${bucket} للمستخدم ${userId}`);
    
    // تحسين الصورة قبل الرفع - تم تحسين هذا الجزء
    console.log(`📊 حجم الصورة قبل التحسين: ${(file.size / 1024).toFixed(2)}KB`);
    const optimizedFile = await optimizeImage(file);
    console.log(`📊 حجم الصورة بعد التحسين: ${(optimizedFile.size / 1024).toFixed(2)}KB`);
    
    const filePath = createUniqueFilePath(userId, folder, optimizedFile);
    console.log(`مسار الملف: ${filePath}`);
    
    // تحسين خيارات الرفع
    const options = {
      cacheControl: '3600', // تقليل مدة التخزين المؤقت من سنة إلى ساعة واحدة لتحديث الصور بشكل أسرع
      upsert: true,
      contentType: optimizedFile.type,
      duplex: 'half' // إضافة لتحسين سرعة الرفع
    };
    
    const startTime = Date.now();
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, optimizedFile, options);

    const uploadTime = Date.now() - startTime;
    console.log(`⏱️ استغرق رفع الصورة: ${uploadTime}ms`);

    if (uploadError) {
      console.error("خطأ في رفع الصورة:", uploadError);
      throw uploadError;
    }

    // الحصول على الرابط العام مع تحسين الصورة
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    // إضافة معلمات تحسين للرابط
    const urlObj = new URL(publicUrl);
    // إضافة معلمة الصيغة WebP وجودة الصورة ومنع التخزين المؤقت
    urlObj.searchParams.append('format', 'webp');
    urlObj.searchParams.append('quality', '85');
    urlObj.searchParams.append('t', Date.now().toString());
    
    const optimizedUrl = urlObj.toString();
      
    console.log(`تم رفع الصورة بنجاح. الرابط المحسن: ${optimizedUrl}`);
    return optimizedUrl;
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
 * إنشاء رابط مع طابع زمني لتجنب مشاكل التخزين المؤقت
 * @param url الرابط الأصلي
 * @returns رابط مع طابع زمني
 */
export const getUrlWithTimestamp = (url: string | null): string | null => {
  if (!url) return null;
  
  const timestamp = Date.now();
  const baseUrl = url.split('?')[0];
  
  // تحسين URL الصورة لاستخدام WebP إذا كان متاحًا
  if (baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')) {
    return `${baseUrl}?format=webp&quality=85&t=${timestamp}`;
  }
  
  return `${baseUrl}?t=${timestamp}`;
};

/**
 * فحص ما إذا كان الرابط صالح للصورة
 * @param url رابط الصورة
 * @returns وعد يحل إلى صحة الرابط
 */
export const checkImageUrl = async (url: string | null): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // استخدام Image API بدلاً من fetch للتحقق من صلاحية الصورة
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`✅ تم التحقق من صلاحية الصورة: ${url}`);
        resolve(true);
      };
      
      img.onerror = () => {
        console.error(`❌ الصورة غير صالحة: ${url}`);
        resolve(false);
      };
      
      // إضافة معامل عشوائي لتجنب التخزين المؤقت
      img.src = url.includes('?') ? 
        `${url}&random=${Math.random()}` : 
        `${url}?random=${Math.random()}`;
        
      // تعيين مهلة زمنية للتحميل
      setTimeout(() => {
        if (!img.complete) {
          console.error(`⏱️ انتهت مهلة تحميل الصورة: ${url}`);
          resolve(false);
        }
      }, 5000); // 5 ثوان كمهلة زمنية
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
 * تحويل الصورة المرفوعة من URL إلى WebP بجودة عالية
 * @param originalUrl رابط الصورة الأصلي
 * @returns رابط الصورة بصيغة WebP
 */
export const convertToWebP = async (originalUrl: string): Promise<string> => {
  if (!originalUrl) return originalUrl;
  
  try {
    // تحميل الصورة من الرابط الأصلي
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = originalUrl;
    });
    
    // إنشاء canvas بنفس أبعاد الصورة
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    // رسم الصورة على canvas
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);
    
    // تحويل إلى WebP
    const webPBlob = await new Promise<Blob | null>((resolve) => 
      canvas.toBlob(resolve, 'image/webp', 0.85)
    );
    
    if (!webPBlob) {
      console.log("تعذر تحويل الصورة إلى WebP، إرجاع الرابط الأصلي");
      return originalUrl;
    }
    
    // إنشاء رابط محلي للصورة المحولة
    const webPUrl = URL.createObjectURL(webPBlob);
    console.log(`تم تحويل الصورة إلى WebP: ${originalUrl} -> ${webPUrl}`);
    
    // في حالة الاستخدام المباشر، يمكنك استخدام الرابط المحلي
    // لكن في حالة الحفظ، يجب تحميل الصورة إلى الخادم
    return webPUrl;
  } catch (error) {
    console.error("خطأ في تحويل الصورة إلى WebP:", error);
    return originalUrl;
  }
};
