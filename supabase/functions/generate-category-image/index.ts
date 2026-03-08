import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function buildPrompt(categoryName: string, storeName: string | null, style: string, customPrompt?: string): string {
  const storeContext = storeName ? ` for a store named "${storeName}"` : '';

  switch (style) {
    case 'realistic':
      return `Generate a high-quality, realistic photograph for a restaurant/cafe menu category called "${categoryName}"${storeContext}. The image should be a professional food photography style shot with beautiful lighting, shallow depth of field, and appetizing presentation. No text in the image. Clean composition suitable for a menu category header.`;

    case 'cartoon':
      return `Generate a colorful, fun cartoon illustration for a restaurant/cafe menu category called "${categoryName}"${storeContext}. The image should be a playful, hand-drawn cartoon style with vibrant colors, cute characters or food items, and a cheerful mood. No text in the image. Clean white background. Suitable for a food/drink menu category header.`;

    case 'custom':
      return `Generate an image for a restaurant/cafe menu category called "${categoryName}"${storeContext}. Style instructions: ${customPrompt || 'modern and elegant'}. No text in the image. Clean composition suitable for a menu category header.`;

    case 'icon':
    default:
      return `Generate a clean, modern, minimalist icon or illustration for a restaurant/cafe menu category called "${categoryName}"${storeContext}. The image should be a simple, elegant icon-style illustration on a clean white background. No text in the image. Suitable for a food/drink menu category header. Professional, appetizing, and visually appealing.`;
  }
}

/**
 * Extract R2 key from a public R2 URL to delete the old file
 */
function extractR2Key(url: string): string | null {
  try {
    // R2 public URL pattern: https://pub-xxx.r2.dev/folder/filename.ext
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('r2.dev')) {
      // Remove leading slash
      return urlObj.pathname.slice(1);
    }
  } catch {}
  return null;
}

/**
 * Delete an old file from R2 using S3-compatible API
 */
async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')!;
    const secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')!;
    const accountId = Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID')!;
    const bucketName = Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME')!;

    const url = new URL(`https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`);
    const region = 'auto';
    const service = 's3';
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const headers: Record<string, string> = {
      'host': url.host,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // empty body hash
    };

    // Create canonical request
    const sortedHeaders = Object.keys(headers).sort();
    const signedHeadersStr = sortedHeaders.join(';');
    const canonicalHeaders = sortedHeaders.map(k => `${k}:${headers[k]}`).join('\n') + '\n';
    const canonicalRequest = [
      'DELETE',
      url.pathname,
      '',
      canonicalHeaders,
      signedHeadersStr,
      headers['x-amz-content-sha256'],
    ].join('\n');

    const scope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      scope,
      await sha256Hex(new TextEncoder().encode(canonicalRequest)),
    ].join('\n');

    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = await hmacHex(signingKey, new TextEncoder().encode(stringToSign));

    const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeadersStr}, Signature=${signature}`;

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        ...headers,
        'Authorization': authorization,
      },
    });

    if (response.ok || response.status === 204) {
      console.log(`✅ Deleted old R2 file: ${key}`);
      return true;
    } else {
      console.error(`⚠️ Failed to delete R2 file ${key}: ${response.status}`);
      return false;
    }
  } catch (err) {
    console.error(`⚠️ Error deleting R2 file:`, err);
    return false;
  }
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(key: ArrayBuffer, data: Uint8Array): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSign(key: ArrayBuffer, data: Uint8Array): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, data);
}

async function getSignatureKey(secret: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  let key = await hmacSign(enc.encode('AWS4' + secret), enc.encode(dateStamp));
  key = await hmacSign(key, enc.encode(region));
  key = await hmacSign(key, enc.encode(service));
  key = await hmacSign(key, enc.encode('aws4_request'));
  return key;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryName, storeName, style = 'icon', customPrompt, oldImageUrl } = await req.json();

    if (!categoryName) {
      return new Response(
        JSON.stringify({ error: 'اسم التصنيف مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Delete old R2 image if exists
    if (oldImageUrl) {
      const oldKey = extractR2Key(oldImageUrl);
      if (oldKey) {
        console.log(`🗑️ Deleting old image: ${oldKey}`);
        await deleteFromR2(oldKey);
      }
    }

    const prompt = buildPrompt(categoryName, storeName, style, customPrompt);
    console.log(`Generating ${style} image for category: ${categoryName}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log(`✅ AI image generated for "${categoryName}" (${style}), uploading to R2...`);

    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const safeFileName = `ai-cat-${style}-${Date.now()}.png`;
    const blob = new Blob([bytes], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, safeFileName);
    formData.append('folder', 'category-images');
    formData.append('userId', 'ai-generated');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const uploadResponse = await fetch(`${supabaseUrl}/functions/v1/cloudflare-r2-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      console.error('R2 upload error:', errText);
      throw new Error(`R2 upload failed: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error('R2 upload returned no URL');
    }

    console.log(`✅ Uploaded to R2: ${uploadResult.url}`);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: uploadResult.url,
        key: uploadResult.key
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating category image:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ أثناء توليد الصورة' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
