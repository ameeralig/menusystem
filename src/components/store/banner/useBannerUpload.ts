
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createUniqueFilePath } from "@/utils/storageHelpers";
import { toast } from "sonner";

interface UseBannerUploadProps {
  setBannerUrl: (url: string | null) => void;
}

export const useBannerUpload = ({ setBannerUrl }: UseBannerUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast: uiToast } = useToast();

  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      
      if (!file.type.startsWith('image/')) {
        setError("الرجاء اختيار ملف صورة صالح");
        return;
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setError("حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت");
        return;
      }

      // إنشاء عنوان URL مؤقت للمعاينة قبل الرفع
      const tempPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(tempPreviewUrl);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // إنشاء مسار الملف في مجلد المستخدم/banners
      const userFolderPath = `users/${user.id}/banners`;
      const filePath = createUniqueFilePath(user.id, userFolderPath, file);
      
      const { data, error: uploadError } = await supabase.storage
        .from('store-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-media')
        .getPublicUrl(filePath);

      // إضافة معرف زمني للصورة لتجنب التخزين المؤقت
      const timestamp = new Date().getTime();
      // التأكد من أن العنوان لا يحتوي على معرف سابق
      const baseUrl = publicUrl.split('?')[0];
      const cachedUrl = `${baseUrl}?t=${timestamp}`;
      
      console.log("Banner uploaded successfully, URL:", cachedUrl);
      
      // تحرير عنوان URL المؤقت
      URL.revokeObjectURL(tempPreviewUrl);
      
      setImageUrl(cachedUrl);
      setPreviewUrl(cachedUrl);
      setBannerUrl(cachedUrl);

      toast.success("تم رفع الصورة بنجاح");

    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message || "حدث خطأ أثناء رفع الصورة");
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handleUrlChange = (url: string) => {
    if (!url) {
      clearImage();
      return;
    }
    
    // إضافة معرف زمني للصورة بعد إزالة أي معرفات موجودة
    const timestamp = new Date().getTime();
    const baseUrl = url.split('?')[0];
    const updatedUrl = `${baseUrl}?t=${timestamp}`;
    
    setImageUrl(updatedUrl);
    setPreviewUrl(updatedUrl);
    setBannerUrl(updatedUrl);
    setError(null);
  };

  const clearImage = () => {
    setImageUrl("");
    setPreviewUrl(null);
    setBannerUrl(null);
    setError(null);
  };

  return {
    error,
    setError,
    imageUrl,
    previewUrl,
    handleImageUpload,
    handleUrlChange,
    clearImage
  };
};
