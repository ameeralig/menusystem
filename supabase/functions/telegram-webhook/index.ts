// Telegram Bot webhook — full menu management + linking flow.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ========================== Telegram helpers ==========================
async function tg(method: string, body: Record<string, unknown>) {
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    console.error("Missing Telegram gateway credentials");
    return null;
  }
  try {
    const r = await fetch(`${GATEWAY_URL}/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return await r.json().catch(() => null);
  } catch (e) {
    console.error(`tg ${method}`, e);
    return null;
  }
}

function send(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  return tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...extra });
}

function answerCb(id: string, text?: string) {
  return tg("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
}

// Persistent Reply Keyboard (main menu)
const MAIN_KB = {
  reply_markup: {
    keyboard: [
      [{ text: "📦 المنتجات" }, { text: "📂 التصنيفات" }],
      [{ text: "➕ إضافة منتج" }, { text: "📊 الإحصائيات" }],
      [{ text: "⚙️ الإعدادات" }, { text: "👤 الحساب" }],
      [{ text: "❌ تسجيل الخروج" }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  },
};

const REMOVE_KB = { reply_markup: { remove_keyboard: true } };

// ========================== R2 upload (for photos) ==========================
async function uploadPhotoToR2(userId: string, fileBytes: Uint8Array, filename: string): Promise<string | null> {
  try {
    const form = new FormData();
    const blob = new Blob([fileBytes], { type: "image/jpeg" });
    form.append("file", blob, filename);
    form.append("userId", userId);
    form.append("folder", "products");
    const r = await fetch(`${SUPABASE_URL}/functions/v1/cloudflare-r2-upload`, {
      method: "POST",
      body: form,
    });
    const data = await r.json();
    return data?.url ?? null;
  } catch (e) {
    console.error("uploadPhotoToR2", e);
    return null;
  }
}

async function downloadTelegramPhoto(fileId: string): Promise<{ bytes: Uint8Array; name: string } | null> {
  const info = await tg("getFile", { file_id: fileId });
  const filePath = info?.result?.file_path;
  if (!filePath) return null;
  const r = await fetch(`${GATEWAY_URL}/file/${filePath}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY!,
    },
  });
  if (!r.ok) return null;
  const bytes = new Uint8Array(await r.arrayBuffer());
  const name = filePath.split("/").pop() || `photo-${Date.now()}.jpg`;
  return { bytes, name };
}

// ========================== Session helpers ==========================
type Session = {
  chat_id: number;
  state: string | null;
  link_code: string | null;
  data: Record<string, any>;
};

async function getSession(chatId: number): Promise<Session | null> {
  const { data } = await supabase
    .from("telegram_bot_sessions")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle();
  return data as Session | null;
}

async function setState(chatId: number, state: string | null, patch: Record<string, any> = {}) {
  const current = await getSession(chatId);
  const merged = { ...(current?.data ?? {}), ...patch };
  await supabase.from("telegram_bot_sessions").upsert({
    chat_id: chatId,
    state,
    link_code: current?.link_code ?? null,
    data: merged,
    updated_at: new Date().toISOString(),
  });
}

async function clearSession(chatId: number) {
  await supabase.from("telegram_bot_sessions").delete().eq("chat_id", chatId);
}

async function touch(profileId: string) {
  await supabase
    .from("profiles")
    .update({ telegram_last_activity: new Date().toISOString() })
    .eq("id", profileId);
}

async function bumpAttempt(chatId: number, prev: any) {
  const attempts = (prev?.attempts ?? 0) + 1;
  const locked_until =
    attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null;
  await supabase.from("telegram_link_attempts").upsert({
    chat_id: chatId,
    attempts: locked_until ? 0 : attempts,
    locked_until,
    updated_at: new Date().toISOString(),
  });
}

