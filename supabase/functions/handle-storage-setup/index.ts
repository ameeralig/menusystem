
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to get the bucket first to see if it exists
    const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket("public");

    // If the bucket doesn't exist, create it
    if (getBucketError && getBucketError.message.includes("not found")) {
      const { data, error } = await supabase.storage.createBucket("public", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        throw error;
      }

      // Create a policy that allows authenticated users to upload files
      const { error: policyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: 'public',
        policy_name: 'Allow authenticated uploads',
        definition: `(role() = 'authenticated'::text)`
      });

      if (policyError) {
        console.error("Error creating policy:", policyError);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Bucket created successfully", data }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (getBucketError) {
      throw getBucketError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Bucket already exists", data: existingBucket }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
