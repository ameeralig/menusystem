
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
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  // رفع ملف صورة للتصنيف
  const handleFileUpload = async (category: string, file: File) => {
    try {
      console.log(`بدء رفع صورة للتصنيف: ${category}`);
      setUploading(category);

      // التأكد من وجود مستخدم
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("يجب تسجيل الدخول أولاً");
      }

      const userId = userData.user.id;
      
      // الحصول على الصورة الحالية إن وجدت
      const existingImage = categoryImages.find(img => img.category === category);
      
      // إذا كانت هناك صورة موجودة، نحذفها أولاً
      if (existingImage?.image_url) {
        console.log(`حذف الصورة السابقة للتصنيف: ${category}`);
        const filePath = extractFilePathFromUrl(existingImage.image_url, "category-images");
        if (filePath) {
          await deleteImage("category-images", filePath);
        }
      }

      // رفع الصورة الجديدة
      console.log(`رفع صورة جديدة للتصنيف: ${category}`);
      const imageUrl = await uploadImage("category-images", file, userId, category);

      // تحديث أو إنشاء سجل لصورة التصنيف
      if (existingImage) {
        console.log(`تحديث صورة التصنيف: ${category}`);
        const { data, error } = await supabase
          .from("category_images")
          .update({ image_url: imageUrl })
          .eq("id", existingImage.id)
          .select("*");

        if (error) {
          throw error;
        }

        if (data?.[0]) {
          const updatedImages = categoryImages.map(img => 
            img.id === existingImage.id ? data[0] : img
          );
          onUpdateImages(updatedImages);
        }
      } else {
        console.log(`إنشاء صورة جديدة للتصنيف: ${category}`);
        const { data, error } = await supabase
          .from("category_images")
          .insert({
            user_id: userId,
            category: category,
            image_url: imageUrl,
          })
          .select("*");

        if (error) {
          throw error;
        }

        if (data?.[0]) {
          onUpdateImages([...categoryImages, data[0]]);
        }
      }

      console.log(`تم رفع الصورة للتصنيف ${category} بنجاح`);
      
      toast({
        title: "تم رفع الصورة بنجاح",
        description: `تم تحديث صورة التصنيف ${category}`,
      });

    } catch (error: any) {
      console.error(`خطأ في رفع صورة التصنيف ${category}:`, error);
      toast({
        title: "فشل رفع الصورة",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  // حذف صورة التصنيف
  const removeImage = async (category: string) => {
    try {
      console.log(`بدء عملية حذف صورة التصنيف: ${category}`);
      setUploading(category);

      const imageToRemove = categoryImages.find(img => img.category === category);
      if (!imageToRemove) {
        throw new Error(`لم يتم العثور على صورة للتصنيف: ${category}`);
      }

      // حذف الملف من التخزين
      if (imageToRemove.image_url) {
        const filePath = extractFilePathFromUrl(imageToRemove.image_url, "category-images");
        if (filePath) {
          await deleteImage("category-images", filePath);
        }
      }

      // حذف السجل من قاعدة البيانات
      const { error } = await supabase
        .from("category_images")
        .delete()
        .eq("id", imageToRemove.id);

      if (error) {
        throw error;
      }

      // تحديث القائمة
      const updatedImages = categoryImages.filter(img => img.id !== imageToRemove.id);
      onUpdateImages(updatedImages);

      toast({
        title: "تم حذف الصورة",
        description: `تم حذف صورة التصنيف ${category}`,
      });

    } catch (error: any) {
      console.error(`خطأ في حذف صورة التصنيف ${category}:`, error);
      toast({
        title: "فشل حذف الصورة",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  return {
    uploading,
    handleFileUpload,
    removeImage
  };
};
