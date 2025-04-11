
import { supabase } from "@/integrations/supabase/client";

/**
 * تحميل صورة إلى مستودع Supabase
 * @param file الملف المراد تحميله
 * @param bucket اسم المستودع
 * @param path المسار الذي سيتم تخزين الملف فيه
 * @returns رابط الصورة العامة أو null في حالة الخطأ
 */
export const uploadImage = async (
  file: File,
  bucket: string,
  path: string
): Promise<string | null> => {
  try {
    // تحقق من تسجيل الدخول
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("يجب تسجيل الدخول أولاً");

    // تحميل الملف
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }
    
    // الحصول على الرابط العام
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("خطأ في تحميل الصورة:", error);
    return null;
  }
};

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
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
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
  const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  return `${folder}/${fileName}`;
};
