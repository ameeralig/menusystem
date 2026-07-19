// Manages Telegram link credentials for the authenticated user.
// Actions: generate | disconnect | status
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function randCode(len: number, charset: string) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += charset[bytes[i] % charset.length];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userRes } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userRes?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { action } = await req.json().catch(() => ({ action: "status" }));

    if (action === "status") {
      const { data } = await supabase
        .from("profiles")
        .select("telegram_connected, telegram_username, telegram_first_name, telegram_link_code, telegram_verified_at, telegram_last_login")
        .eq("id", user.id)
        .maybeSingle();
      return json({ ok: true, profile: data });
    }

    if (action === "generate") {
      // Ensure uniqueness of code (retry a few times if collision)
      let code = "";
      for (let i = 0; i < 5; i++) {
        code = randCode(10, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("telegram_link_code", code)
          .maybeSingle();
        if (!existing) break;
      }
      const password = randCode(16, "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789");
      const hash = await bcrypt.hash(password, 10);

      const { error } = await supabase
        .from("profiles")
        .update({
          telegram_link_code: code,
          telegram_link_password_hash: hash,
          // regenerating invalidates the current link
          telegram_connected: false,
          telegram_chat_id: null,
          telegram_username: null,
          telegram_first_name: null,
          telegram_verified_at: null,
        })
        .eq("id", user.id);
      if (error) return json({ error: error.message }, 500);

      return json({ ok: true, link_code: code, password });
    }

    if (action === "disconnect") {
      const { error } = await supabase
        .from("profiles")
        .update({
          telegram_connected: false,
          telegram_chat_id: null,
          telegram_username: null,
          telegram_first_name: null,
          telegram_verified_at: null,
          telegram_link_code: null,
          telegram_link_password_hash: null,
        })
        .eq("id", user.id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