// ========================== Products handlers ==========================
async function listProducts(chatId: number, userId: string, page = 0, categoryId?: string) {
  const from = page * 8;
  const to = from + 7;
  let q = supabase
    .from("products")
    .select("id,name,price,is_available,category")
    .eq("user_id", userId)
    .order("display_order", { ascending: true })
    .range(from, to);
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data } = await q;
  if (!data || data.length === 0) {
    return send(chatId, "لا توجد منتجات في هذه الصفحة.");
  }
  const buttons = data.map((p: any) => [
    { text: `${p.is_available === false ? "🚫" : "✅"} ${p.name} — ${p.price}`, callback_data: `p:view:${p.id}` },
  ]);
  const nav: any[] = [];
  if (page > 0) nav.push({ text: "⬅️ السابق", callback_data: `p:list:${page - 1}:${categoryId ?? ""}` });
  if (data.length === 8) nav.push({ text: "التالي ➡️", callback_data: `p:list:${page + 1}:${categoryId ?? ""}` });
  if (nav.length) buttons.push(nav);
  buttons.push([{ text: "🔍 بحث", callback_data: "p:search" }, { text: "📂 حسب التصنيف", callback_data: "p:bycat" }]);
  return send(chatId, `📦 <b>المنتجات</b> — صفحة ${page + 1}`, {
    reply_markup: { inline_keyboard: buttons },
  });
}

async function showProduct(chatId: number, userId: string, productId: string) {
  const { data: p } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!p) return send(chatId, "❌ المنتج غير موجود.");
  const text =
    `🛒 <b>${escape(p.name)}</b>\n` +
    `💰 السعر: <b>${p.price}</b>\n` +
    `📂 التصنيف: ${escape(p.category ?? "-")}\n` +
    `📝 الوصف: ${escape(p.description ?? "-")}\n` +
    `📊 الحاله: ${p.is_available === false ? "🚫 غير متاح" : "✅ متاح"}`;
  const kb = {
    inline_keyboard: [
      [{ text: "✏️ الاسم", callback_data: `p:edit:name:${p.id}` }, { text: "💰 السعر", callback_data: `p:edit:price:${p.id}` }],
      [{ text: "📝 الوصف", callback_data: `p:edit:desc:${p.id}` }, { text: "📷 الصوره", callback_data: `p:edit:image:${p.id}` }],
      [
        { text: p.is_available === false ? "✅ تفعيل" : "🚫 تعطيل", callback_data: `p:toggle:${p.id}` },
        { text: "📋 نسخ", callback_data: `p:dup:${p.id}` },
      ],
      [{ text: "🗑 حذف", callback_data: `p:del:${p.id}` }],
      [{ text: "⬅️ رجوع", callback_data: "p:list:0:" }],
    ],
  };
  if (p.image_url) {
    return tg("sendPhoto", { chat_id: chatId, photo: p.image_url, caption: text, parse_mode: "HTML", reply_markup: kb });
  }
  return send(chatId, text, { reply_markup: kb });
}

function escape(s: string | null | undefined) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function startAddProduct(chatId: number) {
  await setState(chatId, "add_product:name", { new_product: {} });
  return send(chatId, "➕ <b>إضافة منتج جديد</b>\n\nأرسل <b>اسم المنتج</b>:", REMOVE_KB);
}

async function pickCategoryKB(userId: string, prefix: string) {
  const { data } = await supabase
    .from("categories")
    .select("id,name")
    .eq("user_id", userId)
    .order("name");
  const rows = (data ?? []).map((c: any) => [{ text: c.name, callback_data: `${prefix}:${c.id}` }]);
  rows.push([{ text: "بدون تصنيف", callback_data: `${prefix}:none` }]);
  return { inline_keyboard: rows };
}

// ========================== Categories handlers ==========================
async function listCategories(chatId: number, userId: string) {
  const { data } = await supabase
    .from("categories")
    .select("id,name")
    .eq("user_id", userId)
    .order("name");
  if (!data || data.length === 0) {
    return send(chatId, "لا توجد تصنيفات بعد.", {
      reply_markup: { inline_keyboard: [[{ text: "➕ إضافة تصنيف", callback_data: "c:add" }]] },
    });
  }
  const rows = data.map((c: any) => [{ text: `📂 ${c.name}`, callback_data: `c:view:${c.id}` }]);
  rows.push([{ text: "➕ إضافة تصنيف", callback_data: "c:add" }]);
  return send(chatId, "📂 <b>التصنيفات</b>", { reply_markup: { inline_keyboard: rows } });
}

