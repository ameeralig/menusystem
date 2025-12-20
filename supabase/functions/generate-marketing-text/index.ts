import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, category } = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: 'اسم المنتج مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'مفتاح API غير مُعد' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating marketing text for product: ${productName}, category: ${category || 'غير محدد'}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `أنت كاتب محتوى تسويقي محترف. مهمتك هي كتابة وصف تسويقي قصير جداً وجذاب للمنتجات.

القواعد الصارمة:
- الوصف يجب أن يكون 3 إلى 5 كلمات فقط باللغة العربية
- استخدم كلمات تسويقية قوية ومؤثرة
- اجعل الوصف يثير الرغبة في الشراء
- لا تذكر السعر أو أي أرقام
- لا تستخدم علامات ترقيم أو إيموجي
- أجب بالوصف فقط بدون أي شرح إضافي

أمثلة:
- "قهوة" → "مذاق فاخر لا يُنسى"
- "برجر" → "طعم شهي وإدمان حقيقي"
- "عصير برتقال" → "انتعاش طبيعي ومنعش"
- "كيك شوكولاتة" → "لحظة سعادة لا تُقاوم"`
          },
          { 
            role: "user", 
            content: `اكتب وصف تسويقي قصير (3-5 كلمات فقط) لهذا المنتج:
اسم المنتج: ${productName}
${category ? `التصنيف: ${category}` : ''}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، حاول لاحقاً' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد لحسابك' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const marketingText = data.choices?.[0]?.message?.content?.trim() || '';

    console.log(`Generated marketing text: ${marketingText}`);

    return new Response(
      JSON.stringify({ marketingText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating marketing text:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
