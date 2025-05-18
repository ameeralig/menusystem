
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createUniqueFilePath } from "@/utils/storageHelpers";

interface UseBannerUploadProps {
  setBannerUrl: (url: string | null) => void;
  initialUrl?: string | null;
}

export const useBannerUpload = ({ setBannerUrl, initialUrl }: UseBannerUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // استعادة الصورة المحفوظة سابقاً
  useEffect(() => {
    if (initialUrl) {
      const timestamp = new Date().getTime();
      const baseUrl = initialUrl.split('?')[0];
      const cachedUrl = `${baseUrl}?t=${timestamp}`;
      setImageUrl(cachedUrl);
      setPreviewUrl(cachedUrl);
    }
  }, [initialUrl]);

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

      const filePath = createUniqueFilePath(user.id, 'banners', file);
      
      // إضافة رأسيات لتجنب التخزين المؤقت
      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, {
          cacheControl: '0',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // الحصول على رابط العام
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // إضافة معرف زمني للصورة لتجنب التخزين المؤقت
      const timestamp = new Date().getTime();
      const baseUrl = publicUrl.split('?')[0];
      const cachedUrl = `${baseUrl}?t=${timestamp}`;
      
      // تحرير عنوان URL المؤقت
      URL.revokeObjectURL(tempPreviewUrl);
      
      setImageUrl(cachedUrl);
      setPreviewUrl(cachedUrl);
      setBannerUrl(cachedUrl); // تحديث الرابط مباشرة هنا

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
      clearImage();
      return;
    }
    
    try {
      // تأكد من أن URL صالح
      new URL(url);
      
      // إضافة معرف زمني للصورة بعد إزالة أي معرفات موجودة
      const timestamp = new Date().getTime();
      const baseUrl = url.split('?')[0];
      const updatedUrl = `${baseUrl}?t=${timestamp}`;
      
      setImageUrl(updatedUrl);
      setPreviewUrl(updatedUrl);
      setBannerUrl(updatedUrl); // تحديث الرابط مباشرة هنا
      setError(null);
    } catch (e) {
      setError("الرجاء إدخال رابط صحيح للصورة");
    }
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
