
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
    // تحميل الملف
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (uploadError) throw uploadError;
    
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
