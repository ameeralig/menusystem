import { supabase } from "@/lib/supabase";
import { uploadToCloudflareR2, R2UploadResult } from "./cloudflareR2Upload";
import { uploadImage, deleteOldImageIfExists } from "./storageHelpers";

/**
 * نتيجة الرفع المزدوج
 */
export interface DualUploadResult {
  success: boolean;
  supabaseUrl: string | null;
  r2Url: string | null;
  r2Key: string | null;
  fileSize: number;
  // الرابط الأساسي (سيكون R2 بعد الانتقال الكامل)
  primaryUrl: string;
  uploadedTo: ('supabase' | 'r2')[];
}

/**
 * خيارات الرفع المزدوج
 */
export interface DualUploadOptions {
  bucket: string;
  folder?: string;
  userId: string;
  // إذا كان true، يرفع إلى R2 فقط (بعد الانتقال)
  r2Only?: boolean;
  // إذا كان true، يرفع إلى Supabase فقط (الوضع الحالي)
  supabaseOnly?: boolean;
  // صورة قديمة للحذف
  oldImageUrl?: string | null;
}

/**
 * رفع ملف إلى Supabase و Cloudflare R2 معاً
 * هذا للمرحلة الانتقالية قبل الانتقال الكامل لـ R2
 */
export const dualUpload = async (
  file: File,
  options: DualUploadOptions
): Promise<DualUploadResult> => {
  const { 
    bucket, 
    folder = '', 
    userId, 
    r2Only = false, 
    supabaseOnly = false,
    oldImageUrl 
  } = options;
  
  console.log(`[DualUpload] بدء الرفع - المجلد: ${folder}, الـ bucket: ${bucket}`);
  
  const result: DualUploadResult = {
    success: false,
    supabaseUrl: null,
    r2Url: null,
    r2Key: null,
    fileSize: file.size,
    primaryUrl: '',
    uploadedTo: [],
  };
  
  // حذف الصورة القديمة إذا وجدت
  if (oldImageUrl) {
    await deleteOldImageIfExists(oldImageUrl, bucket);
  }
  
  const uploadPromises: Promise<void>[] = [];
  
  // الرفع إلى Supabase
  if (!r2Only) {
    uploadPromises.push(
      (async () => {
        try {
          console.log('[DualUpload] رفع إلى Supabase...');
          const url = await uploadImage(bucket, file, userId, folder);
          result.supabaseUrl = url;
          result.uploadedTo.push('supabase');
          console.log('[DualUpload] تم الرفع إلى Supabase:', url);
        } catch (error) {
          console.error('[DualUpload] فشل الرفع إلى Supabase:', error);
          // لا نرمي خطأ، نستمر مع R2
        }
      })()
    );
  }
  
  // الرفع إلى R2
  if (!supabaseOnly) {
    uploadPromises.push(
      (async () => {
        try {
          console.log('[DualUpload] رفع إلى Cloudflare R2...');
          const r2Result = await uploadToCloudflareR2(file, {
            folder: `${bucket}/${folder}`.replace(/\/+/g, '/'),
            userId,
          });
          result.r2Url = r2Result.url;
          result.r2Key = r2Result.key;
          result.uploadedTo.push('r2');
          console.log('[DualUpload] تم الرفع إلى R2:', r2Result.url);
        } catch (error) {
          console.error('[DualUpload] فشل الرفع إلى R2:', error);
          // لا نرمي خطأ، نستمر مع Supabase
        }
      })()
    );
  }
  
  // انتظار جميع عمليات الرفع
  await Promise.all(uploadPromises);
  
  // تحديد نجاح العملية
  result.success = result.uploadedTo.length > 0;
  
  // تحديد الرابط الأساسي
  // حالياً: نستخدم Supabase كأساسي، لاحقاً: R2
  if (r2Only && result.r2Url) {
    result.primaryUrl = result.r2Url;
  } else if (supabaseOnly && result.supabaseUrl) {
    result.primaryUrl = result.supabaseUrl;
  } else {
    // المرحلة الانتقالية: Supabase أولاً، R2 كاحتياطي
    result.primaryUrl = result.supabaseUrl || result.r2Url || '';
  }
  
  console.log(`[DualUpload] النتيجة: رُفع إلى ${result.uploadedTo.join(' و ')}`);
  
  return result;
};

/**
 * التحقق من حالة R2 (هل الإعدادات موجودة)
 */
export const checkR2Status = async (): Promise<boolean> => {
  try {
    // نحاول رفع ملف اختباري صغير
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    const result = await uploadToCloudflareR2(testFile, {
      folder: 'test',
      userId: 'system-check',
    });
    
    return result.success;
  } catch {
    return false;
  }
};
