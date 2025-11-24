import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, storeOwnerId } = await req.json();
    console.log('Received message:', message, 'storeOwnerId:', storeOwnerId);

    if (!storeOwnerId) {
      throw new Error('Store owner ID is required');
    }

    // جلب المنتجات الخاصة بالمتجر
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, price, description, category, is_available')
      .eq('user_id', storeOwnerId)
      .eq('is_available', true)
      .order('category', { ascending: true });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    // جلب إعدادات المتجر
    const { data: storeSettings } = await supabase
      .from('store_settings')
      .select('store_name')
      .eq('user_id', storeOwnerId)
      .single();

    const storeName = storeSettings?.store_name || 'المتجر';

    // تنظيم المنتجات حسب التصنيف
    const productsByCategory: { [key: string]: any[] } = {};
    products?.forEach(product => {
      const category = product.category || 'أخرى';
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push(product);
    });

    // إنشاء نص يحتوي على معلومات المنتجات
    let productsText = `معلومات منتجات ${storeName}:\n\n`;
    
    for (const [category, items] of Object.entries(productsByCategory)) {
      productsText += `📁 ${category}:\n`;
      items.forEach(product => {
        productsText += `  • ${product.name} - ${product.price} ريال`;
        if (product.description) {
          productsText += ` (${product.description})`;
        }
        productsText += '\n';
      });
      productsText += '\n';
    }

    const messages: Message[] = [
      {
        role: 'system',
        content: `أنت مساعد ذكي ودود لمتجر "${storeName}".

دورك:
- مساعدة الزبائن في البحث عن المنتجات
- تقديم معلومات دقيقة عن الأسعار والتفاصيل
- اقتراح منتجات مناسبة حسب احتياجات الزبون
- الإجابة على الأسئلة بشكل ودي ومفيد

أسلوبك:
- ردود واضحة ومختصرة بالعربية
- استخدم إيموجي مناسب 🎯
- كن ودوداً ومساعداً
- اقترح منتجات بناءً على المنتجات المتوفرة فقط

${productsText}

ملاحظة مهمة: 
- إذا سأل الزبون عن منتج غير موجود في القائمة، أخبره بأنه غير متوفر حالياً واقترح بدائل مشابهة
- إذا سأل عن السعر، استخدم الأسعار الموجودة في القائمة فقط
- إذا كان السؤال عام، اقترح منتجات شائعة أو عروض مميزة`
      },
      { role: 'user', content: message }
    ];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // استدعاء Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    const assistantMessage = aiData.choices[0].message.content || 'عذراً، لم أتمكن من الرد';

    return new Response(
      JSON.stringify({
        message: assistantMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
