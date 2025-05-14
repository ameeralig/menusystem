
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
    
    const filePath = createUniqueFilePath(userId, folder, file);
    console.log(`مسار الملف: ${filePath}`);
    
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '0', // تعطيل التخزين المؤقت تمامًا
        upsert: true
      });

    if (uploadError) {
      console.error("خطأ في رفع الصورة:", uploadError);
      throw uploadError;
    }

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
 * إنشاء رابط مع طابع زمني لتجنب مشاكل التخزين المؤقت
 * @param url الرابط الأصلي
 * @returns رابط مع طابع زمني
 */
export const getUrlWithTimestamp = (url: string | null): string | null => {
  if (!url) return null;
  
  const timestamp = Date.now();
  const baseUrl = url.split('?')[0];
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
