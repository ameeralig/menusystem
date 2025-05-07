
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
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  return `${sanitizedFolder}/${fileName}`;
};

/**
 * رفع صورة إلى مستودع Supabase
 * @param type نوع الملف ('banners', 'categories', 'products')
 * @param file ملف الصورة
 * @param userId معرف المستخدم
 * @returns رابط الصورة العام
 */
export const uploadImage = async (
  type: string,
  file: File,
  userId: string
): Promise<string> => {
  try {
    // إنشاء المسار المناسب حسب نوع الملف
    const userBasePath = `users/${userId}`;
    const folderPath = `${userBasePath}/${type}`;
    const filePath = createUniqueFilePath(userId, folderPath, file);
    
    const { error: uploadError, data } = await supabase.storage
      .from('store-media')
      .upload(filePath, file);

    if (uploadError) {
      console.error("خطأ في رفع الصورة:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('store-media')
      .getPublicUrl(filePath);

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
