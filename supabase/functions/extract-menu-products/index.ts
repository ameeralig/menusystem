import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `أنت خبير في تحليل قوائم الطعام والمنتجات. مهمتك استخراج جميع المنتجات من صورة القائمة (المنيو).

لكل منتج استخرج:
- name: اسم المنتج بالضبط كما هو مكتوب
- price: السعر كرقم فقط (بدون عملة)
- category: التصنيف/القسم الذي ينتمي له المنتج
- description: وصف قصير ومغري للمنتج (2-3 جمل) - إذا لم يكن موجوداً في الصورة، أنشئ وصفاً جذاباً

أرجع النتيجة كـ JSON بالشكل التالي فقط بدون أي نص إضافي:
{
  "products": [
    {
      "name": "اسم المنتج",
      "price": 5000,
      "category": "التصنيف",
      "description": "وصف المنتج"
    }
  ]
}

ملاحظات مهمة:
- استخرج كل المنتجات بدون استثناء
- إذا كان السعر غير واضح اكتب 0
- إذا لم يكن هناك تصنيف واضح، صنف المنتجات بناءً على نوعها
- الوصف يجب أن يكون بالعربية وجذاباً للعملاء
- لا تضف أي نص خارج JSON`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
                },
              },
              {
                type: 'text',
                text: 'استخرج جميع المنتجات من هذه الصورة مع أسعارها وتصنيفاتها ووصف لكل منتج.',
              },
            ],
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'تم تجاوز حد الطلبات، حاول مرة أخرى بعد قليل' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'يرجى إضافة رصيد لاستخدام الذكاء الاصطناعي' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response
    let products;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('فشل في تحليل استجابة الذكاء الاصطناعي');
    }

    return new Response(JSON.stringify(products), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
