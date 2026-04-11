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
- price: السعر كرقم صحيح فقط (بدون عملة وبدون فواصل)
- category: التصنيف/القسم الذي ينتمي له المنتج
- description: وصف قصير ومغري للمنتج (2-3 جمل) - إذا لم يكن موجوداً في الصورة، أنشئ وصفاً جذاباً

⚠️ تعليمات مهمة جداً للأسعار:
- يجب تحويل جميع الأرقام العربية (٠١٢٣٤٥٦٧٨٩) إلى أرقام إنجليزية (0123456789)
- يجب كتابة السعر كاملاً مع جميع الأصفار. مثال: ١٥٠٠ = 1500 وليس 15
- إذا كان السعر ٢٥٠٠ اكتبه 2500
- إذا كان السعر ٥٠٠ اكتبه 500  
- إذا كان السعر ٧٥٠٠ اكتبه 7500
- لا تحذف أي أصفار من نهاية السعر أبداً
- السعر يجب أن يكون رقم صحيح بدون فواصل عشرية إلا إذا كان السعر الأصلي يحتوي عليها

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
- لا تضف أي نص خارج JSON
- تأكد أن جميع الأسعار أرقام صحيحة وكاملة`;

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

    // تنظيف الأسعار - تحويل الأرقام العربية وإزالة الفواصل
    if (products?.products) {
      products.products = products.products.map((p: any) => {
        if (p.price != null) {
          let priceStr = String(p.price)
            .replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d: string) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
            .replace(/[,،\s]/g, '');
          p.price = parseFloat(priceStr) || 0;
        }
        return p;
      });
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
