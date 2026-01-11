import { supabase } from "@/lib/supabase";

/**
 * معلومات الصورة الأصلية والمحسنة
 */
export interface ImageInfo {
  size: number;
  format: string;
  sizeFormatted: string;
  width?: number;
  height?: number;
}

/**
 * نتيجة رفع Cloudinary
 */
export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  publicId: string;
  original: ImageInfo;
  optimized: ImageInfo;
  savings: {
    bytes: number;
    percentage: number;
    formatted: string;
  };
}

/**
 * خيارات الرفع
 */
export interface UploadOptions {
  convertToWebp: boolean;
  folder?: string;
}

/**
 * تنسيق حجم الملف للعرض
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * الحصول على تنسيق الملف من نوعه
 */
export const getFileFormat = (file: File): string => {
  const mimeType = file.type;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType.includes('/')) {
    return mimeType.split('/')[1].toUpperCase();
  }
  
  return extension.toUpperCase() || 'UNKNOWN';
};

/**
 * الحصول على معلومات الصورة الأصلية
 */
export const getOriginalImageInfo = (file: File): ImageInfo => {
  return {
    size: file.size,
    format: getFileFormat(file),
    sizeFormatted: formatBytes(file.size)
  };
};

/**
 * رفع صورة إلى Cloudinary مع خيار التحويل إلى WebP
 */
export const uploadToCloudinary = async (
  file: File,
  options: UploadOptions = { convertToWebp: false, folder: 'uploads' }
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('convertToWebp', options.convertToWebp.toString());
  formData.append('folder', options.folder || 'uploads');

  const { data, error } = await supabase.functions.invoke('cloudinary-optimize', {
    body: formData
  });

  if (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'فشل رفع الصورة إلى Cloudinary');
  }

  if (!data.success) {
    throw new Error(data.error || 'فشل رفع الصورة');
  }

  return data as CloudinaryUploadResult;
};

/**
 * التحقق مما إذا كان الملف صورة
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * الحصول على أبعاد الصورة
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('فشل تحميل الصورة'));
    };
    
    img.src = url;
  });
};
