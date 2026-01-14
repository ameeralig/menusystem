import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  original_filename: string;
}

/**
 * Get Cloudinary credentials from environment variables
 */
function getCloudinaryCredentials() {
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  
  // Check individual secrets first
  if (apiKey && apiSecret && cloudName) {
    return { apiKey, apiSecret, cloudName };
  }
  
  // Fallback to CLOUDINARY_URL if individual secrets not set
  const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL');
  if (cloudinaryUrl) {
    const regex = /cloudinary:\/\/(\d+):([^@]+)@(.+)/;
    const match = cloudinaryUrl.match(regex);
    if (match) {
      return {
        apiKey: match[1],
        apiSecret: match[2],
        cloudName: match[3]
      };
    }
  }
  
  return null;
}

/**
 * Generate SHA1 signature for Cloudinary upload
 */
async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const data = new TextEncoder().encode(sortedParams + apiSecret);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const credentials = getCloudinaryCredentials();
    
    if (!credentials) {
      console.error("Cloudinary credentials not configured. Set CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME");
      return new Response(
        JSON.stringify({ error: "Cloudinary not configured. Missing API credentials." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { apiKey, apiSecret, cloudName } = credentials;
    console.log(`Using Cloudinary cloud: ${cloudName}, API Key: ${apiKey.substring(0, 4)}...`);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const convertToWebp = formData.get('convertToWebp') === 'true';
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get original file info
    const originalSize = file.size;
    const originalFormat = file.type.split('/')[1] || 'unknown';
    
    console.log(`Processing file: ${file.name}, size: ${originalSize}, format: ${originalFormat}`);

    // Prepare upload parameters
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const uploadParams: Record<string, string> = {
      folder,
      timestamp,
    };

    // Add WebP transformation if requested
    if (convertToWebp) {
      uploadParams.format = 'webp';
      uploadParams.quality = 'auto:good';
      console.log("WebP conversion enabled");
    }

    // Generate signature
    const signature = await generateSignature(uploadParams, apiSecret);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', dataUri);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', timestamp);
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('folder', folder);
    
    if (convertToWebp) {
      cloudinaryFormData.append('format', 'webp');
      cloudinaryFormData.append('quality', 'auto:good');
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log(`Uploading to Cloudinary: ${uploadUrl}`);

    const cloudinaryResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: cloudinaryFormData
    });

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error("Cloudinary upload failed:", errorText);
      return new Response(
        JSON.stringify({ error: "Upload to Cloudinary failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: CloudinaryResponse = await cloudinaryResponse.json();
    console.log(`Upload successful. URL: ${result.secure_url}, size: ${result.bytes}, format: ${result.format}`);

    // Calculate size reduction
    const sizeReduction = originalSize - result.bytes;
    const reductionPercentage = Math.round((sizeReduction / originalSize) * 100);

    return new Response(
      JSON.stringify({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        original: {
          size: originalSize,
          format: originalFormat,
          sizeFormatted: formatBytes(originalSize)
        },
        optimized: {
          size: result.bytes,
          format: result.format,
          sizeFormatted: formatBytes(result.bytes),
          width: result.width,
          height: result.height
        },
        savings: {
          bytes: sizeReduction,
          percentage: reductionPercentage,
          formatted: formatBytes(sizeReduction)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in cloudinary-optimize:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
