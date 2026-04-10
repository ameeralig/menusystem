import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const categoryPrompts: Record<string, string> = {
      funny: "كلمات محرجة ومضحكة جداً مثل: حفاضة، شخير، ريحة فم، ضراط، بخاخ إبط، حبوب الشباب، شعر الإبط، قشرة رأس",
      food: "أسماء أكلات شعبية ومشروبات مثل: كنافة، فلافل، شاورما، مندي، كبسة، ملوخية",
      animals: "حيوانات مضحكة أو غريبة مثل: خلد الماء، حرباء، قنفذ، خنفساء، ديك رومي",
      actions: "أفعال محرجة مثل: التجشؤ، الغمز، المشي أثناء النوم، الحديث مع النفس، قضم الأظافر",
      random: "أي شيء عشوائي ومضحك ومحرج - أشياء من الحياة اليومية تخلي الناس يضحكون",
    };

    const prompt = `أنت منشئ كلمات للعبة الامبوستر (مثل لعبة Spyfall).

المطلوب: أنشئ كلمة واحدة فقط باللغة العربية.

الفئة: ${categoryPrompts[category] || categoryPrompts.random}

القواعد:
- الكلمة يجب أن تكون مضحكة أو محرجة بحيث يصعب على الامبوستر تخمينها
- يجب أن تكون كلمة واحدة أو كلمتين فقط (ليست جملة)
- يجب أن تكون معروفة وشائعة
- لا تكرر كلمات سابقة

أعد الكلمة فقط بدون أي شرح أو علامات ترقيم.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "أنت مساعد يولد كلمة واحدة فقط للعبة. أجب بالكلمة فقط." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "payment_required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${status}`);
    }

    const data = await response.json();
    const word = data.choices?.[0]?.message?.content?.trim() || "شاورما";

    return new Response(JSON.stringify({ word }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
