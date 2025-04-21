
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createUniqueFilePath } from "@/utils/storageHelpers";

interface UseBannerUploadProps {
  setBannerUrl: (url: string | null) => void;
}

export const useBannerUpload = ({ setBannerUrl }: UseBannerUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const filePath = createUniqueFilePath(user.id, 'banners', file);
      
      // إضافة خيارات التحكم في التخزين المؤقت
      const options = {
        cacheControl: "no-cache, no-store, must-revalidate",
        upsert: false
      };
      
      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, options);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // إضافة معرف فريد أكثر تعقيداً للصورة لتجنب التخزين المؤقت
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      // التأكد من أن العنوان لا يحتوي على معرف سابق
      const baseUrl = publicUrl.split('?')[0];
      const cachedUrl = `${baseUrl}?v=${uniqueId}`;
      
      setImageUrl(cachedUrl);
      setPreviewUrl(cachedUrl);
      setBannerUrl(cachedUrl);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "يمكنك الآن حفظ التغييرات",
        duration: 3000,
      });

    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message || "حدث خطأ أثناء رفع الصورة");
    }
  };

  const handleUrlChange = (url: string) => {
    if (!url) {
      setImageUrl("");
      setPreviewUrl(null);
      setBannerUrl(null);
      setError(null);
      return;
    }
    
    // إضافة معرف زمني فريد أكثر تعقيداً للصورة
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const baseUrl = url.split('?')[0];
    const updatedUrl = `${baseUrl}?v=${uniqueId}`;
    
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
