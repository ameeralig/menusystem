import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// إعداد Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const wawpAccessToken = Deno.env.get('WAWP_ACCESS_TOKEN')!;
const wawpInstanceId = Deno.env.get('WAWP_INSTANCE_ID')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// وظيفة لإرسال رسالة واتساب عبر Wawp
async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const response = await fetch(`https://wawp.net/api/send?access_token=${wawpAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instance_id: wawpInstanceId,
        phone: phone,
        message: message
      })
    });
    
    const result = await response.json();
    console.log('Wawp send result:', result);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

// وظيفة للبحث عن المستخدم برقم الهاتف
async function findUserByPhone(phone: string) {
  // تنظيف رقم الهاتف
  const cleanPhone = phone.replace(/\D/g, '');
  
  // محاولة البحث بأشكال مختلفة للرقم
  const phoneVariants = [
    cleanPhone,
    `+${cleanPhone}`,
    cleanPhone.startsWith('966') ? cleanPhone.slice(3) : cleanPhone,
    cleanPhone.startsWith('0') ? cleanPhone.slice(1) : `0${cleanPhone}`,
  ];
  
  for (const phoneVariant of phoneVariants) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, whatsapp_bot_enabled')
      .or(`phone_number.eq.${phoneVariant},phone_number.eq.+${phoneVariant}`)
      .maybeSingle();
    
    if (data) {
      console.log('Found user:', data.id, 'with phone variant:', phoneVariant);
      return data;
    }
  }
  
  return null;
}

// وظيفة لتحليل الرسالة باستخدام الذكاء الاصطناعي
async function parseUserMessage(message: string, userId: string) {
  const systemPrompt = `أنت مساعد ذكي لإدارة متجر إلكتروني عبر واتساب.
مهمتك تحليل رسائل المستخدم وتحديد الإجراء المطلوب.

الإجراءات المتاحة:
1. add_product - إضافة منتج جديد (يتطلب: name, price, category اختياري)
2. update_product - تعديل منتج (يتطلب: product_name, وأي من: new_name, new_price, new_description)
3. delete_product - حذف منتج (يتطلب: product_name)
4. list_products - عرض قائمة المنتجات
5. add_category - إضافة تصنيف (يتطلب: name)
6. list_categories - عرض التصنيفات
7. help - عرض المساعدة
8. unknown - الرسالة غير مفهومة

حلل الرسالة وأرجع الإجراء المطلوب.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'execute_action',
              description: 'تنفيذ الإجراء المحدد بناءً على رسالة المستخدم',
              parameters: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    enum: ['add_product', 'update_product', 'delete_product', 'list_products', 'add_category', 'list_categories', 'help', 'unknown']
                  },
                  params: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      price: { type: 'number' },
                      category: { type: 'string' },
                      product_name: { type: 'string' },
                      new_name: { type: 'string' },
                      new_price: { type: 'number' },
                      new_description: { type: 'string' }
                    }
                  }
                },
                required: ['action']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'execute_action' } }
      })
    });

    if (!response.ok) {
      console.error('AI API error:', response.status, await response.text());
      return { action: 'unknown', params: {} };
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      console.log('Parsed action:', args);
      return args;
    }
    
    return { action: 'unknown', params: {} };
  } catch (error) {
    console.error('Error parsing message:', error);
    return { action: 'unknown', params: {} };
  }
}

