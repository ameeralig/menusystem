import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * واجهة الاستجابة من R2
 */
interface R2UploadResult {
  success: boolean;
  url: string;
  key: string;
  size: number;
  contentType: string;
}

/**
 * الحصول على بيانات اعتماد Cloudflare R2
 */
function getR2Credentials() {
  const accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
  const secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  const accountId = Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID');
  const bucketName = Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME');
  
  if (!accessKeyId || !secretAccessKey || !accountId || !bucketName) {
    throw new Error('Missing Cloudflare R2 credentials');
  }
  
  return { accessKeyId, secretAccessKey, accountId, bucketName };
}

/**
 * توقيع طلب AWS S3 (متوافق مع R2)
 * R2 يستخدم AWS Signature Version 4
 */
async function signRequest(
  method: string,
  url: URL,
  headers: Record<string, string>,
  body: ArrayBuffer | null,
  credentials: ReturnType<typeof getR2Credentials>
): Promise<Record<string, string>> {
  const region = 'auto';
  const service = 's3';
  const date = new Date();
  
  // تنسيق التاريخ للتوقيع
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  
  // إضافة الهيدرات الأساسية
  const signedHeaders: Record<string, string> = {
    ...headers,
    'host': url.host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': body 
      ? await sha256Hex(new Uint8Array(body)) 
      : 'UNSIGNED-PAYLOAD',
  };
  
  // ترتيب الهيدرات
  const sortedHeaderKeys = Object.keys(signedHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map(key => `${key.toLowerCase()}:${signedHeaders[key].trim()}`)
    .join('\n') + '\n';
  const signedHeadersList = sortedHeaderKeys.map(k => k.toLowerCase()).join(';');
  
  // الطلب القانوني
  const canonicalRequest = [
    method,
    url.pathname,
    url.searchParams.toString(),
    canonicalHeaders,
    signedHeadersList,
    signedHeaders['x-amz-content-sha256'],
  ].join('\n');
  
  // سلسلة التوقيع
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(new TextEncoder().encode(canonicalRequest)),
  ].join('\n');
  
  // حساب مفتاح التوقيع
  const kDate = await hmacSha256(
    new TextEncoder().encode(`AWS4${credentials.secretAccessKey}`),
    dateStamp
  );
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  
  // التوقيع النهائي
  const signature = await hmacSha256Hex(kSigning, stringToSign);
  
  // هيدر Authorization
  const authHeader = `${algorithm} Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeadersList}, Signature=${signature}`;
  
  return {
    ...signedHeaders,
    'Authorization': authHeader,
  };
}

/**
 * SHA256 hash كـ hex
 */
async function sha256Hex(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * HMAC-SHA256
 */
async function hmacSha256(key: Uint8Array | ArrayBuffer, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
  return new Uint8Array(signature);
}

/**
 * HMAC-SHA256 كـ hex
 */
async function hmacSha256Hex(key: Uint8Array, data: string): Promise<string> {
  const result = await hmacSha256(key, data);
  return Array.from(result)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * توليد مسار فريد للملف
 */
function generateUniqueKey(userId: string, folder: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
  
  return `${folder}/${userId}/${timestamp}-${random}-${cleanFilename}`;
}

/**
 * الحصول على Content-Type من اسم الملف
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'pdf': 'application/pdf',
  };
  return types[ext || ''] || 'application/octet-stream';
}

serve(async (req) => {
  // التعامل مع طلبات CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('[R2-Upload] بدء معالجة الطلب');
    
    // الحصول على بيانات الاعتماد
    const credentials = getR2Credentials();
    console.log('[R2-Upload] تم الحصول على بيانات الاعتماد');
    
    // تحليل البيانات
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string || 'anonymous';
    const folder = formData.get('folder') as string || 'uploads';
    
    if (!file) {
      console.error('[R2-Upload] لم يتم تقديم ملف');
      return new Response(
        JSON.stringify({ success: false, error: 'لم يتم تقديم ملف' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[R2-Upload] معالجة الملف: ${file.name}, الحجم: ${file.size}`);
    
    // توليد مسار فريد
    const key = generateUniqueKey(userId, folder, file.name);
    const contentType = getContentType(file.name);
    
    // R2 endpoint
    const endpoint = `https://${credentials.accountId}.r2.cloudflarestorage.com`;
    const url = new URL(`/${credentials.bucketName}/${key}`, endpoint);
    
    console.log(`[R2-Upload] رفع إلى: ${url.pathname}`);
    
    // قراءة محتوى الملف
    const fileBuffer = await file.arrayBuffer();
    
    // توقيع الطلب
    const headers = await signRequest(
      'PUT',
      url,
      { 'Content-Type': contentType },
      fileBuffer,
      credentials
    );
    
    // إرسال الطلب إلى R2
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers,
      body: fileBuffer,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[R2-Upload] فشل الرفع: ${response.status} - ${errorText}`);
      throw new Error(`فشل رفع الملف إلى R2: ${response.status}`);
    }
    
    console.log('[R2-Upload] تم الرفع بنجاح');
    
    // بناء الرابط العام باستخدام R2.dev Public Development URL
    // الرابط العام: https://pub-f762a7c5308344b585c3cfbe0057fae2.r2.dev/
    const publicUrl = `https://pub-f762a7c5308344b585c3cfbe0057fae2.r2.dev/${key}`;
    
    const result: R2UploadResult = {
      success: true,
      url: publicUrl,
      key,
      size: file.size,
      contentType,
    };
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[R2-Upload] خطأ:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'خطأ غير معروف' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
