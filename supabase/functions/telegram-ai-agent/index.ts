// المساعد الذكي لإدارة المنصة عبر Telegram — فهم لغة طبيعية + تنفيذ عبر Tools
import { db, runTool, TOOL_SCHEMAS } from "./tools.ts";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-5.6-sol";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const MAX_HISTORY = 20;
const MAX_STEPS = 6;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت "مدير ذكي" لمنصة QRM Menu، تتكلم باللهجة العراقية الودودة ومختصر بردودك.

مهمتك: تفهم طلب صاحب المتجر بأي لغة (عربي/عراقي/إنجليزي) وتنفّذه عبر الأدوات المتاحة.

قواعد إلزامية:
1) لا تخمّن أبداً أي معلومة ناقصة — اسأل عنها فقط (ما تعيد السؤال عن شي محچي بيه سابقاً).
2) قبل أي تعديل أو حذف: تحقق من وجود العنصر بالبحث أولاً.
3) العمليات الخطرة (حذف منتج/تصنيف/طلب) لازم تأكيد صريح من المستخدم. إذا رجعت الأداة needs_confirmation، اسأل المستخدم "متأكد؟" وانتظر جوابه، وبعد موافقته أعد استدعاء نفس الأداة مع confirmed=true.
4) إذا الأداة رجعت خطأ CategoryNotFound → اعرض عليه إنشاء التصنيف.
   DuplicateProduct → اعرض عليه التعديل بدل الإضافة.
   InvalidDiscount → وضّح أن الخصم بين 0 و100.
   AmbiguousProduct → اعرض الخيارات وخلّه يختار.
5) تقدر تنفّذ أكثر من أمر بالرسالة الوحدة — استدعي عدة أدوات.
6) بعد إنشاء منتج بدون صورة، اعرض على المستخدم يرسل صورة واستخدم request_product_image.
7) اعرض ملخص العملية قبل التنفيذ إذا كانت معقّدة.
8) ردودك قصيرة، فيها إيموجي مناسب، وبتنسيق HTML بسيط (<b> فقط). لا تستخدم Markdown.

اليوم: ${new Date().toISOString().slice(0, 10)}`;

async function callModel(messages: any[]) {
  const r = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning_effort: "none",
      messages,
      tools: TOOL_SCHEMAS,
      tool_choice: "auto",
    }),
  });
  if (!r.ok) {
    const body = await r.text();
    console.error("AI gateway error", r.status, body);
    throw Object.assign(new Error(body), { status: r.status });
  }
  return await r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY غير مضبوط");
    const { chatId, userId, text } = await req.json();
    if (!chatId || !userId || !text) {
      return Response.json({ error: "chatId, userId, text مطلوبة" }, { status: 400, headers: corsHeaders });
    }

    // ذاكرة المحادثة
    const { data: session } = await db
      .from("telegram_bot_sessions")
      .select("ai_history, pending_action")
      .eq("chat_id", chatId)
      .maybeSingle();

    const history: any[] = Array.isArray(session?.ai_history) ? session!.ai_history : [];
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-MAX_HISTORY),
      { role: "user", content: text },
    ];

    let reply = "";
    let awaitingImageFor: string | null = null;

    // حلقة استدعاء الأدوات
    for (let step = 0; step < MAX_STEPS; step++) {
      const data = await callModel(messages);
      const choice = data?.choices?.[0]?.message;
      if (!choice) break;
      messages.push(choice);

      const calls = choice.tool_calls ?? [];
      if (calls.length === 0) {
        reply = choice.content ?? "";
        break;
      }

      for (const call of calls) {
        let args: any = {};
        try { args = JSON.parse(call.function?.arguments || "{}"); } catch { /* ignore */ }
        const result = await runTool(call.function?.name, args, { userId });
        if ((result as any)?.awaiting_image_for) {
          awaitingImageFor = String((result as any).awaiting_image_for);
        }
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }

    if (!reply) reply = "✅ تم التنفيذ.";

    // حفظ الذاكرة (نص فقط، بدون تفاصيل الأدوات الثقيلة)
    const newHistory = [
      ...history,
      { role: "user", content: text },
      { role: "assistant", content: reply },
    ].slice(-MAX_HISTORY);

    await db.from("telegram_bot_sessions").upsert({
      chat_id: chatId,
      ai_history: newHistory,
      pending_action: awaitingImageFor ? { type: "product_image", product_id: awaitingImageFor } : null,
      updated_at: new Date().toISOString(),
    });

    return Response.json({ reply, awaitingImageFor }, { headers: corsHeaders });
  } catch (e: any) {
    const status = e?.status;
    const msg =
      status === 429 ? "⏳ ضغط عالي على المساعد الذكي، جرّب بعد شوية."
      : status === 402 ? "💳 انتهى رصيد الذكاء الاصطناعي. أضف رصيد للاستمرار."
      : "⚠️ صار خطأ بالمساعد الذكي. جرّب مرة ثانية.";
    console.error("telegram-ai-agent", e);
    return Response.json({ reply: msg, error: String(e?.message ?? e) }, { status: 200, headers: corsHeaders });
  }
});
