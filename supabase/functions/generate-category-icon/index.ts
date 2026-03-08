import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryName, userId, iconStyle } = await req.json();

    if (!categoryName || !userId) {
      return new Response(
        JSON.stringify({ error: "categoryName and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // بناء وصف النمط حسب الاختيار
    const stylePrompts: Record<string, string> = {
      flat: "simple, clean, modern flat design icon with solid colors, minimal shadows, on a clean solid white background",
      "3d": "3D rendered glossy icon with realistic lighting, subtle shadows and depth, on a clean solid white background",
      cartoon: "fun cartoon-style icon with bold outlines, vibrant colors, playful and cute design, on a clean solid white background",
    };

    const styleDesc = stylePrompts[iconStyle || "flat"] || stylePrompts.flat;

    // Generate icon using AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Generate a ${styleDesc} for a food/restaurant menu category called "${categoryName}". Make it look like a professional app icon or emoji. No text, just the icon illustration.`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required for AI generation" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate icon" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "No image generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 data and upload to Supabase storage
    const base64Match = imageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!base64Match) {
      return new Response(
        JSON.stringify({ error: "Invalid image data format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageType = base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const fileName = `${userId}/ai-icons/${Date.now()}-${categoryName.replace(/\s+/g, "-")}.${imageType}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(fileName, binaryData, {
        contentType: `image/${imageType}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload generated icon" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const iconUrl = publicUrlData.publicUrl;

    // Save to category_images table
    const { error: dbError } = await supabaseAdmin
      .from("category_images")
      .upsert(
        {
          user_id: userId,
          category: categoryName,
          image_url: iconUrl,
        },
        { onConflict: "user_id,category" }
      );

    if (dbError) {
      console.error("DB error:", dbError);
      // Still return the URL even if DB save fails
    }

    return new Response(
      JSON.stringify({ iconUrl, success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating category icon:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
