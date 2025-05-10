
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    // استبدال الأحرف الخاصة والمسافات بشرطة سفلية
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
      // استخدام الدالة لتنظيف اسم التصنيف
      const sanitizedCategory = sanitizeFileName(category);
      const fileName = `${user.id}_${sanitizedCategory}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("File path for upload:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(filePath, file, {
          cacheControl: 'no-cache',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);
        
      // إضافة معلمات لمنع التخزين المؤقت للصورة
      const timestamp = Date.now();
      const finalUrl = `${publicUrl}?t=${timestamp}`;

      // إضافة أو تحديث صورة التصنيف في قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .upsert({
          user_id: user.id,
          category,
          image_url: finalUrl,
        });

      if (dbError) throw dbError;

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

      // حذف السجل من قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .delete()
        .match({ user_id: user.id, category });

      if (dbError) throw dbError;

      // حذف الملف من التخزين إذا كان موجوداً
      const fileName = imageToDelete.image_url.split("/").pop()?.split("?")[0];
      if (fileName) {
        await deleteImage("category-images", fileName);
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