async function viewCategory(chatId: number, userId: string, catId: string) {
  const { data: c } = await supabase.from("categories").select("*").eq("id", catId).eq("user_id", userId).maybeSingle();
  if (!c) return send(chatId, "❌ التصنيف غير موجود.");
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("category_id", catId);
  return send(chatId, `📂 <b>${escape(c.name)}</b>\nعدد المنتجات: ${count ?? 0}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "✏️ إعادة تسميه", callback_data: `c:rename:${c.id}` }],
        [{ text: "📦 عرض منتجاته", callback_data: `p:list:0:${c.id}` }],
        [{ text: "🗑 حذف", callback_data: `c:del:${c.id}` }],
        [{ text: "⬅️ رجوع", callback_data: "c:list" }],
      ],
    },
  });
}

// ========================== Stats ==========================
async function showStats(chatId: number, userId: string) {
  const [{ count: pc }, { count: cc }, { count: today }, topRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId)
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from("products").select("name,price").eq("user_id", userId).order("price", { ascending: false }).limit(1),
  ]);
  const top = topRes.data?.[0];
  await send(
    chatId,
    `📊 <b>الإحصائيات</b>\n\n` +
      `📦 المنتجات: <b>${pc ?? 0}</b>\n` +
      `📂 التصنيفات: <b>${cc ?? 0}</b>\n` +
      `🧾 طلبات اليوم: <b>${today ?? 0}</b>\n` +
      `⭐ أعلى منتج سعراً: ${top ? `${escape(top.name)} (${top.price})` : "-"}`,
  );
}

// ========================== Main handler ==========================
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const update = await req.json().catch(() => null);

  // Callback query
  if (update?.callback_query) {
    return handleCallback(update.callback_query);
  }

  const msg = update?.message ?? update?.edited_message;
  const chatId: number | undefined = msg?.chat?.id;
  if (!chatId) return new Response(JSON.stringify({ ok: true }));

  try {
    return await handleMessage(chatId, msg);
  } catch (e) {
    console.error("handler error", e);
    await send(chatId, "⚠️ حصل خطأ. جرّب مرة أخرى أو أرسل /start.");
    return new Response(JSON.stringify({ ok: true }));
  }
});

async function findLinkedProfile(chatId: number) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, telegram_username")
    .eq("telegram_chat_id", chatId)
    .eq("telegram_connected", true)
    .maybeSingle();
  return data;
}

async function handleMessage(chatId: number, msg: any) {
  const text: string = (msg?.text ?? "").trim();
  const photo = msg?.photo?.[msg.photo.length - 1];

  // Check lock
  const { data: attempt } = await supabase
    .from("telegram_link_attempts").select("*").eq("chat_id", chatId).maybeSingle();
  if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
    await send(chatId, "⛔ تم قفل المحاولات مؤقتاً. حاول لاحقاً.");
    return new Response(JSON.stringify({ ok: true }));
  }

  const linked = await findLinkedProfile(chatId);

  // ============ Not linked yet: run linking FSM ============
  if (!linked) {
    if (text === "/start") {
      await setState(chatId, "awaiting_code", { link_code: null });
      await supabase.from("telegram_bot_sessions").update({ link_code: null }).eq("chat_id", chatId);
      await send(chatId,
        "👋 <b>أهلاً بك في بوت QRM Menu!</b>\n\n" +
        "لربط حسابك اتبع الخطوات:\n" +
        "1️⃣ ولّد <b>رمز الربط</b> و<b>كلمة السر</b> من ملفك الشخصي بالموقع.\n" +
        "2️⃣ أرسل رمز الربط الآن.",
        { reply_markup: { inline_keyboard: [[{ text: "📤 كيف أحصل على الرمز؟", callback_data: "link:help" }]] } });
      return new Response(JSON.stringify({ ok: true }));
    }

    const session = await getSession(chatId);
    if (!session) {
      await send(chatId, "أرسل /start للبدء بربط حسابك.");
      return new Response(JSON.stringify({ ok: true }));
    }

    if (session.state === "awaiting_code") {
      const code = text.toUpperCase().replace(/\s/g, "");
      const { data: prof } = await supabase.from("profiles").select("id").eq("telegram_link_code", code).maybeSingle();
      if (!prof) {
        await bumpAttempt(chatId, attempt);
        await send(chatId, "❌ رمز الربط غير صحيح. حاول مرة أخرى، أو أرسل /start.");
        return new Response(JSON.stringify({ ok: true }));
      }
      await supabase.from("telegram_bot_sessions").upsert({
        chat_id: chatId, state: "awaiting_password", link_code: code, data: {}, updated_at: new Date().toISOString(),
      });
      await send(chatId, "🔐 الرمز صحيح!\n\nالآن أرسل <b>كلمة السر</b>:");
      return new Response(JSON.stringify({ ok: true }));
    }

    if (session.state === "awaiting_password") {
      const code = session.link_code!;
      const { data: prof } = await supabase.from("profiles")
        .select("id, telegram_link_password_hash, telegram_chat_id, full_name")
        .eq("telegram_link_code", code).maybeSingle();
      if (!prof?.telegram_link_password_hash) {
        await send(chatId, "❌ خطأ. أرسل /start للبدء من جديد.");
        await clearSession(chatId);
        return new Response(JSON.stringify({ ok: true }));
      }
      if (prof.telegram_chat_id && prof.telegram_chat_id !== chatId) {
        await send(chatId, "⚠️ هذا الحساب مربوط بحساب Telegram آخر. أعد توليد الرمز من الموقع.");
        return new Response(JSON.stringify({ ok: true }));
      }
      const ok = await bcrypt.compare(text, prof.telegram_link_password_hash);
      if (!ok) {
        await bumpAttempt(chatId, attempt);
        await send(chatId, "❌ كلمة السر خاطئة. حاول مرة أخرى.");
        return new Response(JSON.stringify({ ok: true }));
      }
      const from = msg.from ?? {};
      await supabase.from("profiles").update({
        telegram_chat_id: chatId,
        telegram_username: from.username ?? null,
        telegram_first_name: from.first_name ?? null,
        telegram_connected: true,
        telegram_verified_at: new Date().toISOString(),
        telegram_last_login: new Date().toISOString(),
        telegram_last_activity: new Date().toISOString(),
      }).eq("id", prof.id);
      await clearSession(chatId);
      await supabase.from("telegram_link_attempts").delete().eq("chat_id", chatId);
      await send(chatId,
        `✅ <b>تم ربط حسابك بنجاح!</b>\n\nمرحباً ${escape(prof.full_name ?? "")} 🎉\n\nاختر من القائمة بالأسفل:`,
        MAIN_KB);
      return new Response(JSON.stringify({ ok: true }));
    }

    await send(chatId, "أرسل /start للبدء.");
    return new Response(JSON.stringify({ ok: true }));
  }

  // ============ Linked: main dashboard ============
  await touch(linked.id);
  const session = await getSession(chatId);

  // 🤖 صورة مطلوبة من المساعد الذكي
  const pending = (session as any)?.pending_action;
  if (photo && pending?.type === "product_image" && pending?.product_id) {
    await send(chatId, "⏳ جاري رفع الصوره...");
    const dl = await downloadTelegramPhoto(photo.file_id);
    const url = dl ? await uploadPhotoToR2(linked.id, dl.bytes, dl.name) : null;
    if (!url) {
      await send(chatId, "❌ فشل رفع الصوره. جرّب مرة ثانية.");
      return new Response(JSON.stringify({ ok: true }));
    }
    await supabase.from("products").update({ image_url: url })
      .eq("id", pending.product_id).eq("user_id", linked.id);
    await supabase.from("telegram_bot_sessions")
      .update({ pending_action: null }).eq("chat_id", chatId);
    await send(chatId, "✅ تم ربط الصوره بالمنتج!", MAIN_KB);
    await showProduct(chatId, linked.id, pending.product_id);
    return new Response(JSON.stringify({ ok: true }));
  }

  // Photo handler (for image edits/adds)
  if (photo && session?.state) {
    if (session.state === "add_product:image" || session.state?.startsWith("edit_image:")) {
      await send(chatId, "⏳ جاري رفع الصوره...");
      const dl = await downloadTelegramPhoto(photo.file_id);
      if (!dl) {
        await send(chatId, "❌ تعذّر تحميل الصوره.");
        return new Response(JSON.stringify({ ok: true }));
      }
      const url = await uploadPhotoToR2(linked.id, dl.bytes, dl.name);
      if (!url) {
        await send(chatId, "❌ فشل رفع الصوره.");
        return new Response(JSON.stringify({ ok: true }));
      }
      if (session.state === "add_product:image") {
        const np = { ...(session.data.new_product ?? {}), image_url: url };
        await finalizeAddProduct(chatId, linked.id, np);
      } else {
        const productId = session.state.split(":")[1];
        await supabase.from("products").update({ image_url: url }).eq("id", productId).eq("user_id", linked.id);
        await clearSession(chatId);
        await send(chatId, "✅ تم تحديث الصوره.", MAIN_KB);
        await showProduct(chatId, linked.id, productId);
      }
      return new Response(JSON.stringify({ ok: true }));
    }
  }

  // Text commands
  if (text === "/start" || text === "/menu") {
    await send(chatId, `👋 مرحباً ${escape(linked.full_name ?? "")}\nاختر من القائمة:`, MAIN_KB);
    return new Response(JSON.stringify({ ok: true }));
  }
  if (text === "/help") {
    await send(chatId, "الأوامر:\n/start - القائمة الرئيسية\n/cancel - إلغاء العمليه الحاليه\n/unlink - إلغاء الربط", MAIN_KB);
    return new Response(JSON.stringify({ ok: true }));
  }
  if (text === "/cancel") {
    await clearSession(chatId);
    await send(chatId, "✅ تم إلغاء العملية.", MAIN_KB);
    return new Response(JSON.stringify({ ok: true }));
  }
  if (text === "/unlink" || text === "❌ تسجيل الخروج") {
    await supabase.from("profiles").update({
      telegram_connected: false, telegram_chat_id: null,
      telegram_username: null, telegram_first_name: null, telegram_verified_at: null,
    }).eq("id", linked.id);
    await clearSession(chatId);
    await send(chatId, "✅ تم إلغاء الربط. أرسل /start لإعادة الربط.", REMOVE_KB);
    return new Response(JSON.stringify({ ok: true }));
  }

  // FSM state handling (text steps)
  if (session?.state) {
    const handled = await handleFsmText(chatId, linked.id, session, text);
    if (handled) return new Response(JSON.stringify({ ok: true }));
  }

  // Main menu buttons
  switch (text) {
    case "📦 المنتجات":
      await listProducts(chatId, linked.id, 0);
      return new Response(JSON.stringify({ ok: true }));
    case "📂 التصنيفات":
      await listCategories(chatId, linked.id);
      return new Response(JSON.stringify({ ok: true }));
    case "➕ إضافة منتج":
      await startAddProduct(chatId);
      return new Response(JSON.stringify({ ok: true }));
    case "📊 الإحصائيات":
      await showStats(chatId, linked.id);
      return new Response(JSON.stringify({ ok: true }));
    case "⚙️ الإعدادات": {
      const { data: s } = await supabase.from("store_settings").select("store_name").eq("user_id", linked.id).maybeSingle();
      await send(chatId, `⚙️ <b>الإعدادات</b>\n\n🏪 المتجر: ${escape(s?.store_name ?? "غير محدد")}\n\nإدارة الإعدادات المتقدمة تتم من الموقع.`, MAIN_KB);
      return new Response(JSON.stringify({ ok: true }));
    }
    case "👤 الحساب": {
      const { data: p } = await supabase.from("profiles").select("full_name, telegram_username, telegram_verified_at").eq("id", linked.id).maybeSingle();
      await send(chatId, `👤 <b>حسابك</b>\n\nالاسم: ${escape(p?.full_name ?? "-")}\n@${escape(p?.telegram_username ?? "-")}\nتاريخ الربط: ${p?.telegram_verified_at ? new Date(p.telegram_verified_at).toLocaleDateString("ar") : "-"}`, MAIN_KB);
      return new Response(JSON.stringify({ ok: true }));
    }
  }

  // 🤖 المساعد الذكي — أي كلام حر يُفهم وينفّذ باللغة الطبيعية
  await tg("sendChatAction", { chat_id: chatId, action: "typing" });
  const aiReply = await askAiAgent(chatId, linked.id, text);
  await send(chatId, aiReply, MAIN_KB);
  return new Response(JSON.stringify({ ok: true }));
}

// استدعاء المساعد الذكي
async function askAiAgent(chatId: number, userId: string, text: string): Promise<string> {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/telegram-ai-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ chatId, userId, text }),
    });
    const data = await r.json().catch(() => null);
    return data?.reply || "🤔 ما فهمت الطلب. جرّب توضّح أكثر أو استخدم الأزرار.";
  } catch (e) {
    console.error("askAiAgent", e);
    return "⚠️ المساعد الذكي مو متوفر حالياً. استخدم الأزرار بالأسفل.";
  }
}
}

// ========================== FSM text steps ==========================
async function handleFsmText(chatId: number, userId: string, session: Session, text: string): Promise<boolean> {
  const s = session.state!;

  // Add product wizard
  if (s === "add_product:name") {
    if (!text) return false;
    await setState(chatId, "add_product:price", { new_product: { ...(session.data.new_product ?? {}), name: text } });
    await send(chatId, "💰 الآن أرسل <b>السعر</b> (رقم فقط):");
    return true;
  }
  if (s === "add_product:price") {
    const price = parseFloat(text.replace(/[^\d.]/g, ""));
    if (isNaN(price) || price < 0) {
      await send(chatId, "❌ سعر غير صحيح. أرسل رقم:");
      return true;
    }
    const np = { ...(session.data.new_product ?? {}), price };
    await setState(chatId, "add_product:category", { new_product: np });
    const kb = await pickCategoryKB(userId, "np:cat");
    await send(chatId, "📂 اختر التصنيف:", { reply_markup: kb });
    return true;
  }
  if (s === "add_product:desc") {
    const np = { ...(session.data.new_product ?? {}), description: text === "-" ? null : text };
    await setState(chatId, "add_product:image", { new_product: np });
    await send(chatId, "📷 أرسل صوره المنتج، أو اكتب <b>تخطي</b> للحفظ بدون صوره.");
    return true;
  }
  if (s === "add_product:image") {
    if (text.toLowerCase() === "تخطي" || text.toLowerCase() === "skip") {
      await finalizeAddProduct(chatId, userId, session.data.new_product ?? {});
      return true;
    }
    await send(chatId, "أرسل الصوره كملف Photo أو اكتب <b>تخطي</b>.");
    return true;
  }

  // Edit product fields
  if (s.startsWith("edit_name:")) {
    const pid = s.split(":")[1];
    await supabase.from("products").update({ name: text }).eq("id", pid).eq("user_id", userId);
    await clearSession(chatId);
    await send(chatId, "✅ تم تحديث الاسم.", MAIN_KB);
    await showProduct(chatId, userId, pid);
    return true;
  }
  if (s.startsWith("edit_price:")) {
    const pid = s.split(":")[1];
    const price = parseFloat(text.replace(/[^\d.]/g, ""));
    if (isNaN(price)) { await send(chatId, "❌ سعر غير صحيح."); return true; }
    await supabase.from("products").update({ price }).eq("id", pid).eq("user_id", userId);
    await clearSession(chatId);
    await send(chatId, "✅ تم تحديث السعر.", MAIN_KB);
    await showProduct(chatId, userId, pid);
    return true;
  }
  if (s.startsWith("edit_desc:")) {
    const pid = s.split(":")[1];
    await supabase.from("products").update({ description: text === "-" ? null : text }).eq("id", pid).eq("user_id", userId);
    await clearSession(chatId);
    await send(chatId, "✅ تم تحديث الوصف.", MAIN_KB);
    await showProduct(chatId, userId, pid);
    return true;
  }

  // Category flows
  if (s === "cat_add:name") {
    const { error } = await supabase.from("categories").insert({
      user_id: userId, name: text, image_url: "",
    });
    await clearSession(chatId);
    if (error) await send(chatId, `❌ فشل: ${error.message}`, MAIN_KB);
    else { await send(chatId, `✅ تم إضافة التصنيف "${escape(text)}"`, MAIN_KB); await listCategories(chatId, userId); }
    return true;
  }
  if (s.startsWith("cat_rename:")) {
    const cid = s.split(":")[1];
    await supabase.from("categories").update({ name: text }).eq("id", cid).eq("user_id", userId);
    await clearSession(chatId);
    await send(chatId, "✅ تم تحديث اسم التصنيف.", MAIN_KB);
    await listCategories(chatId, userId);
    return true;
  }

  // Search
  if (s === "product_search") {
    const { data } = await supabase
      .from("products").select("id,name,price")
      .eq("user_id", userId).ilike("name", `%${text}%`).limit(15);
    await clearSession(chatId);
    if (!data?.length) { await send(chatId, "لا توجد نتائج.", MAIN_KB); return true; }
    const rows = data.map((p: any) => [{ text: `${p.name} — ${p.price}`, callback_data: `p:view:${p.id}` }]);
    await send(chatId, `🔍 نتائج البحث (${data.length}):`, { reply_markup: { inline_keyboard: rows } });
    return true;
  }

  return false;
}

async function finalizeAddProduct(chatId: number, userId: string, np: any) {
  if (!np?.name || np?.price == null) {
    await clearSession(chatId);
    await send(chatId, "❌ بيانات غير مكتمله. أعد المحاولة.", MAIN_KB);
    return;
  }
  // resolve category name
  let categoryName = null;
  if (np.category_id) {
    const { data: c } = await supabase.from("categories").select("name").eq("id", np.category_id).maybeSingle();
    categoryName = c?.name ?? null;
  }
  const { error, data } = await supabase.from("products").insert({
    user_id: userId,
    name: np.name,
    price: np.price,
    description: np.description ?? null,
    image_url: np.image_url ?? null,
    category_id: np.category_id ?? null,
    category: categoryName,
    is_available: true,
  }).select("id").single();
  await clearSession(chatId);
  if (error) {
    await send(chatId, `❌ فشل الحفظ: ${error.message}`, MAIN_KB);
  } else {
    await send(chatId, "✅ تم إضافة المنتج بنجاح!", MAIN_KB);
    if (data?.id) await showProduct(chatId, userId, data.id);
  }
}

// ========================== Callback queries ==========================
async function handleCallback(cq: any) {
  const chatId = cq.message?.chat?.id;
  const data: string = cq.data ?? "";
  if (!chatId) return new Response(JSON.stringify({ ok: true }));
  await answerCb(cq.id);

  const linked = await findLinkedProfile(chatId);

  // Linking help (works even unlinked)
  if (data === "link:help") {
    await send(chatId,
      "🔗 <b>خطوات الحصول على الرمز:</b>\n\n" +
      "1. افتح الموقع وسجّل الدخول.\n" +
      "2. افتح <b>الملف الشخصي</b>.\n" +
      "3. اذهب لقسم <b>ربط Telegram</b>.\n" +
      "4. اضغط <b>توليد بيانات الربط</b>.\n" +
      "5. انسخ <b>الرمز</b> و<b>كلمة السر</b> وأرسلهم هنا بالترتيب.");
    return new Response(JSON.stringify({ ok: true }));
  }

  if (!linked) {
    await send(chatId, "أرسل /start لبدء الربط.");
    return new Response(JSON.stringify({ ok: true }));
  }
  await touch(linked.id);
  const uid = linked.id;

  // Products
  if (data.startsWith("p:list:")) {
    const [, , pageStr, cat] = data.split(":");
    await listProducts(chatId, uid, parseInt(pageStr) || 0, cat || undefined);
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("p:view:")) {
    await showProduct(chatId, uid, data.split(":")[2]);
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data === "p:search") {
    await setState(chatId, "product_search");
    await send(chatId, "🔍 أرسل كلمة البحث:");
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data === "p:bycat") {
    const kb = await pickCategoryKB(uid, "p:filter");
    await send(chatId, "اختر تصنيفاً:", { reply_markup: kb });
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("p:filter:")) {
    const cat = data.split(":")[2];
    await listProducts(chatId, uid, 0, cat === "none" ? undefined : cat);
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("p:edit:")) {
    const [, , field, pid] = data.split(":");
    if (field === "name") { await setState(chatId, `edit_name:${pid}`); await send(chatId, "أرسل الاسم الجديد:"); }
    else if (field === "price") { await setState(chatId, `edit_price:${pid}`); await send(chatId, "أرسل السعر الجديد:"); }
    else if (field === "desc") { await setState(chatId, `edit_desc:${pid}`); await send(chatId, "أرسل الوصف الجديد (أو - للحذف):"); }
    else if (field === "image") { await setState(chatId, `edit_image:${pid}`); await send(chatId, "أرسل الصوره الجديدة:"); }
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("p:toggle:")) {
    const pid = data.split(":")[2];
    const { data: p } = await supabase.from("products").select("is_available").eq("id", pid).eq("user_id", uid).maybeSingle();
    if (p) {
      await supabase.from("products").update({ is_available: !(p.is_available ?? true) }).eq("id", pid).eq("user_id", uid);
      await send(chatId, "✅ تم تحديث الحاله.");
      await showProduct(chatId, uid, pid);
    }
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("p:dup:")) {
    const pid = data.split(":")[2];
    const { data: p } = await supabase.from("products").select("*").eq("id", pid).eq("user_id", uid).maybeSingle();
    if (p) {
      const { id, created_at, ...rest } = p;
      await supabase.from("products").insert({ ...rest, name: `${rest.name} (نسخة)` });
      await send(chatId, "✅ تم نسخ المنتج.");
    }
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("p:del:")) {
    const pid = data.split(":")[2];
    await send(chatId, "هل أنت متأكد من الحذف؟", {
      reply_markup: { inline_keyboard: [[
        { text: "🗑 نعم احذف", callback_data: `p:delok:${pid}` },
        { text: "إلغاء", callback_data: `p:view:${pid}` },
      ]] },
    });
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("p:delok:")) {
    const pid = data.split(":")[2];
    await supabase.from("products").delete().eq("id", pid).eq("user_id", uid);
    await send(chatId, "✅ تم حذف المنتج.", MAIN_KB);
    return new Response(JSON.stringify({ ok: true }));
  }

  // New product category picker
  if (data.startsWith("np:cat:")) {
    const cat = data.split(":")[2];
    const session = await getSession(chatId);
    const np = { ...(session?.data.new_product ?? {}), category_id: cat === "none" ? null : cat };
    await setState(chatId, "add_product:desc", { new_product: np });
    await send(chatId, "📝 أرسل الوصف (أو - للتخطي):");
    return new Response(JSON.stringify({ ok: true }));
  }

  // Categories
  if (data === "c:list") { await listCategories(chatId, uid); return new Response(JSON.stringify({ ok: true })); }
  if (data === "c:add") {
    await setState(chatId, "cat_add:name");
    await send(chatId, "أرسل اسم التصنيف الجديد:");
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("c:view:")) { await viewCategory(chatId, uid, data.split(":")[2]); return new Response(JSON.stringify({ ok: true })); }
  if (data.startsWith("c:rename:")) {
    const cid = data.split(":")[2];
    await setState(chatId, `cat_rename:${cid}`);
    await send(chatId, "أرسل الاسم الجديد:");
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("c:del:")) {
    const cid = data.split(":")[2];
    await send(chatId, "⚠️ سيتم حذف التصنيف. المنتجات لن تُحذف. متأكد؟", {
      reply_markup: { inline_keyboard: [[
        { text: "🗑 نعم", callback_data: `c:delok:${cid}` }, { text: "إلغاء", callback_data: `c:view:${cid}` },
      ]] },
    });
    return new Response(JSON.stringify({ ok: true }));
  }
  if (data.startsWith("c:delok:")) {
    const cid = data.split(":")[2];
    await supabase.from("products").update({ category_id: null }).eq("category_id", cid).eq("user_id", uid);
    await supabase.from("categories").delete().eq("id", cid).eq("user_id", uid);
    await send(chatId, "✅ تم حذف التصنيف.", MAIN_KB);
    await listCategories(chatId, uid);
    return new Response(JSON.stringify({ ok: true }));
  }

  return new Response(JSON.stringify({ ok: true }));
}
