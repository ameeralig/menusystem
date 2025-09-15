import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * خطاف لتنظيف التصنيفات الفارغة تلقائياً
 * يقوم بحذف التصنيفات التي لا تحتوي على منتجات من قاعدة البيانات
 */
export const useCleanupEmptyCategories = (userId: string | null, trigger: number = 0) => {
  const { toast } = useToast();

  const cleanupEmptyCategories = useCallback(async () => {
    if (!userId) return;

    try {
      console.log("بدء عملية تنظيف التصنيفات الفارغة...");
      
      // البحث عن التصنيفات التي لا تحتوي على منتجات
      const { data: emptyCategories, error: findError } = await supabase
        .from("category_images")
        .select(`
          id,
          category,
          user_id
        `)
        .eq("user_id", userId);

      if (findError) {
        throw findError;
      }

      if (!emptyCategories || emptyCategories.length === 0) {
        console.log("لا توجد تصنيفات لفحصها");
        return;
      }

      // فحص كل تصنيف للتأكد من عدم وجود منتجات به
      const categoriesToDelete = [];
      
      for (const categoryImage of emptyCategories) {
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id")
          .eq("user_id", userId)
          .eq("category", categoryImage.category)
          .limit(1);

        if (productsError) {
          console.error(`خطأ في فحص المنتجات للتصنيف ${categoryImage.category}:`, productsError);
          continue;
        }

        // إذا لم توجد منتجات في هذا التصنيف، أضفه للحذف
        if (!products || products.length === 0) {
          categoriesToDelete.push(categoryImage);
        }
      }

      if (categoriesToDelete.length === 0) {
        console.log("لا توجد تصنيفات فارغة لحذفها");
        return;
      }

      // حذف التصنيفات الفارغة
      const categoryIds = categoriesToDelete.map(cat => cat.id);
      const { error: deleteError } = await supabase
        .from("category_images")
        .delete()
        .in('id', categoryIds);

      if (deleteError) {
        throw deleteError;
      }

      const deletedCategoryNames = categoriesToDelete.map(cat => cat.category);
      console.log(`تم حذف التصنيفات الفارغة بنجاح:`, deletedCategoryNames);

      if (deletedCategoryNames.length > 0) {
        toast({
          title: "تم تنظيف التصنيفات",
          description: `تم حذف ${deletedCategoryNames.length} تصنيف فارغ`,
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error("خطأ في تنظيف التصنيفات الفارغة:", error);
      toast({
        title: "خطأ في تنظيف التصنيفات",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  // تشغيل التنظيف عند تغيير trigger أو userId
  useEffect(() => {
    if (trigger > 0) {
      cleanupEmptyCategories();
    }
  }, [trigger, cleanupEmptyCategories]);

  return { cleanupEmptyCategories };
};