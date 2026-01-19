import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// دالة الحصول على بيانات R2
const getR2Credentials = () => {
  const accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
  const secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  const accountId = Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID');
  const bucketName = Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME');
  
  if (!accessKeyId || !secretAccessKey || !accountId || !bucketName) {
    throw new Error('Missing R2 credentials');
  }
  
  return { accessKeyId, secretAccessKey, accountId, bucketName };
};

// توقيع طلب AWS S3 v4
async function signRequest(
  method: string,
  url: URL,
  headers: Headers,
  body: ArrayBuffer | null,
  credentials: { accessKeyId: string; secretAccessKey: string; accountId: string }
): Promise<Headers> {
  const region = 'auto';
  const service = 's3';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  headers.set('x-amz-date', amzDate);
  headers.set('host', url.hostname);

  const bodyHash = body 
    ? await sha256Hex(body) 
    : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  headers.set('x-amz-content-sha256', bodyHash);

  const signedHeaders = [...headers.keys()].sort().join(';');
  const canonicalHeaders = [...headers.keys()]
    .sort()
    .map(k => `${k.toLowerCase()}:${headers.get(k)?.trim()}\n`)
    .join('');

  const canonicalRequest = [
    method,
    url.pathname,
    url.search.slice(1),
    canonicalHeaders,
    signedHeaders,
    bodyHash
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(new TextEncoder().encode(canonicalRequest))
  ].join('\n');

  const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + credentials.secretAccessKey), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  const signature = await hmacSha256Hex(kSigning, stringToSign);

  const authHeader = `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  headers.set('Authorization', authHeader);

  return headers;
}

async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function hmacSha256Hex(key: ArrayBuffer | Uint8Array, data: string): Promise<string> {
  const sig = await hmacSha256(key, data);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// رفع ملف إلى R2
async function uploadToR2(
  fileBuffer: ArrayBuffer,
  key: string,
  contentType: string,
  credentials: ReturnType<typeof getR2Credentials>
): Promise<string> {
  const endpoint = `https://${credentials.accountId}.r2.cloudflarestorage.com/${credentials.bucketName}/${key}`;
  const url = new URL(endpoint);
  
  const headers = new Headers({
    'Content-Type': contentType,
    'Content-Length': fileBuffer.byteLength.toString(),
  });

  const signedHeaders = await signRequest('PUT', url, headers, fileBuffer, credentials);
  
  const response = await fetch(url.toString(), {
    method: 'PUT',
    headers: signedHeaders,
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
  }

  return `https://pub-f762a7c5308344b585c3cfbe0057fae2.r2.dev/${key}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const credentials = getR2Credentials();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // جلب جميع الصور من Supabase
    const { data: images, error: fetchError } = await supabase
      .from('shared_images')
      .select('*')
      .not('image_url', 'ilike', '%r2.dev%'); // فقط الصور غير المنقولة

    if (fetchError) throw fetchError;

    console.log(`[Migration] Found ${images?.length || 0} images to migrate`);

    const results = {
      total: images?.length || 0,
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const image of images || []) {
      try {
        console.log(`[Migration] Processing: ${image.name}`);
        
        // تحميل الصورة من URL الحالي
        const response = await fetch(image.image_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const fileBuffer = await response.arrayBuffer();
        
        // إنشاء مفتاح فريد
        const extension = contentType.split('/')[1] || 'jpg';
        const timestamp = Date.now();
        const key = `shared-images/${timestamp}-${image.id}.${extension}`;
        
        // رفع إلى R2
        const r2Url = await uploadToR2(fileBuffer, key, contentType, credentials);
        
        // تحديث URL في قاعدة البيانات
        const { error: updateError } = await supabase
          .from('shared_images')
          .update({ image_url: r2Url })
          .eq('id', image.id);
        
        if (updateError) throw updateError;
        
        console.log(`[Migration] Successfully migrated: ${image.name} -> ${r2Url}`);
        results.migrated++;
        
      } catch (err: any) {
        console.error(`[Migration] Failed to migrate ${image.name}:`, err.message);
        results.failed++;
        results.errors.push(`${image.name}: ${err.message}`);
      }
    }

    console.log(`[Migration] Complete: ${results.migrated}/${results.total} migrated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration complete: ${results.migrated}/${results.total} images migrated`,
        results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('[Migration] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
