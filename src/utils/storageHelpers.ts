
import { supabase } from "@/integrations/supabase/client";

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
    
    // التحقق من وجود المستودع أولاً
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.error(`المستودع ${bucket} غير موجود`);
      return false;
    }
    
    const { error, data } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error("خطأ في حذف الصورة:", error);
      throw error;
    }
    
    console.log("تم حذف الصورة بنجاح:", data);
    return true;
  } catch (error) {
    console.error("خطأ في حذف الصورة:", error);
    return false;
  }
};

/**
 * إنشاء مسار فريد للملف
 * @param userId معرّف المستخدم
 * @param folder المجلد
 * @param file الملف
 * @returns المسار الفريد للملف
 */
export const createUniqueFilePath = (userId: string, folder: string, file: File): string => {
  const fileExt = file.name.split('.').pop();
  // استبدال الأحرف الخاصة والمسافات بشرطة سفلية
  const sanitizedFolder = folder.replace(/\s+/g, '_').replace(/[^\w.-]/g, '_');
  const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  return `${sanitizedFolder}/${fileName}`;
};

/**
 * رفع صورة إلى مستودع Supabase
 * @param bucket اسم المستودع (مثل 'product-images' أو 'category-images')
 * @param file ملف الصورة
 * @param userId معرف المستخدم
 * @param folder اسم المجلد (اختياري)
 * @returns رابط الصورة العام
 */
export const uploadImage = async (
  bucket: string,
  file: File,
  userId: string,
  folder: string = ''
): Promise<string> => {
  try {
    // التحقق من وجود المستودع أولاً
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      throw new Error(`المستودع ${bucket} غير موجود. يرجى التحقق من إعدادات Supabase.`);
    }
    
    const filePath = createUniqueFilePath(userId, folder, file);
    
    console.log(`رفع الملف ${file.name} إلى المستودع ${bucket}/${filePath}`);
    
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: 'no-cache',
        upsert: true
      });

    if (uploadError) {
      console.error("خطأ في رفع الصورة:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    // إضافة طابع زمني لمنع التخزين المؤقت
    const timestamp = Date.now();
    const finalUrl = `${publicUrl}?t=${timestamp}`;
    
    console.log(`تم رفع الصورة بنجاح. الرابط العام: ${finalUrl}`);
    
    return finalUrl;
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
 * التحقق من وجود مستودع وإنشائه إذا كان غير موجود
 * @param bucket اسم المستودع
 * @returns نجاح أو فشل العملية
 */
export const ensureBucketExists = async (bucket: string): Promise<boolean> => {
  try {
    // التحقق من وجود المستودع
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (bucketExists) {
      console.log(`المستودع ${bucket} موجود بالفعل`);
      return true;
    }
    
    // إنشاء المستودع إذا لم يكن موجوداً
    console.log(`محاولة إنشاء المستودع ${bucket}...`);
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true
    });
    
    if (error) {
      console.error(`خطأ في إنشاء المستودع ${bucket}:`, error);
      return false;
    }
    
    console.log(`تم إنشاء المستودع ${bucket} بنجاح`);
    return true;
  } catch (error) {
    console.error("خطأ في التحقق من وجود المستودع:", error);
    return false;
  }
};
