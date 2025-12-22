import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    // GET request - Webhook verification from Meta
    if (req.method === "GET") {
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      console.log("Webhook verification request:", { mode, token, challenge });

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully!");
        return new Response(challenge, { status: 200 });
      } else {
        console.error("Webhook verification failed - token mismatch");
        return new Response("Forbidden", { status: 403 });
      }
    }

    // POST request - Incoming messages
    if (req.method === "POST") {
      const body = await req.json();
      console.log("Incoming webhook:", JSON.stringify(body, null, 2));

      // Extract message data
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        console.log("No messages in webhook, might be status update");
        return new Response(JSON.stringify({ status: "ok" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const message = messages[0];
      const senderPhone = message.from;
      const messageType = message.type;
      let messageText = "";
      let mediaId = null;

      // Handle different message types
      if (messageType === "text") {
        messageText = message.text?.body || "";
      } else if (messageType === "image") {
        mediaId = message.image?.id;
        messageText = message.image?.caption || "[صورة]";
      } else {
        messageText = `[${messageType}]`;
      }

      console.log(`Message from ${senderPhone}: ${messageText}`);

      // Initialize Supabase client
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Find user by phone number
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone_number")
        .eq("phone_number", senderPhone)
        .single();

      if (profileError || !profile) {
        console.log(`User not found for phone: ${senderPhone}`);
        
        // Send message that user is not registered
        await sendWhatsAppMessage(
          senderPhone,
          "⚠️ رقمك غير مسجل في النظام.\n\nيرجى التسجيل في التطبيق أولاً وإضافة رقم هاتفك في الملف الشخصي."
        );
        
        return new Response(JSON.stringify({ status: "user_not_found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Found user: ${profile.full_name} (${profile.id})`);

      // Forward to whatsapp-bot function
      const botResponse = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-bot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          userId: profile.id,
          userName: profile.full_name,
          phoneNumber: senderPhone,
          message: messageText,
          messageType,
          mediaId,
        }),
      });

      const botResult = await botResponse.json();
      console.log("Bot response:", botResult);

      return new Response(JSON.stringify({ status: "processed", botResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper function to send WhatsApp messages
async function sendWhatsAppMessage(to: string, message: string) {
  const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const result = await response.json();
    console.log("WhatsApp send result:", result);
    return result;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
}
