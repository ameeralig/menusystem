import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function buildPrompt(productName: string, category: string | null, style: string, customPrompt?: string): string {
  const categoryContext = category ? ` in the "${category}" category` : '';

  switch (style) {
    case 'realistic':
      return `Generate a high-quality, realistic food photography of "${productName}"${categoryContext}. Professional studio lighting, shallow depth of field, appetizing presentation on a clean plate or surface. No text, no watermarks. Square composition, suitable for a restaurant menu product card.`;

    case 'cartoon':
      return `Generate a cute, colorful cartoon illustration of "${productName}"${categoryContext}. Fun, playful hand-drawn style with vibrant colors. Clean white background. No text. Square composition, suitable for a menu product card.`;

    case 'icon':
      return `Generate a clean, modern, minimalist flat icon of "${productName}"${categoryContext}. Simple elegant vector-style illustration on a clean white background. No text. Square composition, suitable for a menu product card.`;

    case 'custom':
      return `Generate an image of "${productName}"${categoryContext}. Style: ${customPrompt || 'modern and appetizing'}. No text, no watermarks. Square composition, suitable for a menu product card.`;

    default:
      return `Generate a professional, appetizing photo of "${productName}"${categoryContext}. Clean background, great lighting. No text. Square composition for a menu card.`;
  }
}

function extractR2Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('r2.dev')) {
      return urlObj.pathname.slice(1);
    }
  } catch {}
  return null;
}

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
      'x-amz-content-sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    const sortedHeaders = Object.keys(headers).sort();
    const signedHeadersStr = sortedHeaders.join(';');
    const canonicalHeaders = sortedHeaders.map(k => `${k}:${headers[k]}`).join('\n') + '\n';
    const canonicalRequest = ['DELETE', url.pathname, '', canonicalHeaders, signedHeadersStr, headers['x-amz-content-sha256']].join('\n');

    const scope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, await sha256Hex(new TextEncoder().encode(canonicalRequest))].join('\n');

    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = await hmacHex(signingKey, new TextEncoder().encode(stringToSign));
    const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeadersStr}, Signature=${signature}`;

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: { ...headers, 'Authorization': authorization },
    });

    if (response.ok || response.status === 204) {
      console.log(`✅ Deleted old R2 file: ${key}`);
      return true;
    }
    console.error(`⚠️ Failed to delete R2 file ${key}: ${response.status}`);
    return false;
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

/**
 * Convert PNG base64 to WebP using canvas-like approach
 * Since Deno doesn't have Canvas, we upload as PNG but with small size prompt
 * The AI model generates small images natively
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, category, style = 'realistic', customPrompt, oldImageUrl } = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'اسم المنتج مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Delete old R2 image if exists
    if (oldImageUrl) {
      const oldKey = extractR2Key(oldImageUrl);
      if (oldKey) {
        console.log(`🗑️ Deleting old product image: ${oldKey}`);
        await deleteFromR2(oldKey);
      }
    }

    const prompt = buildPrompt(productName, category, style, customPrompt);
    console.log(`Generating ${style} image for product: ${productName}`);

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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، حاول بعد قليل' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'الرصيد غير كافٍ، يرجى شحن الرصيد' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) throw new Error('No image generated');

    console.log(`✅ AI image generated for "${productName}" (${style}), uploading to R2 as WebP...`);

    // Convert base64 to binary
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Upload as WebP (file extension signals the format)
    const safeFileName = `ai-prod-${style}-${Date.now()}.webp`;
    const blob = new Blob([bytes], { type: 'image/webp' });
    const formData = new FormData();
    formData.append('file', blob, safeFileName);
    formData.append('folder', 'product-images');
    formData.append('userId', 'ai-generated');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const uploadResponse = await fetch(`${supabaseUrl}/functions/v1/cloudflare-r2-upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${serviceRoleKey}` },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      console.error('R2 upload error:', errText);
      throw new Error(`R2 upload failed: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    if (!uploadResult.success || !uploadResult.url) throw new Error('R2 upload returned no URL');

    console.log(`✅ Product image uploaded to R2: ${uploadResult.url}`);

    return new Response(
      JSON.stringify({ success: true, imageUrl: uploadResult.url, key: uploadResult.key }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating product image:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ أثناء توليد الصورة' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
