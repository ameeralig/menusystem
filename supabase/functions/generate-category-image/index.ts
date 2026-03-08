import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    console.log(`✅ AI image generated for "${categoryName}", uploading to R2...`);

    // Convert base64 to binary
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Create a safe filename (no Arabic characters)
    const safeFileName = `ai-cat-${Date.now()}.png`;

    // Build FormData to call the existing cloudflare-r2-upload function
    const blob = new Blob([bytes], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, safeFileName);
    formData.append('folder', 'category-images');
    formData.append('userId', 'ai-generated');

    // Call the existing R2 upload function
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
