
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

    // تحقق من وجود المستودع
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.error(`Bucket '${bucket}' does not exist. Available buckets:`, buckets?.map(b => b.name));
      throw new Error(`مستودع الملفات '${bucket}' غير موجود`);
    }

    console.log(`Attempting to upload file to bucket: ${bucket}, path: ${path}`);
    
    // تحميل الملف
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }
    
    console.log(`File uploaded successfully to ${bucket}/${path}`);
    
    // الحصول على الرابط العام
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    console.log("Public URL generated:", publicUrlData.publicUrl);
    
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
