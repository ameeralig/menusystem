// Telegram Bot webhook - handles /start linking flow.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

async function sendMessage(chatId: number, text: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    console.error("Missing gateway credentials");
    return;
  }
  await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  }).catch((e) => console.error("sendMessage error", e));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const update = await req.json().catch(() => null);
  const msg = update?.message ?? update?.edited_message;
  const chatId: number | undefined = msg?.chat?.id;
  const text: string = (msg?.text ?? "").trim();
  if (!chatId) return new Response(JSON.stringify({ ok: true }));

  try {
    // Check rate limit
    const { data: attempt } = await supabase
      .from("telegram_link_attempts")
      .select("*")
      .eq("chat_id", chatId)
      .maybeSingle();

    if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
      await sendMessage(chatId, `⛔ تم قفل المحاولات مؤقتاً. حاول لاحقاً.`);
      return new Response(JSON.stringify({ ok: true }));
    }

    // Check if this chat is already linked
    const { data: linkedProfile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("telegram_chat_id", chatId)
      .eq("telegram_connected", true)
      .maybeSingle();

    if (text === "/start") {
      if (linkedProfile) {
        await sendMessage(chatId, `👋 مرحباً ${linkedProfile.full_name ?? ""}\n\nحسابك مربوط بالفعل.\nاستخدم /help لعرض الأوامر.\nاستخدم /unlink لإلغاء الربط.`);
      } else {
        await supabase.from("telegram_bot_sessions").upsert({
          chat_id: chatId,
          state: "awaiting_code",
          link_code: null,
          updated_at: new Date().toISOString(),
        });
        await sendMessage(chatId, `👋 أهلاً بك في بوت QRM Menu!\n\nلربط حسابك، أرسل <b>رمز الربط</b> (Link Code) الذي حصلت عليه من موقعك.`);
      }
      return new Response(JSON.stringify({ ok: true }));
    }

    if (text === "/unlink") {
      if (!linkedProfile) {
        await sendMessage(chatId, "لا يوجد حساب مربوط.");
      } else {
        await supabase
          .from("profiles")
          .update({
            telegram_connected: false,
            telegram_chat_id: null,
            telegram_username: null,
            telegram_first_name: null,
            telegram_verified_at: null,
          })
          .eq("id", linkedProfile.id);
        await sendMessage(chatId, "✅ تم إلغاء الربط.");
      }
      return new Response(JSON.stringify({ ok: true }));
    }

    if (text === "/help") {
      await sendMessage(chatId, `الأوامر:\n/start - بدء الربط\n/unlink - إلغاء الربط\n/help - المساعدة`);
      return new Response(JSON.stringify({ ok: true }));
    }

    if (linkedProfile) {
      // Already linked - future commands go here
      await supabase
        .from("profiles")
        .update({ telegram_last_login: new Date().toISOString() })
        .eq("id", linkedProfile.id);
      await sendMessage(chatId, `✅ حسابك مربوط. الأوامر المتقدمة قيد التطوير.\nاستخدم /help.`);
      return new Response(JSON.stringify({ ok: true }));
    }

    // Handle linking flow
    const { data: session } = await supabase
      .from("telegram_bot_sessions")
      .select("*")
      .eq("chat_id", chatId)
      .maybeSingle();

    if (!session) {
      await sendMessage(chatId, "أرسل /start للبدء.");
      return new Response(JSON.stringify({ ok: true }));
    }

    if (session.state === "awaiting_code") {
      const code = text.toUpperCase().replace(/\s/g, "");
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("telegram_link_code", code)
        .maybeSingle();
      if (!prof) {
        await bumpAttempt(supabase, chatId, attempt);
        await sendMessage(chatId, "❌ رمز الربط غير صحيح. حاول مرة أخرى أو أرسل /start.");
        return new Response(JSON.stringify({ ok: true }));
      }
      await supabase.from("telegram_bot_sessions").upsert({
        chat_id: chatId,
        state: "awaiting_password",
        link_code: code,
        updated_at: new Date().toISOString(),
      });
      await sendMessage(chatId, "🔐 الرمز صحيح. الآن أرسل <b>كلمة المرور</b> (Link Password).");
      return new Response(JSON.stringify({ ok: true }));
    }

    if (session.state === "awaiting_password") {
      const code = session.link_code!;
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, telegram_link_password_hash, telegram_chat_id, full_name")
        .eq("telegram_link_code", code)
        .maybeSingle();

      if (!prof || !prof.telegram_link_password_hash) {
        await sendMessage(chatId, "❌ حدث خطأ. أرسل /start للبدء من جديد.");
        await supabase.from("telegram_bot_sessions").delete().eq("chat_id", chatId);
        return new Response(JSON.stringify({ ok: true }));
      }

      if (prof.telegram_chat_id && prof.telegram_chat_id !== chatId) {
        await sendMessage(chatId, "⚠️ هذا الحساب مربوط بحساب Telegram آخر. قم بإعادة توليد الرمز من الموقع.");
        return new Response(JSON.stringify({ ok: true }));
      }

      const valid = await bcrypt.compare(text, prof.telegram_link_password_hash);
      if (!valid) {
        await bumpAttempt(supabase, chatId, attempt);
        await sendMessage(chatId, "❌ كلمة المرور خاطئة. حاول مرة أخرى.");
        return new Response(JSON.stringify({ ok: true }));
      }

      const from = msg.from ?? {};
      await supabase
        .from("profiles")
        .update({
          telegram_chat_id: chatId,
          telegram_username: from.username ?? null,
          telegram_first_name: from.first_name ?? null,
          telegram_connected: true,
          telegram_verified_at: new Date().toISOString(),
          telegram_last_login: new Date().toISOString(),
        })
        .eq("id", prof.id);
      await supabase.from("telegram_bot_sessions").delete().eq("chat_id", chatId);
      await supabase.from("telegram_link_attempts").delete().eq("chat_id", chatId);

      await sendMessage(chatId, `✅ تم ربط حسابك بنجاح!\n\nمرحباً ${prof.full_name ?? ""} 🎉\nاستخدم /help لعرض الأوامر.`);
      return new Response(JSON.stringify({ ok: true }));
    }
  } catch (e) {
    console.error("webhook error", e);
  }

  return new Response(JSON.stringify({ ok: true }));
});

async function bumpAttempt(supabase: any, chatId: number, prev: any) {
  const attempts = (prev?.attempts ?? 0) + 1;
  const locked_until =
    attempts >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
      : null;
  await supabase.from("telegram_link_attempts").upsert({
    chat_id: chatId,
    attempts: locked_until ? 0 : attempts,
    locked_until,
    updated_at: new Date().toISOString(),
  });
}
