import { useState } from "react";
import { toast } from "sonner";
import { uploadToCloudflareR2 } from "@/utils/cloudflareR2Upload";

export interface SmartUploadResult {
  success: boolean;
  url: string;
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
 * Hook موحد للرفع إلى Cloudflare R2
 */
export const useSmartUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const upload = async (
    file: File,
    options: SmartUploadOptions
  ): Promise<SmartUploadResult | null> => {
    const { bucket, folder = '', userId, showToast = true } = options;

    setIsUploading(true);
    setUploadProgress("جاري التحضير...");

    try {
      setUploadProgress("جاري الرفع إلى Cloudflare R2...");
      
      const result = await uploadToCloudflareR2(file, {
        folder: `${bucket}/${folder}`.replace(/\/+/g, '/').replace(/\/$/, ''),
        userId,
      });

      if (!result.success || !result.url) {
        throw new Error("فشل الرفع إلى Cloudflare R2");
      }

      if (showToast) {
        toast.success("تم رفع الصورة بنجاح", {
          description: `الحجم: ${formatBytes(file.size)}`
        });
      }

      return {
        success: true,
        url: result.url,
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default useSmartUpload;
