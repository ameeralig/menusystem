import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  const url = new URL(req.url);
  
  console.log("=== WhatsApp Webhook Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // GET request - Webhook verification from Meta
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    console.log("Verification request:", { mode, token, challenge });

    const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
    console.log("Expected token:", VERIFY_TOKEN);

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully!");
      return new Response(challenge, { 
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    } else {
      console.log("❌ Verification failed - token mismatch");
      return new Response("Forbidden", { 
        status: 403,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }

  // POST request - Incoming webhook events from Meta
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Incoming webhook event:", JSON.stringify(body, null, 2));
      
      // Always respond with 200 OK to acknowledge receipt
      return new Response("EVENT_RECEIVED", { 
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("EVENT_RECEIVED", { 
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }

  return new Response("Method not allowed", { 
    status: 405,
    headers: { "Content-Type": "text/plain" }
  });
});
