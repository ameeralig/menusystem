import { useState } from "react";
import { toast } from "sonner";
import { uploadImage, optimizeImage, deleteOldImageIfExists } from "@/utils/storageHelpers";
import { uploadToCloudflareR2 } from "@/utils/cloudflareR2Upload";
import { UploadDestination } from "@/components/shared/UploadDestinationSelector";

export interface SmartUploadResult {
  success: boolean;
  url: string;
  destination: UploadDestination;
  fileSize: number;
}

export interface SmartUploadOptions {
  bucket: string;
  folder?: string;
  userId: string;
  oldImageUrl?: string | null;
  showToast?: boolean;
}

/**
 * Hook موحد للرفع الذكي
 * يدعم Supabase Storage و Cloudflare R2
 */
export const useSmartUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const upload = async (
    file: File,
    destination: UploadDestination,
    options: SmartUploadOptions
  ): Promise<SmartUploadResult | null> => {
    const { bucket, folder = '', userId, oldImageUrl, showToast = true } = options;

    setIsUploading(true);
    setUploadProgress("جاري التحضير...");

    try {
      // حذف الصورة القديمة إذا وجدت
      if (oldImageUrl) {
        await deleteOldImageIfExists(oldImageUrl, bucket);
      }

      let url: string;

      if (destination === 'cloudflare') {
        // الرفع إلى Cloudflare R2
        setUploadProgress("جاري الرفع إلى Cloudflare R2...");
        
        const result = await uploadToCloudflareR2(file, {
          folder: `${bucket}/${folder}`.replace(/\/+/g, '/').replace(/\/$/, ''),
          userId,
        });

        if (!result.success || !result.url) {
          throw new Error("فشل الرفع إلى Cloudflare R2");
        }

        url = result.url;
        
        if (showToast) {
          toast.success("تم الرفع إلى Cloudflare R2", {
            description: `الحجم: ${formatBytes(file.size)}`
          });
        }
      } else {
        // الرفع إلى Supabase Storage
        setUploadProgress("جاري تحسين الصورة...");
        const optimizedFile = await optimizeImage(file);
        
        setUploadProgress("جاري الرفع إلى Supabase...");
        url = await uploadImage(bucket, optimizedFile, userId, folder);

        if (!url) {
          throw new Error("فشل الحصول على رابط الصورة");
        }

        if (showToast) {
          toast.success("تم الرفع إلى Supabase", {
            description: `الحجم: ${formatBytes(file.size)}`
          });
        }
      }

      return {
        success: true,
        url,
        destination,
        fileSize: file.size,
      };

    } catch (error: any) {
      console.error("[SmartUpload] خطأ:", error);
      if (showToast) {
        toast.error("فشل في رفع الصورة", {
          description: error.message || "خطأ غير معروف"
        });
      }
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return {
    upload,
    isUploading,
    uploadProgress,
  };
};

// دالة مساعدة لتنسيق حجم الملف
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default useSmartUpload;
