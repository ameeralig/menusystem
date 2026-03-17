import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { playerNames, difficulty, theme } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!playerNames || playerNames.length < 3) {
      return new Response(JSON.stringify({ error: "يجب إدخال 3 لاعبين على الأقل" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const themeMap: Record<string, string> = {
      modern: "عصري حديث - في مدينة معاصرة",
      historical: "تاريخي - في حقبة زمنية قديمة",
      horror: "رعب وغموض - أجواء مخيفة ومشوقة",
      funny: "كوميدي مضحك - مواقف طريفة وساخرة",
      random: "عشوائي مفاجئ",
    };

    const difficultyMap: Record<string, string> = {
      easy: "سهل - أدلة واضحة والحل بسيط",
      medium: "متوسط - بعض الأدلة المضللة",
      hard: "صعب - أدلة مضللة كثيرة وتقلبات درامية",
    };

    const systemPrompt = `أنت مُولّد قصص ألعاب تحقيق جنائي احترافي باللغة العربية.
مهمتك: إنشاء لعبة تحقيق جماعية ممتعة بعنوان "من هو المجرم؟"

القواعد الحاسمة:
- لاعب واحد فقط هو المجرم
- لا تجعل المجرم واضحاً جداً
- لا تجعل الحل مستحيلاً
- اجعل كل لاعب مشاركاً بالقصة
- أضف تقلبات درامية
- استخدم لغة عربية بسيطة وممتعة
- أجب بصيغة JSON فقط بدون أي نص إضافي`;

    const userPrompt = `أنشئ لعبة تحقيق جنائي بالمواصفات التالية:
- عدد اللاعبين: ${playerNames.length}
- أسماء اللاعبين: ${playerNames.join("، ")}
- مستوى الصعوبة: ${difficultyMap[difficulty] || difficultyMap.medium}
- الثيم: ${themeMap[theme] || themeMap.random}

أرجع النتيجة بصيغة JSON التالية فقط:
{
  "story": {
    "title": "عنوان القصة",
    "setting": "المكان والزمان",
    "background": "خلفية القصة (3-4 جمل)",
    "crime": "وصف الجريمة"
  },
  "players": [
    {
      "name": "اسم اللاعب",
      "role": "criminal أو innocent",
      "private_story": "قصته الخاصة (جملتين)",
      "secret": "سره المخفي",
      "clues": ["دليل 1", "دليل 2"]
    }
  ],
  "shared_clues": ["دليل مشترك 1", "دليل مشترك 2", "دليل مشترك 3", "دليل مشترك 4"],
  "solution": {
    "criminal": "اسم المجرم",
    "explanation": "شرح منطقي كامل للجريمة"
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول مرة أخرى لاحقاً" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يجب إضافة رصيد للمتابعة" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    let gameData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        gameData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      return new Response(JSON.stringify({ error: "فشل في تحليل القصة، حاول مرة أخرى" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(gameData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
