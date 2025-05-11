
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CategoryImage } from "@/types/categoryImage";
import { uploadImage, deleteImage, extractFilePathFromUrl } from "@/utils/storageHelpers";

interface UseCategoryImageUploadProps {
  categoryImages: CategoryImage[];
  onUpdateImages: (images: CategoryImage[]) => void;
}

export const useCategoryImageUpload = ({
  categoryImages,
  onUpdateImages
}: UseCategoryImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  
  // تنظيف اسم الملف ليكون صالحاً للمسارات
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, '_');
  };

  // رفع ملف صورة جديد
  const handleFileUpload = async (category: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "خطأ في رفع الصورة",
        description: "الرجاء اختيار ملف صورة صالح",
      });
      return;
    }

    try {
      setUploading(category);
      console.log(`بدء رفع صورة للتصنيف "${category}"`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // حذف الصورة القديمة من التخزين إذا وجدت
      const existingImage = categoryImages.find(img => img.category === category);
      if (existingImage?.image_url) {
        const oldPath = extractFilePathFromUrl(existingImage.image_url, "category-images");
        if (oldPath) {
          console.log(`محاولة حذف الصورة القديمة: ${oldPath}`);
          await deleteImage("category-images", oldPath);
        }
      }

      // رفع الصورة الجديدة باستخدام الوظيفة المساعدة
      const publicUrl = await uploadImage(
        "category-images",
        file,
        user.id,
        sanitizeFileName(category)
      );
        
      console.log(`تم رفع الصورة بنجاح. الرابط العام: ${publicUrl}`);

      // تحديث أو إضافة سجل في قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .upsert({
          user_id: user.id,
          category,
          image_url: publicUrl,
        }, {
          onConflict: 'user_id,category'
        });

      if (dbError) {
        console.error("خطأ في تحديث قاعدة البيانات:", dbError);
        throw dbError;
      }

      // تحديث القائمة المحلية مع طابع زمني
      const timestamp = Date.now();
      const finalUrl = `${publicUrl}?t=${timestamp}`;
      
      const updatedImages = [
        ...categoryImages.filter(img => img.category !== category),
        { 
          user_id: user.id,
          category, 
          image_url: finalUrl 
        }
      ];
      
      console.log(`تم تحديث القائمة المحلية. عدد الصور: ${updatedImages.length}`);
      onUpdateImages(updatedImages);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: `تم تحديث صورة تصنيف ${category}`,
      });
    } catch (error: any) {
      console.error("خطأ في رفع الصورة:", error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع الصورة",
        description: error.message,
      });
    } finally {
      setUploading(null);
    }
  };

  // حذف صورة تصنيف
  const removeImage = async (category: string) => {
    const imageToDelete = categoryImages.find(img => img.category === category);
    if (!imageToDelete) return;

    try {
      console.log(`بدء حذف صورة التصنيف "${category}"`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // استخراج مسار الملف من الرابط
      const filePath = extractFilePathFromUrl(imageToDelete.image_url, "category-images");

      if (filePath) {
        console.log(`محاولة حذف الملف: ${filePath}`);
        
        // حذف الملف من التخزين
        await deleteImage("category-images", filePath);
      }

      // حذف السجل من قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .delete()
        .match({ user_id: user.id, category });

      if (dbError) throw dbError;

      // تحديث القائمة المحلية
      const updatedImages = categoryImages.filter(img => img.category !== category);
      onUpdateImages(updatedImages);
      
      console.log(`تم حذف صورة التصنيف "${category}" بنجاح`);

      toast({
        title: "تم حذف الصورة",
        description: `تم حذف صورة تصنيف ${category}`,
      });
    } catch (error: any) {
      console.error("خطأ في حذف الصورة:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف الصورة",
        description: error.message,
      });
    }
  };

  return {
    uploading,
    handleFileUpload,
    removeImage
  };
};
