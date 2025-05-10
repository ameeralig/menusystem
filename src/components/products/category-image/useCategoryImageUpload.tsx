
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CategoryImage } from "@/types/categoryImage";
import { deleteImage } from "@/utils/storageHelpers";

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
  
  // تنظيف اسم التصنيف ليكون صالحاً للاستخدام في مسارات الملفات
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, '_');
  };

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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const fileExt = file.name.split(".").pop();
      const sanitizedCategory = sanitizeFileName(category);
      const fileName = `${user.id}_${sanitizedCategory}_${Date.now()}.${fileExt}`;

      console.log(`بدء رفع صورة التصنيف ${category} إلى Supabase`);

      // رفع الصورة إلى مجلد category-images
      const { error: uploadError, data } = await supabase.storage
        .from("category-images")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error("خطأ في رفع الصورة:", uploadError);
        throw uploadError;
      }

      console.log(`تم رفع الصورة بنجاح، جاري الحصول على الرابط العام`);

      // الحصول على الرابط العام للصورة
      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(fileName);
        
      // إضافة معلمة زمنية لمنع التخزين المؤقت
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      console.log(`تم الحصول على الرابط العام: ${finalUrl}`);

      // إضافة أو تحديث صورة التصنيف في قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .upsert({
          user_id: user.id,
          category,
          image_url: publicUrl, // استخدام الرابط الأصلي بدون معلمات إضافية
        });

      if (dbError) {
        console.error("خطأ في حفظ بيانات الصورة في قاعدة البيانات:", dbError);
        throw dbError;
      }

      console.log(`تم تحديث قاعدة البيانات بنجاح`);

      // تحديث القائمة المحلية للصور
      const updatedImages = [...categoryImages.filter(img => img.category !== category), 
        { category, image_url: finalUrl }
      ];
      
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

  const removeImage = async (category: string) => {
    const imageToDelete = categoryImages.find(img => img.category === category);
    if (!imageToDelete) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // استخراج اسم الملف من رابط الصورة
      const pathParts = imageToDelete.image_url.split("/");
      const fileNameWithParams = pathParts[pathParts.length - 1];
      const fileName = fileNameWithParams.split("?")[0];

      console.log(`محاولة حذف الملف: ${fileName}`);

      // حذف السجل من قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .delete()
        .match({ user_id: user.id, category });

      if (dbError) throw dbError;

      // حذف الملف من التخزين
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("category-images")
          .remove([fileName]);
          
        if (storageError) {
          console.warn(`تحذير: فشل في حذف الملف من التخزين`, storageError);
        }
      }

      const updatedImages = categoryImages.filter(img => img.category !== category);
      onUpdateImages(updatedImages);

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
