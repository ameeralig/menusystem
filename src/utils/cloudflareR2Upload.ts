import { supabase } from "@/lib/supabase";

/**
 * نتيجة رفع R2
 */
export interface R2UploadResult {
  success: boolean;
  url: string;
  key: string;
  size: number;
  contentType: string;
}

/**
 * خيارات الرفع
 */
export interface R2UploadOptions {
  folder?: string;
  userId?: string;
}

/**
 * رفع ملف إلى Cloudflare R2
 */
export const uploadToCloudflareR2 = async (
  file: File,
  options: R2UploadOptions = {}
): Promise<R2UploadResult> => {
  const { folder = 'uploads', userId = 'anonymous' } = options;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('userId', userId);
  
  console.log(`[R2] رفع الملف: ${file.name} إلى المجلد: ${folder}`);
  
  const { data, error } = await supabase.functions.invoke('cloudflare-r2-upload', {
    body: formData,
  });
  
  if (error) {
    console.error('[R2] خطأ في الرفع:', error);
    throw new Error(error.message || 'فشل رفع الملف إلى Cloudflare R2');
  }
  
  if (!data.success) {
    throw new Error(data.error || 'فشل رفع الملف');
  }
  
  console.log('[R2] تم الرفع بنجاح:', data.url);
  
  return data as R2UploadResult;
};

/**
 * التحقق مما إذا كان الملف صورة
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

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
