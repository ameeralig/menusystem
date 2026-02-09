
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { deleteOldImageIfExists } from "@/utils/storageHelpers";
import { uploadToCloudflareR2 } from "@/utils/cloudflareR2Upload";
import { getOriginalImageInfo, type ImageInfo } from "@/utils/cloudinaryUpload";

interface UseBannerUploadProps {
  setBannerUrl: (url: string | null) => void;
  initialUrl?: string | null;
}

export interface BannerUploadResult {
  original: ImageInfo;
  optimized?: ImageInfo;
  savings?: {
    bytes: number;
    percentage: number;
    formatted: string;
  };
}

export const useBannerUpload = ({ setBannerUrl, initialUrl }: UseBannerUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUploadResult, setLastUploadResult] = useState<BannerUploadResult | null>(null);
  const { toast } = useToast();

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
      setIsUploading(true);
      setLastUploadResult(null);
      
      if (!file.type.startsWith('image/')) {
        setError("الرجاء اختيار ملف صورة صالح");
        return;
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setError("حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت");
        return;
      }

      const tempPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(tempPreviewUrl);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      if (initialUrl) {
        await deleteOldImageIfExists(initialUrl, 'banners');
      }

      const originalInfo = getOriginalImageInfo(file);

      // رفع إلى Cloudflare R2
      const r2Result = await uploadToCloudflareR2(file, {
        folder: 'banners',
        userId: user.id,
      });

      if (!r2Result.success || !r2Result.url) throw new Error("فشل رفع الصورة إلى R2");

      const finalUrl = r2Result.url;
      setLastUploadResult({ original: originalInfo });

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "يمكنك الآن حفظ التغييرات",
        duration: 3000,
      });

      URL.revokeObjectURL(tempPreviewUrl);
      
      setImageUrl(finalUrl);
      setPreviewUrl(finalUrl);
      setBannerUrl(finalUrl);

    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    if (!url) { clearImage(); return; }
    try {
      new URL(url);
      const timestamp = new Date().getTime();
      const baseUrl = url.split('?')[0];
      const updatedUrl = `${baseUrl}?t=${timestamp}`;
      setImageUrl(updatedUrl);
      setPreviewUrl(updatedUrl);
      setBannerUrl(updatedUrl);
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
    error, setError, imageUrl, previewUrl, isUploading,
    lastUploadResult, handleImageUpload, handleUrlChange, clearImage
  };
};
