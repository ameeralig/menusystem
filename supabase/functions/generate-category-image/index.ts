import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryName, storeName } = await req.json();

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

    const prompt = `Generate a clean, modern, minimalist icon or illustration for a restaurant/cafe menu category called "${categoryName}"${storeName ? ` for a store named "${storeName}"` : ''}. The image should be a simple, elegant icon-style illustration on a clean white background. No text in the image. Suitable for a food/drink menu category header. Professional, appetizing, and visually appealing.`;

    console.log(`Generating image for category: ${categoryName}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
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

    // Now upload the base64 image to R2
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const R2_ACCESS_KEY_ID = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')!;
    const R2_SECRET_ACCESS_KEY = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')!;
    const R2_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID')!;
    const R2_BUCKET_NAME = Deno.env.get('CLOUDFLARE_R2_BUCKET_NAME')!;

    const key = `category-images/ai-generated/${Date.now()}-${categoryName.replace(/\s+/g, '-')}.png`;
    const r2Url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;

    // Sign and upload to R2 using simple PUT
    const date = new Date();
    const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dateShort = dateStr.substring(0, 8);
    const region = 'auto';
    const service = 's3';

    const encoder = new TextEncoder();

    async function hmacSHA256(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
      const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
    }

    async function sha256(data: Uint8Array): Promise<string> {
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const payloadHash = await sha256(binaryData);
    const url = new URL(r2Url);

    const canonicalHeaders = `content-type:image/png\nhost:${url.hostname}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${dateStr}\n`;
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `PUT\n/${key}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const canonicalRequestHash = await sha256(encoder.encode(canonicalRequest));

    const scope = `${dateShort}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${dateStr}\n${scope}\n${canonicalRequestHash}`;

    let signingKey = await hmacSHA256(encoder.encode(`AWS4${R2_SECRET_ACCESS_KEY}`), dateShort);
    signingKey = await hmacSHA256(signingKey, region);
    signingKey = await hmacSHA256(signingKey, service);
    signingKey = await hmacSHA256(signingKey, 'aws4_request');
    const signature = Array.from(new Uint8Array(await hmacSHA256(signingKey, stringToSign)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const r2Response = await fetch(r2Url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': dateStr,
        'Authorization': authorization,
      },
      body: binaryData,
    });

    if (!r2Response.ok) {
      const errText = await r2Response.text();
      console.error('R2 upload error:', errText);
      throw new Error(`R2 upload failed: ${r2Response.status}`);
    }

    // Construct public URL
    const publicUrl = `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;
    // Try custom domain pattern used in the project
    const finalUrl = `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

    console.log(`✅ Generated and uploaded image for "${categoryName}": ${finalUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: finalUrl,
        key 
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
