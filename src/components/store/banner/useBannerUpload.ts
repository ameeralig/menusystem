
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createUniqueFilePath, optimizeImage } from "@/utils/storageHelpers";

interface UseBannerUploadProps {
  setBannerUrl: (url: string | null) => void;
  initialUrl?: string | null;
}

export const useBannerUpload = ({ setBannerUrl, initialUrl }: UseBannerUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // استعادة الصورة المحفوظة سابقاً
  useEffect(() => {
    if (initialUrl) {
      const timestamp = new Date().getTime();
      const baseUrl = initialUrl.split('?')[0];
      const cachedUrl = `${baseUrl}?format=webp&quality=85&t=${timestamp}`;
      setImageUrl(cachedUrl);
      setPreviewUrl(cachedUrl);
    }
  }, [initialUrl]);

  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      if (!file.type.startsWith('image/')) {
        setError("الرجاء اختيار ملف صورة صالح");
        setIsProcessing(false);
        return;
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setError("حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت");
        setIsProcessing(false);
        return;
      }

      // قياس وقت معالجة الصورة
      const startTime = Date.now();

      console.log(`📊 حجم الصورة قبل المعالجة: ${(file.size / 1024).toFixed(2)}KB`);
      
      // تحسين الصورة قبل الإظهار
      const optimizedFile = await optimizeImage(file);
      console.log(`📊 حجم الصورة بعد المعالجة: ${(optimizedFile.size / 1024).toFixed(2)}KB`);
      
      // إنشاء عنوان URL مؤقت للمعاينة قبل الرفع
      const tempPreviewUrl = URL.createObjectURL(optimizedFile);
      setPreviewUrl(tempPreviewUrl);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const filePath = createUniqueFilePath(user.id, 'banners', optimizedFile);
      
      // رفع الصورة المحسنة مع خيارات تحسين
      const uploadOptions = {
        cacheControl: '3600', // تخزين مؤقت لمدة ساعة
        upsert: true,
        contentType: optimizedFile.type,
        duplex: 'half'
      };
      
      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, optimizedFile, uploadOptions);

      if (uploadError) throw uploadError;

      // الحصول على رابط العام
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // إضافة معلمات تحسين للرابط
      const urlObj = new URL(publicUrl);
      urlObj.searchParams.append('format', 'webp');
      urlObj.searchParams.append('quality', '85');
      urlObj.searchParams.append('t', Date.now().toString());
      
      const optimizedUrl = urlObj.toString();
      
      // تحرير عنوان URL المؤقت
      URL.revokeObjectURL(tempPreviewUrl);
      
      setImageUrl(optimizedUrl);
      setPreviewUrl(optimizedUrl);
      setBannerUrl(optimizedUrl); // تحديث الرابط مباشرة هنا
      
      // قياس الوقت الإجمالي
      const totalTime = Date.now() - startTime;
      console.log(`⏱️ اكتمل رفع ومعالجة الصورة في ${totalTime}ms`);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "يمكنك الآن حفظ التغييرات",
        duration: 3000,
      });

    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsProcessing(false);
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
      
      // إضافة معلمات تحسين للرابط
      const urlObj = new URL(url);
      urlObj.searchParams.delete('t'); // إزالة أي طوابع زمنية موجودة
      
      // إضافة معلمات تحسين
      urlObj.searchParams.set('format', 'webp');
      urlObj.searchParams.set('quality', '85');
      urlObj.searchParams.set('t', Date.now().toString());
      
      const optimizedUrl = urlObj.toString();
      
      setImageUrl(optimizedUrl);
      setPreviewUrl(optimizedUrl);
      setBannerUrl(optimizedUrl); // تحديث الرابط مباشرة هنا
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
    isProcessing,
    handleImageUpload,
    handleUrlChange,
    clearImage
  };
};
