
import { Separator } from "@/components/ui/separator";
import { CategoryImage } from "@/types/categoryImage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategoryImageCard } from "./category-image/CategoryImageCard";
import { useCategoryImageUpload } from "./category-image/useCategoryImageUpload";
import { CategoryOrderManager } from "./category-order/CategoryOrderManager";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoryImageManagerProps {
  categories: string[];
  categoryImages: CategoryImage[];
  onUpdateImages: (images: CategoryImage[]) => void;
  userId?: string;
  onCategoryDeleted?: () => void;
}

export const CategoryImageManager = ({
  categories,
  categoryImages,
  onUpdateImages,
  userId,
  onCategoryDeleted,
}: CategoryImageManagerProps) => {
  const { 
    uploading, 
    handleFileUpload, 
    handleUrlUpload,
    removeImage 
  } = useCategoryImageUpload({
    categoryImages,
    onUpdateImages
  });
  const { toast } = useToast();
  
  // تسجيل معلومات حول صور التصنيفات عند تغيرها
  useEffect(() => {
    console.log("CategoryImageManager: تلقي", categoryImages.length, "صورة تصنيف");
    if (categoryImages.length > 0) {
      console.log("تفاصيل صور التصنيفات:");
      categoryImages.forEach(img => {
        console.log(`- التصنيف: ${img.category}, الرابط: ${img.image_url}, الترتيب: ${img.display_order}`);
      });
    }
  }, [categoryImages]);

  const handleOrderUpdate = async () => {
    // إعادة جلب صور التصنيفات بعد تحديث الترتيب
    if (userId) {
      try {
        const { data, error } = await supabase
          .from("category_images")
          .select("*")
          .eq("user_id", userId)
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        if (data) {
          onUpdateImages(data);
          toast({
            title: "تم التحديث",
            description: "تم تحديث ترتيب التصنيفات بنجاح",
          });
        }
      } catch (error: any) {
        console.error("خطأ في إعادة جلب التصنيفات:", error);
      }
    }
  };

  const handleDeleteCategory = async (category: string, confirmationText?: string) => {
    if (!userId) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على معرف المستخدم",
        variant: "destructive"
      });
      return;
    }

    try {
      // التحقق من وجود منتجات في هذا التصنيف
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("user_id", userId)
        .eq("category", category);

      if (productsError) {
        throw productsError;
      }

      if (products && products.length > 0) {
        // إذا لم يتم تمرير نص التأكيد، فهذا يعني أن المستخدم لم يؤكد بعد
        if (!confirmationText) {
          return { requiresConfirmation: true, productCount: products.length };
        }

        // التحقق من نص التأكيد
        if (confirmationText !== "احذف التصنيف") {
          toast({
            title: "خطأ في التأكيد",
            description: "يجب كتابة 'احذف التصنيف' للتأكيد",
            variant: "destructive"
          });
          return { requiresConfirmation: true, productCount: products.length };
        }

        // حذف جميع المنتجات في التصنيف أولاً
        const { error: deleteProductsError } = await supabase
          .from("products")
          .delete()
          .eq("user_id", userId)
          .eq("category", category);

        if (deleteProductsError) {
          throw deleteProductsError;
        }
      }

      // حذف صورة التصنيف إذا كانت موجودة
      const { error: deleteImageError } = await supabase
        .from("category_images")
        .delete()
        .eq("user_id", userId)
        .eq("category", category);

      if (deleteImageError) {
        throw deleteImageError;
      }

      const message = products && products.length > 0 
        ? `تم حذف التصنيف "${category}" مع ${products.length} منتج بنجاح`
        : `تم حذف التصنيف "${category}" بنجاح`;

      toast({
        title: "تم حذف التصنيف",
        description: message,
        variant: "default"
      });

      // إعادة تحميل البيانات
      if (onCategoryDeleted) {
        onCategoryDeleted();
      }

      return { success: true };

    } catch (error: any) {
      console.error("خطأ في حذف التصنيف:", error);
      toast({
        title: "خطأ في حذف التصنيف",
        description: error.message,
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">إدارة التصنيفات</h3>
        <Alert>
          <AlertTitle>لا توجد تصنيفات</AlertTitle>
          <AlertDescription>
            أضف منتجات بتصنيفات مختلفة أولاً لإدارة التصنيفات
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* قسم ترتيب التصنيفات */}
        <CategoryOrderManager 
          categories={categories}
          categoryImages={categoryImages}
          onOrderUpdate={handleOrderUpdate}
        />
        
        <Separator />
        
        {/* قسم إدارة صور التصنيفات */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold">إدارة صور التصنيفات</h3>
            <p className="text-sm text-muted-foreground">
              يمكنك تخصيص صورة لكل تصنيف تظهر في صفحة المعاينة. صور التصنيفات منفصلة تماماً عن صور المنتجات.
            </p>
          </div>
          
          {/* ترتيب التصنيفات حسب display_order */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...categories].sort((a, b) => {
              const aImage = categoryImages.find(img => img.category === a);
              const bImage = categoryImages.find(img => img.category === b);
              
              const aOrder = aImage?.display_order || 999;
              const bOrder = bImage?.display_order || 999;
              
              return aOrder - bOrder;
            }).map((category) => {
              const categoryImage = categoryImages.find(img => img.category === category);
              
              return (
                <CategoryImageCard
                  key={category}
                  category={category}
                  categoryImage={categoryImage}
                  onFileUpload={handleFileUpload}
                  onUrlUpload={handleUrlUpload}
                  onRemoveImage={removeImage}
                  onDeleteCategory={userId ? handleDeleteCategory : undefined}
                  userId={userId || undefined}
                  uploading={uploading === category}
                />
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
