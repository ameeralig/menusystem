
import { supabase } from "@/lib/supabase";

/**
 * حذف صورة من مستودع Supabase
 * @param bucket اسم المستودع
 * @param path المسار الكامل للملف
 * @returns نجاح أو فشل العملية
 */
export const deleteImage = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    console.log(`محاولة حذف صورة من ${bucket}: ${path}`);
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error("خطأ في حذف الصورة:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("خطأ في حذف الصورة:", error);
    return false;
  }
};

/**
 * إنشاء مسار فريد للملف مع هيكل تنظيمي حسب المستخدم
 * @param userId معرّف المستخدم
 * @param folder المجلد الفرعي (اختياري)
 * @param file الملف
 * @returns المسار الفريد للملف
 */
export const createUniqueFilePath = (userId: string, folder: string = '', file: File): string => {
  const fileExt = file.name.split('.').pop();
  // استبدال الأحرف الخاصة والمسافات بشرطة سفلية
  const sanitizedFolder = folder ? folder.replace(/\s+/g, '_').replace(/[^\w.-]/g, '_') : '';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  // إنشاء مسار منظم: معرف_المستخدم/المجلد_الفرعي/اسم_الملف
  if (sanitizedFolder) {
    return `${userId}/${sanitizedFolder}/${fileName}`;
  } else {
    return `${userId}/${fileName}`;
  }
};

/**
 * تحسين الصورة قبل الرفع لتقليل الحجم
 * @param file ملف الصورة الأصلي
 * @returns وعد بملف الصورة المحسن
 */
export const optimizeImage = async (file: File): Promise<File> => {
  // تحقق ما إذا كان الملف صورة
  if (!file.type.startsWith('image/')) {
    return file;
  }
  
  try {
    // إذا كانت الصورة كبيرة جدًا، قم بضغطها
    if (file.size > 1024 * 1024) { // أكبر من 1 ميجابايت
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // إنشاء وعد لتحميل الصورة
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(file);
      });
      
      // تحديد أبعاد الصورة المضغوطة (الحد الأقصى 1200 بكسل)
      const maxWidth = 1200;
      const maxHeight = 1200;
      let width = img.width;
      let height = img.height;
      
      // تقليص الأبعاد إذا تجاوزت الحد الأقصى
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height *= maxWidth / width;
          width = maxWidth;
        } else {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      // ضبط أبعاد Canvas
      canvas.width = width;
      canvas.height = height;
      
      // رسم الصورة على Canvas بالأبعاد الجديدة
      ctx?.drawImage(img, 0, 0, width, height);
      
      // تحويل Canvas إلى Blob بصيغة WebP إذا كانت مدعومة
      const supportWebP = !!HTMLCanvasElement.prototype.toBlob;
      const quality = 0.8; // جودة 80%
      
      if (supportWebP) {
        // محاولة استخدام صيغة WebP
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob(resolve, 'image/webp', quality)
        );
        
        if (blob) {
          // إنشاء ملف جديد بصيغة WebP
          const optimizedFile = new File(
            [blob], 
            file.name.replace(/\.[^.]+$/, '.webp'), 
            { type: 'image/webp' }
          );
          
          // إذا كان الملف المحسن أصغر، استخدمه
          return optimizedFile.size < file.size ? optimizedFile : file;
        }
      }
      
      // إذا لم يكن WebP مدعومًا، استخدم نفس صيغة الملف الأصلي
      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, file.type, quality)
      );
      
      if (blob) {
        const optimizedFile = new File([blob], file.name, { type: file.type });
        return optimizedFile.size < file.size ? optimizedFile : file;
      }
    }
    
    // إذا كانت الصورة صغيرة بالفعل أو فشلت عملية التحسين، أرجع الملف الأصلي
    return file;
  } catch (error) {
    console.error("خطأ أثناء تحسين الصورة:", error);
    return file; // إرجاع الملف الأصلي في حالة حدوث خطأ
  }
};

/**
 * رفع صورة إلى مستودع Supabase
 * @param bucket اسم المستودع (مثل 'product-images' أو 'category-images')
 * @param file ملف الصورة
 * @param userId معرف المستخدم
 * @param folder اسم المجلد الفرعي (اختياري)
 * @returns رابط الصورة العام
 */
