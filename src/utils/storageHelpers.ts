
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
    console.log(`Attempting to delete image from ${bucket}: ${path}`);
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
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
  // إضافة طابع زمني وقيمة عشوائية أكثر تعقيداً
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const fileName = `${userId}_${uniqueId}.${fileExt}`;
  return `${sanitizedFolder}/${fileName}`;
};

/**
 * إنشاء رابط بمعلمات لمنع التخزين المؤقت
 * @param baseUrl الرابط الأساسي للصورة
 * @returns الرابط مع معلمات لمنع التخزين المؤقت
 */
export const createNoCacheImageUrl = (baseUrl: string): string => {
  if (!baseUrl) return '';
  
  // إزالة أي معلمات موجودة سابقاً
  const cleanUrl = baseUrl.split('?')[0];
  
  // إضافة معرف فريد ومعلمات لمنع التخزين المؤقت
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  return `${cleanUrl}?v=${uniqueId}&nocache=${Math.random().toString(36).substring(2)}`;
};
