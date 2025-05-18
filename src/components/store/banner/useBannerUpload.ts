
import { useState, useEffect, useMemo } from "react";
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

  // تخزين مؤقت لتاريخ التحميل، لمنع طلبات غير ضرورية
  const cacheKey = useMemo(() => `banner_cache_${Date.now()}`, []);

  // استعادة الصورة المحفوظة سابقاً
  useEffect(() => {
    if (initialUrl) {
      const timestamp = new Date().getTime();
      const baseUrl = initialUrl.split('?')[0];
      const cachedUrl = `${baseUrl}?t=${timestamp}&cache=${cacheKey}`;
      setImageUrl(cachedUrl);
      setPreviewUrl(cachedUrl);
      
      // تحميل مسبق للصورة
      const preloadImage = new Image();
      preloadImage.src = cachedUrl;
      preloadImage.width = 1600; // تعيين أبعاد ثابتة
      preloadImage.height = 320; // تعيين أبعاد ثابتة
      preloadImage.fetchPriority = "high";
    }
  }, [initialUrl, cacheKey]);

  // تحويل الملف إلى URL بيانات مؤقت للمعاينة الفورية
  const fileToDataUrl = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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

      // إنشاء عنوان URL مؤقت للمعاينة قبل الرفع للتقليل من CLS
      const tempDataUrl = await fileToDataUrl(file);
      setPreviewUrl(tempDataUrl);

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
      const cachedUrl = `${baseUrl}?t=${timestamp}&cache=${cacheKey}`;
      
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
      const updatedUrl = `${baseUrl}?t=${timestamp}&cache=${cacheKey}`;
      
      setImageUrl(updatedUrl);
      setPreviewUrl(updatedUrl);
      setBannerUrl(updatedUrl); // تحديث الرابط مباشرة هنا
      setError(null);
      
      // تحميل مسبق للصورة
      const preloadImage = new Image();
      preloadImage.src = updatedUrl;
      preloadImage.width = 1600; // تعيين أبعاد ثابتة
      preloadImage.height = 320; // تعيين أبعاد ثابتة
      preloadImage.fetchPriority = "high";
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
