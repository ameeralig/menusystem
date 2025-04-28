
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";

/**
 * رفع صورة تصنيف إلى Supabase Storage
 * @param file ملف الصورة
 * @param userId معرف المستخدم
 * @param categoryName اسم التصنيف
 * @returns رابط URL العام للصورة
 */
export const uploadCategoryImage = async (
  file: File,
  userId: string,
  categoryName: string
): Promise<string> => {
  try {
    // إنشاء اسم ملف آمن
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}_${categoryName.replace(/\s+/g, '_')}.${fileExt}`;
    const filePath = `public/${fileName}`;
    
    // رفع الملف إلى مستودع التصنيفات
    const { error: uploadError, data } = await supabase.storage
      .from("category-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("خطأ في رفع الصورة:", uploadError);
      throw uploadError;
    }

    // الحصول على رابط URL العام
    const { data: { publicUrl } } = supabase.storage
      .from("category-images")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("فشل رفع الصورة:", error);
    throw error;
  }
};

/**
 * حذف صورة من التخزين
 * @param imageUrl رابط الصورة المراد حذفها
 */
export const deleteCategoryImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // استخراج المسار من رابط URL
    const urlObj = new URL(imageUrl);
    const path = urlObj.pathname.split('/');
    const filePath = path[path.length - 1];
    
    // حذف الملف من التخزين
    const { error } = await supabase.storage
      .from("category-images")
      .remove([`public/${filePath}`]);
    
    if (error) {
      console.error("خطأ في حذف الصورة:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("فشل حذف الصورة:", error);
    return false;
  }
};

/**
 * إنشاء تصنيف جديد مع صورة
 * @param categoryName اسم التصنيف
 * @param imageFile ملف الصورة
 * @param userId معرف المستخدم
 */
export const createCategory = async (
  categoryName: string,
  imageFile: File,
  userId: string
): Promise<Category | null> => {
  try {
    // 1. رفع الصورة إلى التخزين
    const imageUrl = await uploadCategoryImage(imageFile, userId, categoryName);
    
    // 2. إنشاء سجل التصنيف في قاعدة البيانات
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: categoryName,
        image_url: imageUrl,
        user_id: userId
      })
      .select("*")
      .single();
    
    if (error) {
      // إذا فشلت عملية إنشاء السجل، نحذف الصورة التي تم رفعها
      await deleteCategoryImage(imageUrl);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("فشل إنشاء التصنيف:", error);
    return null;
  }
};

/**
 * الحصول على تصنيف بواسطة الاسم
 * @param categoryName اسم التصنيف
 * @param userId معرف المستخدم
 */
export const getCategoryByName = async (
  categoryName: string,
  userId: string
): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("name", categoryName)
      .single();
    
    if (error) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("خطأ في البحث عن التصنيف:", error);
    return null;
  }
};
