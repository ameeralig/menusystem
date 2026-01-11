import { useState, useCallback } from 'react';
import { uploadImage, optimizeImage, deleteOldImageIfExists } from '@/utils/storageHelpers';
import { uploadToCloudinary, getOriginalImageInfo, type CloudinaryUploadResult, type ImageInfo } from '@/utils/cloudinaryUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UploadMode = 'normal' | 'cloudinary';

export interface UploadResult {
  url: string;
  original: ImageInfo;
  optimized?: ImageInfo;
  savings?: {
    bytes: number;
    percentage: number;
    formatted: string;
  };
  isCloudinary: boolean;
}

interface UseOptimizedUploadOptions {
  bucket?: string;
  folder?: string;
  deleteOldImage?: boolean;
  oldImageUrl?: string | null;
}

export const useOptimizedUpload = (options: UseOptimizedUploadOptions = {}) => {
  const {
    bucket = 'product-images',
    folder = '',
    deleteOldImage = false,
    oldImageUrl = null
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);

  /**
   * رفع صورة مع خيار التحسين عبر Cloudinary
   */
  const uploadFile = useCallback(async (
    file: File,
    mode: UploadMode = 'normal'
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setUploadProgress('جاري التحضير...');
    setLastResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        return null;
      }

      // حذف الصورة القديمة إذا كان مطلوباً
      if (deleteOldImage && oldImageUrl) {
        setUploadProgress('جاري حذف الصورة القديمة...');
        await deleteOldImageIfExists(oldImageUrl, bucket);
      }

      const originalInfo = getOriginalImageInfo(file);

      if (mode === 'cloudinary') {
        // رفع محسّن عبر Cloudinary
        setUploadProgress('جاري التحسين عبر Cloudinary...');
        
        const cloudinaryResult = await uploadToCloudinary(file, {
          convertToWebp: true,
          folder: `${user.id}/${folder || 'uploads'}`
        });

        const result: UploadResult = {
          url: cloudinaryResult.url,
          original: cloudinaryResult.original,
          optimized: cloudinaryResult.optimized,
          savings: cloudinaryResult.savings,
          isCloudinary: true
        };

        setLastResult(result);
        
        toast.success(
          `تم الرفع بنجاح! تم توفير ${cloudinaryResult.savings.formatted} (${cloudinaryResult.savings.percentage}%)`
        );

        return result;
      } else {
        // رفع عادي إلى Supabase
        setUploadProgress('جاري تحسين الصورة...');
        const optimizedFile = await optimizeImage(file);
        
        setUploadProgress('جاري الرفع...');
        const url = await uploadImage(bucket, optimizedFile, user.id, folder);

        const result: UploadResult = {
          url,
          original: originalInfo,
          optimized: {
            size: optimizedFile.size,
            format: optimizedFile.type.split('/')[1]?.toUpperCase() || 'UNKNOWN',
            sizeFormatted: formatBytes(optimizedFile.size)
          },
          savings: {
            bytes: file.size - optimizedFile.size,
            percentage: Math.round(((file.size - optimizedFile.size) / file.size) * 100),
            formatted: formatBytes(file.size - optimizedFile.size)
          },
          isCloudinary: false
        };

        setLastResult(result);
        toast.success('تم رفع الصورة بنجاح');

        return result;
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'فشل في رفع الصورة');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [bucket, folder, deleteOldImage, oldImageUrl]);

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    lastResult
  };
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
