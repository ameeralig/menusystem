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
  discount_percentage?: number;
  original_price?: number;
  is_popular?: boolean;
  is_new?: boolean;
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

    // جلب المنتجات
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, description, category, is_available, discount_percentage, original_price, is_popular, is_new')
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
      if (!productsByCategory[category]) productsByCategory[category] = [];
      productsByCategory[category].push(product as Product);
    });

    let productsText = `معلومات منتجات ${storeName}:\n\n`;
    for (const [category, items] of Object.entries(productsByCategory)) {
      productsText += `📁 ${category}:\n`;
      items.forEach(product => {
        productsText += `  • ${product.name} (ID: ${product.id}) - ${product.price} د.ع`;
        if (product.discount_percentage && product.discount_percentage > 0) {
          productsText += ` [خصم ${product.discount_percentage}% - السعر الأصلي: ${product.original_price}]`;
        }
        if (product.is_popular) productsText += ` [⭐ الأكثر مبيعاً]`;
        if (product.is_new) productsText += ` [🆕 جديد]`;
        if (product.description) productsText += ` (${product.description})`;
        productsText += '\n';
      });
      productsText += '\n';
    }

    const systemPrompt = `أنت ${aiAssistantName}، مساعد مبيعات ذكي ودود لمتجر "${storeName}".

شخصيتك:
- لهجة عراقية ودودة وحميمية
- مثال: "هلا حبيبي 👋 شتدور اليوم؟ قهوة لو شي ثاني؟"
- تتصرف كبائع محترف يساعد الزبون بسرعة
- ردود مختصرة وعملية، لا تطول بالكلام

سلوكك الذكي:
1. إذا قال الزبون "مرحبا" أو أي تحية → رد بحرارة واعرض التصنيفات المتوفرة مع اقتراحات
2. إذا سأل عن منتج → أعطه المعلومات + اقترح منتجات مشابهة
3. إذا طلب الأرخص → رتب المنتجات من الأرخص واعرض أفضل 5
4. إذا طلب الأفضل → اعرض المنتجات الأكثر مبيعاً (is_popular)
5. إذا طلب العروض → اعرض المنتجات التي عليها خصم (discount_percentage > 0)
6. إذا لم تجد نتائج → اقترح بدائل قريبة
7. دائماً اسأل "تحب أضيفه للسلة؟" بعد عرض المنتجات

قاعدة مهمة جداً - استخدام الأدوات:
- عند عرض أي منتج أو مجموعة منتجات، يجب دائماً استدعاء show_product_cards مع IDs المنتجات
- لا تكتفي بذكر المنتجات نصياً، استخدم الأداة ليظهروا ككروت بصرية
- عند الترحيب، اعرض أفضل 3-4 منتجات مبيعاً ككروت

${productsText}

ملاحظات:
- الأسعار بالدينار العراقي فقط
- إذا سأل عن منتج غير موجود، أخبره واقترح بدائل
- اذكر اسمك "${aiAssistantName}" عند التعريف عن نفسك

${externalOrdersEnabled ? `قدرة الطلب:
- يمكن للزبون الطلب عبر رسالة واحدة مثل: "أريد كابتشينو عدد 2 وموقعي المنصور ورقمي 07739912345"
- استخرج المعلومات واستخدم create_order_summary
- إذا نقصت معلومات اطلبها بشكل ودي` : ''}`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const tools: any[] = [
      {
        type: "function",
        function: {
          name: "show_product_cards",
          description: "عرض منتجات ككروت بصرية للزبون. استخدم هذه الأداة دائماً عند ذكر أي منتج أو مجموعة منتجات",
          parameters: {
            type: "object",
            properties: {
              product_ids: {
                type: "array",
                items: { type: "string" },
                description: "قائمة معرفات المنتجات (IDs) لعرضها ككروت"
              }
            },
            required: ["product_ids"]
          }
        }
      }
    ];

    if (externalOrdersEnabled) {
      tools.push(
        {
          type: "function",
          function: {
            name: "add_products_to_cart",
            description: "إضافة منتجات إلى سلة المشتريات",
            parameters: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      product_id: { type: "string" },
                      quantity: { type: "number" }
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
            description: "إنشاء ملخص الطلب النهائي مع بيانات الزبون",
            parameters: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      product_id: { type: "string" },
                      product_name: { type: "string" },
                      quantity: { type: "number" }
                    },
                    required: ["product_id", "product_name", "quantity"]
                  }
                },
                customer_name: { type: "string" },
                customer_phone: { type: "string" },
                customer_address: { type: "string" },
                customer_notes: { type: "string" }
              },
              required: ["products", "customer_phone", "customer_address"]
            }
          }
        }
      );
    }

    const requestBody = {
      model: 'google/gemini-2.5-flash',
      messages,
      max_tokens: 800,
      temperature: 0.7,
      tools
    };

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
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "عذراً، المساعد مشغول حالياً. حاول بعد قليل." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "خدمة المساعد الذكي غير متوفرة حالياً." }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    const choice = aiData.choices[0];
    let assistantMessage = choice.message.content || '';
    let addToCart: any[] = [];
    let orderSummary = null;
    let productIds: string[] = [];

    // معالجة tool calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      for (const toolCall of choice.message.tool_calls) {
        const functionName = toolCall.function.name;
        let args;
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          console.error('Failed to parse tool call args:', toolCall.function.arguments);
          continue;
        }

        if (functionName === 'show_product_cards' && args.product_ids) {
          productIds = [...productIds, ...args.product_ids];
        }
        else if (functionName === 'add_products_to_cart' && args.products) {
          addToCart = args.products.map((p: any) => {
            const product = products?.find((prod: any) => prod.id === p.product_id);
            return product ? { product, quantity: p.quantity } : null;
          }).filter(Boolean);

          const productNames = addToCart.map(item => item.product.name).join('، ');
          if (!assistantMessage) {
            assistantMessage = `تم إضافة ${productNames} إلى سلتك ✅\n\nهل تريد إتمام الطلب؟`;
          }
        }
        else if (functionName === 'create_order_summary') {
          const cartItems: any[] = [];
          let subtotal = 0;
          
          if (args.products && Array.isArray(args.products)) {
            args.products.forEach((p: any) => {
              const product = products?.find((prod: any) => prod.id === p.product_id || prod.name.includes(p.product_name));
              if (product) {
                cartItems.push({ productName: product.name, quantity: p.quantity, price: product.price });
                subtotal += product.price * p.quantity;
              }
            });
          }
          
          orderSummary = {
            items: cartItems,
            customerName: args.customer_name || 'الزبون',
            customerPhone: args.customer_phone,
            customerAddress: args.customer_address,
            customerNotes: args.customer_notes,
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee
          };

          const formatPrice = (price: number) => new Intl.NumberFormat('ar-IQ').format(price);
          const itemsText = cartItems.map((item, i) => `${i + 1}. ${item.productName} × ${item.quantity} = ${formatPrice(item.price * item.quantity)} د.ع`).join('\n');
          
          if (!assistantMessage) {
            assistantMessage = `تمام! تم تجهيز طلبك 🎉\n\n📦 **المنتجات:**\n${itemsText}\n\n💰 المجموع: **${formatPrice(subtotal)}** د.ع\n🚗 التوصيل: **${formatPrice(deliveryFee)}** د.ع\n✨ الإجمالي: **${formatPrice(subtotal + deliveryFee)}** د.ع\n\n📍 ${args.customer_address}\n📱 ${args.customer_phone}\n\nاضغط الزر لإرسال الطلب 👇`;
          }
        }
      }
    }

    if (!assistantMessage) {
      assistantMessage = 'عذراً، لم أتمكن من الرد. حاول مرة ثانية! 🙏';
    }

    // حفظ الرسالة
    try {
      await supabase.from('customer_ai_messages').insert({
        store_owner_id: storeOwnerId,
        message,
        response: assistantMessage
      });
    } catch (logError) {
      console.error('Error logging message:', logError);
    }

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        addToCart: addToCart.length > 0 ? addToCart : undefined,
        orderSummary,
        productIds: productIds.length > 0 ? productIds : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