export const uploadImage = async (
  bucket: string,
  file: File,
  userId: string,
  folder: string = ''
): Promise<string> => {
  try {
    console.log(`بدء رفع صورة إلى دلو ${bucket} للمستخدم ${userId}`);
    
    // تحسين الصورة قبل الرفع
    const optimizedFile = await optimizeImage(file);
    
    const filePath = createUniqueFilePath(userId, folder, optimizedFile);
    console.log(`مسار الملف: ${filePath}`);
    
    // التحقق من وجود الدلو
    try {
      const { data: bucketsList, error: bucketsError } = await supabase.storage.listBuckets();
      
      let bucketExists = false;
      
      if (!bucketsError && bucketsList) {
        bucketExists = bucketsList.some(b => b.name === bucket);
      }
      
      if (!bucketExists) {
        console.log(`إنشاء دلو جديد: ${bucket}`);
        const { error: createBucketError } = await supabase.storage.createBucket(bucket, {
          public: true
        });
        
        if (createBucketError) {
          console.error(`خطأ في إنشاء دلو ${bucket}:`, createBucketError);
        } else {
          console.log(`تم إنشاء دلو ${bucket} بنجاح`);
        }
      }
    } catch (bucketCheckError) {
      console.error("خطأ أثناء التحقق من وجود الدلو:", bucketCheckError);
    }
    
    // تعيين خيارات CORS وتحديث رؤوس التخزين المؤقت
    const options = {
      cacheControl: 'max-age=3600', // تخزين مؤقت لمدة ساعة واحدة
      upsert: true,
      contentType: optimizedFile.type
    };
    
    // ننتظر لحظة قبل الرفع لتجنب مشاكل التزامن
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, optimizedFile, options);

    if (uploadError) {
      console.error("خطأ في رفع الصورة:", uploadError);
      
      // محاولة إنشاء الدلو وإعادة المحاولة
      if (uploadError.message.includes("bucket") || uploadError.message.includes("not found")) {
        const { error: createBucketRetryError } = await supabase.storage.createBucket(bucket, {
          public: true
        });
        
        if (!createBucketRetryError) {
          // إعادة محاولة الرفع
          const { error: retryError, data: retryData } = await supabase.storage
            .from(bucket)
            .upload(filePath, optimizedFile, options);
            
          if (retryError) {
            throw retryError;
          }
        } else {
          throw createBucketRetryError;
        }
      } else {
        throw uploadError;
      }
    }

    // الحصول على الرابط العام
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    // إضافة طابع زمني للتأكد من عدم استخدام نسخة مخزنة مؤقتًا
    const timestamp = Date.now();
    const finalUrl = `${publicUrl}?t=${timestamp}&nocache=true`;
      
    console.log(`تم رفع الصورة بنجاح. الرابط العام: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    console.error("خطأ في رفع الصورة:", error);
    throw error;
  }
};

/**
 * تحويل URL الصورة (مثل blob) إلى كائن File
 * @param url رابط الصورة
 * @param filename اسم الملف
 * @returns كائن File
 */
export const urlToFile = async (url: string, filename: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

/**
 * إنشاء رابط مع طابع زمني لتجنب مشاكل التخزين المؤقت
 * @param url الرابط الأصلي
 * @returns رابط مع طابع زمني
 */
export const getUrlWithTimestamp = (url: string | null): string | null => {
  if (!url) return null;
  
  const timestamp = Date.now();
  const baseUrl = url.split('?')[0];
  
  // تحسين URL الصورة لاستخدام WebP إذا كان متاحًا
  if (baseUrl.includes('supabase.co') || baseUrl.includes('lovable-app')) {
    return `${baseUrl}?format=webp&quality=80&t=${timestamp}`;
  }
  
  return `${baseUrl}?t=${timestamp}`;
};

/**
 * تنسيق رابط الصورة واستخراج الرابط المباشر للصورة من مختلف المصادر
 * @param url رابط الصورة الأصلي
 * @param timestamp طابع زمني اختياري لتجاوز التخزين المؤقت
 * @returns رابط الصورة المنسق
 */
export const formatImageUrl = (url: string, timestamp?: number): string => {
  if (!url) return url;
  
  // تحسين روابط Imgur
  if (url.includes('imgur.com')) {
    // تحويل روابط ألبوم Imgur إلى روابط مباشرة
    if (url.includes('imgur.com/a/') || url.includes('imgur.com/gallery/')) {
      const albumId = url.split(/imgur\.com\/(?:a|gallery)\//).pop()?.split(/[?#]/)[0];
      if (albumId) {
        console.log(`تحويل رابط ألبوم Imgur ${albumId} إلى رابط مباشر`);
        return `https://i.imgur.com/${albumId}.jpg`;
      }
    }
    
    // تحويل روابط صور Imgur العادية إلى روابط مباشرة
    if (url.includes('imgur.com/') && !url.includes('i.imgur.com/')) {
      const imgId = url.split('imgur.com/').pop()?.split(/[?#]/)[0];
      if (imgId) {
        console.log(`تحويل رابط صورة Imgur ${imgId} إلى رابط مباشر`);
        return `https://i.imgur.com/${imgId}.jpg`;
      }
    }
  }
  
  // تحويل روابط Google Drive إلى روابط مباشرة
  if (url.includes('drive.google.com')) {
    // روابط مشاركة Google Drive المعتادة
    if (url.includes('file/d/')) {
      const fileId = url.split('file/d/')[1]?.split(/[/?#]/)[0];
      if (fileId) {
        console.log(`تحويل رابط Google Drive ${fileId} إلى رابط مباشر`);
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    
    // روابط العرض المباشر لملفات Google Drive
    if (url.includes('id=')) {
      const fileId = url.match(/id=([^&]+)/)?.[1];
      if (fileId) {
        console.log(`تحويل رابط Google Drive ${fileId} إلى رابط عرض مباشر`);
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
  }
  
  // تحويل روابط Dropbox إلى روابط مباشرة
  if (url.includes('dropbox.com')) {
    // التأكد من استخدام رابط مباشر للصور
    if (url.includes('?dl=0')) {
      console.log(`تحويل رابط Dropbox إلى رابط مباشر`);
      return url.replace('?dl=0', '?raw=1');
    } else if (!url.includes('?raw=1')) {
      return url + '?raw=1';
    }
  }

  // تحويل روابط OneDrive إلى روابط مباشرة
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    console.log(`تحويل رابط OneDrive إلى رابط مباشر`);
    // يتطلب معالجة خاصة من الخادم لاحقاً
    // نحاول استخدام embed بدلاً من عرض مباشر
    if (url.includes('1drv.ms')) {
      return `${url}/embed`;
    }
  }

  // تحويل روابط iCloud إلى روابط مباشرة (لا يمكن تحويلها بشكل مباشر عادة)
  if (url.includes('icloud.com')) {
    console.log(`تم اكتشاف رابط iCloud، سنستخدمه كما هو`);
    // في معظم الحالات، فإن روابط iCloud تحتاج إلى معالجة خاصة من طرف الخادم
  }

  // تحويل روابط قصيرة Twitter/X إلى روابط مباشرة
  if (url.includes('pbs.twimg.com') || url.includes('x.com') || url.includes('twitter.com')) {
    console.log(`تحويل رابط Twitter/X إلى الشكل المناسب`);
    // نستخدم الرابط كما هو لصور Twitter المباشرة
    if (url.includes('pbs.twimg.com')) {
      // تجريد الرابط من معلمات الاستعلام
      const baseTwitterUrl = url.split('?')[0];
      // إضافة معلمة format=jpg للتأكد من الحصول على الصور بتنسيق jpg
      return `${baseTwitterUrl}?format=jpg&name=large`;
    }
  }

  // تحويل روابط Flickr إلى روابط مباشرة
  if (url.includes('flickr.com')) {
    console.log(`تم اكتشاف رابط Flickr، قد تحتاج لرابط مباشر`);
    // الدعم المباشر لـ Flickr يتطلب معالجة API
  }
  
  // تحليل الرابط للتأكد من عدم تكرار المعلمات
  const baseUrl = url.split('?')[0];
  const uniqueTimestamp = timestamp || Date.now();
  
  // التحقق من نوع الرابط (إذا كان من سوبابيس أو من مصدر آخر)
  const isSupabaseUrl = baseUrl.includes('supabase.co') || 
                        baseUrl.includes('supabase.in') || 
                        baseUrl.includes('zqlckixwpyrwdwrsuhsg') ||
                        baseUrl.includes('lovable-app');
  
  // تحسين URL الصورة مع معلمات مختلفة حسب المصدر
  return isSupabaseUrl
    ? `${baseUrl}?format=webp&quality=80&t=${uniqueTimestamp}&nocache=true`
    : `${baseUrl}?t=${uniqueTimestamp}&nocache=true`;
};

/**
 * فحص ما إذا كان الرابط صالح للصورة
 * @param url رابط الصورة
 * @returns وعد يحل إلى صحة الرابط
 */
export const checkImageUrl = async (url: string | null): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // تنظيف الرابط من أي معلمات استعلام
    const cleanUrl = url.split('?')[0];
    
    // محاولة تحويل الرابط إلى رابط مباشر إذا لم يكن كذلك
    const processedUrl = formatImageUrl(url);
    
    // استخدام Image API للتحقق من صلاحية الصورة
    return new Promise((resolve) => {
      const img = document.createElement('img');
      
      img.onload = () => {
        console.log(`✅ تم التحقق من صلاحية الصورة: ${processedUrl}`);
        resolve(true);
      };
      
      img.onerror = () => {
        console.error(`❌ الصورة غير صالحة: ${processedUrl}`);
        
        // محاولة مع تنسيقات مختلفة إذا فشلت المحاولة الأولى
        const extensionsToTry = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        
        let attemptsLeft = extensionsToTry.length;
        let foundValid = false;
        
        extensionsToTry.forEach(ext => {
          if (foundValid) return;
          
          const altImg = document.createElement('img');
          const altUrl = `${cleanUrl.split('.').slice(0, -1).join('.')}.${ext}?t=${Date.now()}`;
          
          altImg.onload = () => {
            if (!foundValid) {
              console.log(`✅ تم العثور على صيغة بديلة صالحة: ${altUrl}`);
              foundValid = true;
              resolve(true);
            }
          };
          
          altImg.onerror = () => {
            attemptsLeft--;
            if (attemptsLeft === 0 && !foundValid) {
              console.error(`❌ جميع المحاولات البديلة فشلت للصورة: ${url}`);
              resolve(false);
            }
          };
          
          // استخدام الرابط البديل
          altImg.src = altUrl;
        });
      };
      
      // استخدام الرابط المنسق وإضافة معلمة عشوائية
      img.src = processedUrl + `&random=${Math.random()}`;
        
      // تعيين مهلة زمنية للتحميل
      setTimeout(() => {
        if (!img.complete) {
          console.error(`⏱️ انتهت مهلة تحميل الصورة: ${processedUrl}`);
          resolve(false);
        }
      }, 5000); // 5 ثوان كمهلة زمنية
    });
  } catch (error) {
    console.error("خطأ في فحص رابط الصورة:", error);
    return false;
  }
};

/**
 * استخراج مسار الملف من رابط Supabase العام
 * @param url الرابط العام للصورة من Supabase
 * @param bucket اسم المستودع للتحقق
 * @returns مسار الملف (بدون اسم المستودع)
 */
export const extractFilePathFromUrl = (url: string, bucket: string): string | null => {
  try {
    // البحث عن نمط URL Supabase
    const regex = new RegExp(`/storage/v1/object/public/${bucket}/(.+?)(?:\\?|$)`);
    const match = url.match(regex);
    
    if (match && match[1]) {
      console.log(`تم استخراج مسار الملف: ${match[1]} من ${url}`);
      return decodeURIComponent(match[1]);
    }
    
    console.log(`لم يتم العثور على مسار الملف في الرابط: ${url}`);
    return null;
  } catch (e) {
    console.error("خطأ في استخراج مسار الملف:", e);
    return null;
  }
};
