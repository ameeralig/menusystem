
import { useState, useCallback } from "react";
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

  const handleFileUpload = useCallback(async (category: string, file: File) => {
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

      console.log("مسار الملف للرفع:", filePath);
      console.log("نوع الملف:", file.type);
      console.log("حجم الملف:", file.size);

      // التحقق من وجود المستودع قبل الرفع
      const { data: buckets } = await supabase.storage.listBuckets();
      const categoryBucket = buckets?.find(b => b.name === "category-images");
      
      if (!categoryBucket) {
        console.error("المستودع category-images غير موجود. يرجى التحقق من تكوين Supabase.");
        throw new Error("مستودع صور التصنيفات غير موجود");
      }

      const { error: uploadError, data } = await supabase.storage
        .from("category-images")
        .upload(filePath, file, {
          cacheControl: 'no-cache',
          upsert: true
        });

      if (uploadError) throw uploadError;

      console.log("تم رفع الملف بنجاح:", data);

      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);
        
      // إضافة معلمات لمنع التخزين المؤقت للصورة
      const timestamp = Date.now();
      const finalUrl = `${publicUrl}?t=${timestamp}`;

      console.log("الرابط العام للصورة:", finalUrl);

      // إضافة أو تحديث صورة التصنيف في قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .upsert({
          user_id: user.id,
          category,
          image_url: finalUrl,
        }, {
          onConflict: 'user_id,category' // تحديد العمود الذي يتم استخدامه للتحقق من التكرار
        });

      if (dbError) throw dbError;

      console.log("تم تحديث قاعدة البيانات بنجاح");

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
  }, [categoryImages, toast, onUpdateImages]);

  const removeImage = useCallback(async (category: string) => {
    const imageToDelete = categoryImages.find(img => img.category === category);
    if (!imageToDelete) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // حذف السجل من قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .delete()
        .eq("user_id", user.id)
        .eq("category", category);

      if (dbError) throw dbError;

      // محاولة حذف الملف من التخزين إذا تم استخراج اسم الملف بنجاح
      const fullPath = imageToDelete.image_url.split("/").pop()?.split("?")[0];
      if (fullPath) {
        console.log("محاولة حذف الصورة من المستودع:", fullPath);
        await supabase.storage
          .from("category-images")
          .remove([fullPath]);
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
  }, [categoryImages, toast, onUpdateImages]);

  return {
    uploading,
    handleFileUpload,
    removeImage
  };
};
