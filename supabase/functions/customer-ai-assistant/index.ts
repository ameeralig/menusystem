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
- جميع الأسعار بالدينار العراقي وليس بالريال

قدرة استخراج المعلومات من رسالة واحدة:
- يمكن للزبون إرسال طلب كامل في رسالة واحدة مثل: "أريد بيتزا عدد 2 وموقعي المنصور ورقمي 07739912345 ومافي ملاحظات"
- حلل الرسالة واستخرج: اسم المنتج، الكمية، الموقع/العنوان، رقم الهاتف، الملاحظات
- إذا ذكر الزبون كل المعلومات، استخدم create_order_summary مباشرة
- إذا نقصت معلومات (مثل رقم الهاتف أو العنوان)، اطلبها بشكل ودي`;

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
            description: "إنشاء ملخص الطلب النهائي. استخدم هذا عندما يرسل الزبون رسالة تحتوي على: المنتج والكمية + رقم الهاتف + العنوان. يمكن استخراج كل المعلومات من رسالة واحدة.",
            parameters: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  description: "المنتجات المطلوبة مع الكميات",
                  items: {
                    type: "object",
                    properties: {
                      product_id: { type: "string", description: "معرف المنتج" },
                      product_name: { type: "string", description: "اسم المنتج" },
                      quantity: { type: "number", description: "الكمية" }
                    },
                    required: ["product_id", "product_name", "quantity"]
                  }
                },
                customer_name: { type: "string", description: "اسم الزبون (اختياري)" },
                customer_phone: { type: "string", description: "رقم هاتف الزبون" },
                customer_address: { type: "string", description: "عنوان/موقع الزبون" },
                customer_notes: { type: "string", description: "ملاحظات إضافية (اختياري)" }
              },
              required: ["products", "customer_phone", "customer_address"]
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
        // حساب المنتجات من الأداة
        const cartItems: any[] = [];
        let subtotal = 0;
        
        if (args.products && Array.isArray(args.products)) {
          args.products.forEach((p: any) => {
            const product = products?.find((prod: any) => prod.id === p.product_id || prod.name.includes(p.product_name));
            if (product) {
              const itemTotal = product.price * p.quantity;
              cartItems.push({
                productName: product.name,
                quantity: p.quantity,
                price: product.price
              });
              subtotal += itemTotal;
            }
          });
        }
        
        orderSummary = {
          items: cartItems,
          customerName: args.customer_name || 'الزبون',
          customerPhone: args.customer_phone,
          customerAddress: args.customer_address,
          customerNotes: args.customer_notes,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: subtotal + deliveryFee
        };

        const formatPrice = (price: number) => new Intl.NumberFormat('ar-IQ').format(price);
        let itemsText = cartItems.map((item, i) => `${i + 1}. ${item.productName} × ${item.quantity} = ${formatPrice(item.price * item.quantity)} د.ع`).join('\n');
        
        assistantMessage = `تمام! تم تجهيز طلبك 🎉\n\n📦 المنتجات:\n${itemsText}\n\n💰 المجموع الفرعي: ${formatPrice(subtotal)} د.ع\n🚗 التوصيل: ${formatPrice(deliveryFee)} د.ع\n✨ المجموع النهائي: ${formatPrice(subtotal + deliveryFee)} د.ع\n\n📍 العنوان: ${args.customer_address}\n📱 الهاتف: ${args.customer_phone}${args.customer_notes ? `\n📝 ملاحظات: ${args.customer_notes}` : ''}\n\nاضغط على الزر أدناه لإرسال الطلب للواتساب 👇`;
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
