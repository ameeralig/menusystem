
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
  const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  return `${sanitizedFolder}/${fileName}`;
};
