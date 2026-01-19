import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AWS S3 V4 Signing
async function signRequest(
  method: string,
  url: URL,
  headers: Record<string, string>,
  body: Uint8Array | null,
  accessKeyId: string,
  secretAccessKey: string,
  region: string
): Promise<Record<string, string>> {
  const encoder = new TextEncoder();
  const algorithm = "AWS4-HMAC-SHA256";
  const service = "s3";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  
  headers["x-amz-date"] = amzDate;
  headers["host"] = url.host;
  
  const bodyHash = body 
    ? await crypto.subtle.digest("SHA-256", body).then(b => 
        Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')
      )
    : "UNSIGNED-PAYLOAD";
  
  headers["x-amz-content-sha256"] = bodyHash;
  
  const sortedHeaders = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaders.map(k => `${k.toLowerCase()}:${headers[k]}\n`).join('');
  const signedHeaders = sortedHeaders.map(k => k.toLowerCase()).join(';');
  
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
    algorithm,
    amzDate,
    credentialScope,
    await crypto.subtle.digest("SHA-256", encoder.encode(canonicalRequest))
      .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''))
  ].join('\n');
  
  const getSignatureKey = async (key: string, dateStamp: string, region: string, service: string) => {
    const kDate = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", encoder.encode("AWS4" + key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode(dateStamp)
    );
    const kRegion = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", kDate, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode(region)
    );
    const kService = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", kRegion, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode(service)
    );
    return await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", kService, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      encoder.encode("aws4_request")
    );
  };
  
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", signingKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    encoder.encode(stringToSign)
  ).then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''));
  
  headers["Authorization"] = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return headers;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "معرف المستخدم مطلوب" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get R2 credentials
    const accessKeyId = Deno.env.get("CLOUDFLARE_R2_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
    const accountId = Deno.env.get("CLOUDFLARE_R2_ACCOUNT_ID");
    const bucketName = Deno.env.get("CLOUDFLARE_R2_BUCKET_NAME");

    if (!accessKeyId || !secretAccessKey || !accountId || !bucketName) {
      return new Response(
        JSON.stringify({ error: "R2 credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get products with Supabase images for this user
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, image_url, name")
      .eq("user_id", userId)
      .not("image_url", "is", null);

    if (fetchError) {
      throw fetchError;
    }

    // Filter products with Supabase URLs
    const supabaseProducts = products?.filter(p => 
      p.image_url && 
      (p.image_url.includes('supabase.co/storage') || p.image_url.includes('zqlckixwpyrwdwrsuhsg')) &&
      !p.image_url.includes('r2.dev')
    ) || [];

    console.log(`Found ${supabaseProducts.length} products with Supabase images`);

    const results = {
      total: supabaseProducts.length,
      migrated: 0,
      failed: 0,
      errors: [] as string[]
    };

    const r2Endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    const publicUrl = "https://pub-f762a7c5308344b585c3cfbe0057fae2.r2.dev";

    for (const product of supabaseProducts) {
      try {
        console.log(`Migrating product: ${product.name} (${product.id})`);
        
        // Download image from Supabase
        const imageResponse = await fetch(product.image_url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download: ${imageResponse.status}`);
        }

        const imageData = new Uint8Array(await imageResponse.arrayBuffer());
        const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
        
        // Generate R2 key
        const ext = contentType.split("/")[1] || "jpg";
        const key = `products/${userId}/${product.id}-${Date.now()}.${ext}`;
        
        // Upload to R2
        const uploadUrl = new URL(`/${bucketName}/${key}`, r2Endpoint);
        const uploadHeaders: Record<string, string> = {
          "Content-Type": contentType,
          "Content-Length": imageData.length.toString(),
        };

        const signedHeaders = await signRequest(
          "PUT",
          uploadUrl,
          uploadHeaders,
          imageData,
          accessKeyId,
          secretAccessKey,
          "auto"
        );

        const uploadResponse = await fetch(uploadUrl.toString(), {
          method: "PUT",
          headers: signedHeaders,
          body: imageData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`R2 upload failed: ${uploadResponse.status}`);
        }

        const newUrl = `${publicUrl}/${key}`;

        // Update product with new URL
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: newUrl })
          .eq("id", product.id);

        if (updateError) {
          throw updateError;
        }

        results.migrated++;
        console.log(`Successfully migrated: ${product.name}`);
      } catch (error) {
        results.failed++;
        results.errors.push(`${product.name}: ${error.message}`);
        console.error(`Failed to migrate ${product.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `تم نقل ${results.migrated} من ${results.total} صورة`,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Migration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
