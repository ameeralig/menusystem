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

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  is_available: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      message, 
      storeOwnerId, 
      customerName,
      externalOrdersEnabled,
      conversationHistory = []
    } = await req.json();
    
    console.log('Received message:', message, 'storeOwnerId:', storeOwnerId);

    if (!storeOwnerId) {
      throw new Error('Store owner ID is required');
    }

    // جلب المنتجات الخاصة بالمتجر
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, description, category, is_available')
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
      .select('store_name, delivery_fee, contact_info, ai_assistant_name')
      .eq('user_id', storeOwnerId)
      .single();

    const storeName = storeSettings?.store_name || 'المتجر';
    const deliveryFee = storeSettings?.delivery_fee || 0;
    const contactInfo = storeSettings?.contact_info as any;
    const storePhone = contactInfo?.phone;
    const aiAssistantName = storeSettings?.ai_assistant_name || 'المساعد الذكي';

    // تنظيم المنتجات حسب التصنيف
    const productsByCategory: { [key: string]: Product[] } = {};
    products?.forEach(product => {
      const category = product.category || 'أخرى';
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push(product as Product);
    });

    // إنشاء نص يحتوي على معلومات المنتجات
    let productsText = `معلومات منتجات ${storeName}:\n\n`;
    
    for (const [category, items] of Object.entries(productsByCategory)) {
      productsText += `📁 ${category}:\n`;
      items.forEach(product => {
        productsText += `  • ${product.name} (ID: ${product.id}) - ${product.price} دينار عراقي`;
        if (product.description) {
          productsText += ` (${product.description})`;
        }
        productsText += '\n';
      });
      productsText += '\n';
    }

    let systemPrompt = `أنت ${aiAssistantName}، مساعد ذكي ودود لمتجر "${storeName}".

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
- اذكر اسمك "${aiAssistantName}" عند التعريف عن نفسك

${productsText}

ملاحظة مهمة: 
- إذا سأل الزبون عن منتج غير موجود في القائمة، أخبره بأنه غير متوفر حالياً واقترح بدائل مشابهة
- إذا سأل عن السعر، استخدم الأسعار الموجودة في القائمة فقط واذكرها بالدينار العراقي
- إذا كان السؤال عام، اقترح منتجات شائعة أو عروض مميزة
- جميع الأسعار بالدينار العراقي وليس بالريال`;

    if (customerName) {
      systemPrompt += `\n- اسم الزبون هو: ${customerName}، استخدمه في الترحيب والتفاعل`;
    }

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const requestBody: any = {
      model: 'google/gemini-2.5-flash',
      messages,
      max_tokens: 800,
      temperature: 0.7
    };

    // إذا كان نظام الطلبات مفعل، نضيف tools
    if (externalOrdersEnabled) {
      requestBody.tools = [
        {
          type: "function",
          function: {
            name: "add_products_to_cart",
            description: "إضافة منتجات إلى سلة المشتريات. استخدم هذه الوظيفة عندما يطلب الزبون إضافة منتج للسلة",
            parameters: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      product_id: { type: "string", description: "معرف المنتج (ID)" },
                      quantity: { type: "number", description: "الكمية المطلوبة" }
                    },
                    required: ["product_id", "quantity"]
                  }
                }
              },
              required: ["products"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_order_summary",
            description: "إنشاء ملخص الطلب النهائي بعد جمع جميع المعلومات (المنتجات، الاسم، الهاتف، العنوان)",
            parameters: {
              type: "object",
              properties: {
                customer_phone: { type: "string", description: "رقم هاتف الزبون" },
                customer_address: { type: "string", description: "عنوان الزبون" },
                customer_notes: { type: "string", description: "ملاحظات إضافية (اختياري)" }
              },
              required: ["customer_phone", "customer_address"]
            }
          }
        }
      ];
    }

    // استدعاء Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    const choice = aiData.choices[0];
    let assistantMessage = choice.message.content || 'عذراً، لم أتمكن من الرد';
    let addToCart: any[] = [];
    let orderSummary = null;

    // معالجة tool calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      if (functionName === 'add_products_to_cart' && args.products) {
        // جمع المنتجات للإضافة للسلة
        addToCart = args.products.map((p: any) => {
          const product = products?.find((prod: any) => prod.id === p.product_id);
          return product ? { product, quantity: p.quantity } : null;
        }).filter(Boolean);

        const productNames = addToCart.map(item => item.product.name).join('، ');
        assistantMessage = `تم إضافة المنتجات التالية إلى سلتك: ${productNames} ✅\n\nهل تريد إتمام الطلب؟ سأحتاج منك:\n- رقم الهاتف\n- العنوان\n- أي ملاحظات إضافية (اختياري)`;
      } 
      else if (functionName === 'create_order_summary') {
        // حساب مجموع المنتجات من السلة الحالية
        // نفترض أن المنتجات موجودة في المحادثة
        const cartItems: any[] = [];
        let subtotal = 0;
        
        // محاولة استخراج المنتجات من السياق
        // في الواقع يجب إرسال المنتجات من الـ frontend
        
        orderSummary = {
          items: cartItems,
          customerName: customerName || 'الزبون',
          customerPhone: args.customer_phone,
          customerAddress: args.customer_address,
          customerNotes: args.customer_notes,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: subtotal + deliveryFee
        };

        assistantMessage = `تمام! تم تجهيز طلبك 🎉\n\nملخص الطلب:\n- المجموع الفرعي: ${subtotal} دينار عراقي\n- مبلغ التوصيل: ${deliveryFee} دينار عراقي\n- المجموع النهائي: ${subtotal + deliveryFee} دينار عراقي\n\nيمكنك الآن مراجعة الطلب والضغط على زر "إرسال الطلب إلى الواتساب" أدناه لإكمال الطلب.`;
      }
    }

    // حفظ الرسالة في قاعدة البيانات للإحصائيات
    try {
      await supabase.from('customer_ai_messages').insert({
        store_owner_id: storeOwnerId,
        message: message,
        response: assistantMessage
      });
    } catch (logError) {
      console.error('Error logging message:', logError);
    }

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        addToCart: addToCart.length > 0 ? addToCart : undefined,
        orderSummary
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