// وظيفة تنفيذ الإجراءات
async function executeAction(action: string, params: any, userId: string): Promise<string> {
  switch (action) {
    case 'add_product': {
      if (!params.name || !params.price) {
        return '❌ خطأ: يجب تحديد اسم المنتج وسعره.\n\nمثال: أضف منتج قهوة تركية سعره 15 ريال';
      }
      
      const { error } = await supabase.from('products').insert({
        user_id: userId,
        name: params.name,
        price: params.price,
        category: params.category || null,
        is_available: true
      });
      
      if (error) {
        console.error('Error adding product:', error);
        return '❌ حدث خطأ أثناء إضافة المنتج. حاول مرة أخرى.';
      }
      
      return `✅ تم إضافة المنتج بنجاح!\n\n📦 الاسم: ${params.name}\n💰 السعر: ${params.price} ريال${params.category ? `\n📂 التصنيف: ${params.category}` : ''}`;
    }
    
    case 'update_product': {
      if (!params.product_name) {
        return '❌ خطأ: يجب تحديد اسم المنتج المراد تعديله.';
      }
      
      // البحث عن المنتج
      const { data: product } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', userId)
        .ilike('name', `%${params.product_name}%`)
        .maybeSingle();
      
      if (!product) {
        return `❌ لم يتم العثور على منتج باسم "${params.product_name}"`;
      }
      
      const updates: any = {};
      if (params.new_name) updates.name = params.new_name;
      if (params.new_price) updates.price = params.new_price;
      if (params.new_description) updates.description = params.new_description;
      
      if (Object.keys(updates).length === 0) {
        return '❌ لم تحدد أي تغييرات. حدد الاسم الجديد أو السعر الجديد أو الوصف.';
      }
      
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);
      
      if (error) {
        console.error('Error updating product:', error);
        return '❌ حدث خطأ أثناء تعديل المنتج.';
      }
      
      let updateMsg = `✅ تم تعديل المنتج "${product.name}" بنجاح!\n\n`;
      if (params.new_name) updateMsg += `📦 الاسم الجديد: ${params.new_name}\n`;
      if (params.new_price) updateMsg += `💰 السعر الجديد: ${params.new_price} ريال\n`;
      if (params.new_description) updateMsg += `📝 الوصف الجديد: ${params.new_description}`;
      
      return updateMsg;
    }
    
    case 'delete_product': {
      if (!params.product_name) {
        return '❌ خطأ: يجب تحديد اسم المنتج المراد حذفه.';
      }
      
      const { data: product } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', userId)
        .ilike('name', `%${params.product_name}%`)
        .maybeSingle();
      
      if (!product) {
        return `❌ لم يتم العثور على منتج باسم "${params.product_name}"`;
      }
      
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      
      if (error) {
        console.error('Error deleting product:', error);
        return '❌ حدث خطأ أثناء حذف المنتج.';
      }
      
      return `✅ تم حذف المنتج "${product.name}" بنجاح!`;
    }
    
    case 'list_products': {
      const { data: products } = await supabase
        .from('products')
        .select('name, price, category, is_available')
        .eq('user_id', userId)
        .limit(20);
      
      if (!products || products.length === 0) {
        return '📦 لا يوجد منتجات حالياً.\n\nأضف منتجات عبر إرسال:\nأضف منتج [الاسم] سعره [السعر]';
      }
      
      let msg = `📦 منتجاتك (${products.length}):\n\n`;
      products.forEach((p, i) => {
        msg += `${i + 1}. ${p.name} - ${p.price} ريال`;
        if (p.category) msg += ` (${p.category})`;
        if (!p.is_available) msg += ' [غير متوفر]';
        msg += '\n';
      });
      
      return msg;
    }
    
    case 'add_category': {
      if (!params.name) {
        return '❌ خطأ: يجب تحديد اسم التصنيف.';
      }
      
      const { error } = await supabase.from('category_images').insert({
        user_id: userId,
        category: params.name,
        image_url: ''
      });
      
      if (error) {
        console.error('Error adding category:', error);
        return '❌ حدث خطأ أثناء إضافة التصنيف.';
      }
      
      return `✅ تم إضافة التصنيف "${params.name}" بنجاح!`;
    }
    
    case 'list_categories': {
      const { data: categories } = await supabase
        .from('category_images')
        .select('category')
        .eq('user_id', userId);
      
      if (!categories || categories.length === 0) {
        return '📂 لا يوجد تصنيفات حالياً.\n\nأضف تصنيف عبر إرسال:\nأضف تصنيف [الاسم]';
      }
      
      let msg = `📂 تصنيفاتك (${categories.length}):\n\n`;
      categories.forEach((c, i) => {
        msg += `${i + 1}. ${c.category}\n`;
      });
      
      return msg;
    }
    
    case 'help': {
      return `🤖 *بوت إدارة المتجر*

📌 *الأوامر المتاحة:*

*إضافة منتج:*
أضف منتج [الاسم] سعره [السعر]
مثال: أضف منتج قهوة تركية سعره 15

*تعديل منتج:*
غير سعر [المنتج] إلى [السعر الجديد]
مثال: غير سعر القهوة إلى 20

*حذف منتج:*
احذف منتج [الاسم]
مثال: احذف منتج القهوة

*عرض المنتجات:*
اعرض منتجاتي

*إضافة تصنيف:*
أضف تصنيف [الاسم]
مثال: أضف تصنيف مشروبات ساخنة

*عرض التصنيفات:*
اعرض تصنيفاتي`;
    }
    
    default:
      return '❓ لم أفهم طلبك.\n\nاكتب "مساعدة" لعرض الأوامر المتاحة.';
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Received webhook:', JSON.stringify(body));
    
    // استخراج بيانات الرسالة من Wawp webhook
    const phone = body.phone || body.from || body.sender;
    const message = body.message || body.text || body.body;
    
    if (!phone || !message) {
      console.log('Missing phone or message');
      return new Response(JSON.stringify({ status: 'ignored', reason: 'missing data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Message from ${phone}: ${message}`);
    
    // البحث عن المستخدم
    const user = await findUserByPhone(phone);
    
    if (!user) {
      console.log('User not found for phone:', phone);
      await sendWhatsAppMessage(phone, '❌ رقمك غير مسجل في النظام.\n\nيرجى التسجيل في الموقع وربط رقم هاتفك من الإعدادات.');
      return new Response(JSON.stringify({ status: 'user_not_found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!user.whatsapp_bot_enabled) {
      console.log('WhatsApp bot not enabled for user:', user.id);
      await sendWhatsAppMessage(phone, '❌ بوت واتساب غير مفعل لحسابك.\n\nفعّله من إعدادات حسابك في الموقع.');
      return new Response(JSON.stringify({ status: 'bot_disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // تحليل الرسالة وتنفيذ الإجراء
    const { action, params } = await parseUserMessage(message, user.id);
    console.log('Action:', action, 'Params:', params);
    
    const responseMessage = await executeAction(action, params || {}, user.id);
    
    // إرسال الرد
    await sendWhatsAppMessage(phone, responseMessage);
    
    return new Response(JSON.stringify({ 
      status: 'success',
      action,
      userId: user.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in whatsapp-bot:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
