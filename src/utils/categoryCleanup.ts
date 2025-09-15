import { supabase } from "@/integrations/supabase/client";

/**
 * دالة مساعدة لحذف تصنيف فارغ معين
 */
export const deleteEmptyCategory = async (categoryName: string, userId: string) => {
  try {
    console.log(`محاولة حذف التصنيف الفارغ: ${categoryName}`);
    
    // التحقق من عدم وجود منتجات في هذا التصنيف
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("user_id", userId)
      .eq("category", categoryName)
      .limit(1);

    if (productsError) {
      throw productsError;
    }

    if (products && products.length > 0) {
      console.log(`التصنيف ${categoryName} يحتوي على منتجات، لا يمكن حذفه`);
      return false;
    }

    // حذف صورة التصنيف من قاعدة البيانات
    const { error: deleteError } = await supabase
      .from("category_images")
      .delete()
      .eq("user_id", userId)
      .eq("category", categoryName);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`تم حذف التصنيف الفارغ بنجاح: ${categoryName}`);
    return true;

  } catch (error) {
    console.error(`خطأ في حذف التصنيف ${categoryName}:`, error);
    throw error;
  }
};

/**
 * دالة لحذف التصنيف الفريد "القهوة التركية 🇹🇷"
 */
export const deleteSpecificEmptyCategory = async (userId: string) => {
  const categoryName = "القهوة التركية 🇹🇷";
  return await deleteEmptyCategory(categoryName, userId);
};