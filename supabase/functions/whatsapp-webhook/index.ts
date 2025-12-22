import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      
      // استخراج الرسالة من الـ webhook
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;
      
      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from; // رقم المرسل
        const messageText = message.text?.body || "";
        const phoneNumberId = value.metadata?.phone_number_id;
        
        console.log("📩 رسالة جديدة من:", from);
        console.log("📝 محتوى الرسالة:", messageText);
        console.log("📱 Phone Number ID:", phoneNumberId);
        
        // إرسال الرسالة إلى whatsapp-bot للمعالجة
        try {
          const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
          const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          
          console.log("🤖 إرسال الرسالة إلى البوت...");
          
          const botResponse = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-bot`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              message: messageText,
              from: from,
              phoneNumberId: phoneNumberId
            })
          });
          
          const botResult = await botResponse.text();
          console.log("🤖 استجابة البوت:", botResult);
          
        } catch (botError) {
          console.error("❌ خطأ في استدعاء البوت:", botError);
        }
      } else {
        console.log("⚠️ لا توجد رسائل في هذا الحدث");
      }
      
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
