import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const wawpAccessToken = Deno.env.get('WAWP_ACCESS_TOKEN')!;
const wawpInstanceId = Deno.env.get('WAWP_INSTANCE_ID')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ========== إرسال رسالة واتساب ==========
async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const response = await fetch(`https://wawp.net/api/send?access_token=${wawpAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instance_id: wawpInstanceId,
        phone,
        message,
      }),
    });
    const result = await response.json();
    console.log('Wawp send result:', result);
    return result;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

// ========== البحث عن المستخدم بالهاتف ==========
async function findUserByPhone(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneVariants = [
    cleanPhone,
    `+${cleanPhone}`,
    cleanPhone.startsWith('966') ? cleanPhone.slice(3) : cleanPhone,
    cleanPhone.startsWith('0') ? cleanPhone.slice(1) : `0${cleanPhone}`,
  ];

  for (const variant of phoneVariants) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, whatsapp_bot_enabled')
      .or(`phone_number.eq.${variant},phone_number.eq.+${variant}`)
      .maybeSingle();
    if (data) {
      console.log('Found user:', data.id, 'with phone variant:', variant);
      return data;
    }
  }
  return null;
}

// ========== إدارة الجلسات ==========
async function getSession(phone: string) {
  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone_number', phone)
    .maybeSingle();
  return data;
}

async function createSession(phone: string, userId: string) {
  // حذف أي جلسة سابقة
  await supabase.from('whatsapp_sessions').delete().eq('phone_number', phone);

  const { data, error } = await supabase.from('whatsapp_sessions').insert({
    phone_number: phone,
    user_id: userId,
    is_authenticated: false,
    auth_attempts: 0,
  }).select().single();

  if (error) console.error('Error creating session:', error);
  return data;
}

async function authenticateSession(phone: string) {
  const { error } = await supabase
    .from('whatsapp_sessions')
    .update({
      is_authenticated: true,
      last_activity_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('phone_number', phone);
  if (error) console.error('Error authenticating session:', error);
}

async function incrementAuthAttempts(phone: string): Promise<number> {
  const session = await getSession(phone);
  const newAttempts = (session?.auth_attempts || 0) + 1;
  await supabase
    .from('whatsapp_sessions')
    .update({ auth_attempts: newAttempts })
    .eq('phone_number', phone);
  return newAttempts;
}

async function updateSessionActivity(phone: string) {
  await supabase
    .from('whatsapp_sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('phone_number', phone);
}

async function deleteSession(phone: string) {
  await supabase.from('whatsapp_sessions').delete().eq('phone_number', phone);
}

function isSessionExpired(session: any): boolean {
  return new Date(session.expires_at) < new Date();
}

// ========== التحقق من كلمة السر ==========
async function verifyPassword(email: string, password: string): Promise<boolean> {
  try {
    // إنشاء Supabase client بدون service role للتحقق من كلمة السر
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const authClient = createClient(supabaseUrl, anonKey);
    
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) return false;
    
    // تسجيل خروج فوري بعد التحقق
    await authClient.auth.signOut();
    return true;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// ========== الحصول على إيميل المستخدم ==========
async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.email || null;
}

// ========== تحليل الرسالة بالذكاء الاصطناعي ==========
async function parseUserMessage(message: string, _userId: string) {
  const systemPrompt = `أنت مساعد ذكي لإدارة متجر إلكتروني عبر واتساب.
مهمتك تحليل رسائل المستخدم وتحديد الإجراء المطلوب.

الإجراءات المتاحة:
1. add_product - إضافة منتج جديد (يتطلب: name, price, category اختياري)
2. update_product - تعديل منتج (يتطلب: product_name, وأي من: new_name, new_price, new_description)
3. delete_product - حذف منتج (يتطلب: product_name)
4. list_products - عرض قائمة المنتجات
5. add_category - إضافة تصنيف (يتطلب: name)
6. list_categories - عرض التصنيفات
7. store_info - عرض معلومات المتجر
8. logout - تسجيل الخروج
9. help - عرض المساعدة
10. unknown - الرسالة غير مفهومة

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
          { role: 'user', content: message },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'execute_action',
            description: 'تنفيذ الإجراء المحدد',
            parameters: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  enum: ['add_product', 'update_product', 'delete_product', 'list_products', 'add_category', 'list_categories', 'store_info', 'logout', 'help', 'unknown'],
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
                    new_description: { type: 'string' },
                  },
                },
              },
              required: ['action'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'execute_action' } },
      }),
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

// ========== تنفيذ الإجراءات ==========
async function executeAction(action: string, params: any, userId: string, phone: string): Promise<string> {
  switch (action) {
    case 'add_product': {
      if (!params.name || !params.price) {
        return '❌ يجب تحديد اسم المنتج وسعره.\n\nمثال: أضف منتج قهوة تركية سعره 15 ريال';
      }
      const { error } = await supabase.from('products').insert({
        user_id: userId,
        name: params.name,
        price: params.price,
        category: params.category || null,
        is_available: true,
      });
      if (error) {
        console.error('Error adding product:', error);
        return '❌ حدث خطأ أثناء إضافة المنتج.';
      }
      return `✅ تم إضافة المنتج!\n\n📦 ${params.name}\n💰 ${params.price} ريال${params.category ? `\n📂 ${params.category}` : ''}`;
    }

    case 'update_product': {
      if (!params.product_name) return '❌ يجب تحديد اسم المنتج المراد تعديله.';
      const { data: product } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', userId)
        .ilike('name', `%${params.product_name}%`)
        .maybeSingle();
      if (!product) return `❌ لم يتم العثور على منتج باسم "${params.product_name}"`;

      const updates: any = {};
      if (params.new_name) updates.name = params.new_name;
      if (params.new_price) updates.price = params.new_price;
      if (params.new_description) updates.description = params.new_description;
      if (Object.keys(updates).length === 0) return '❌ لم تحدد أي تغييرات.';

      const { error } = await supabase.from('products').update(updates).eq('id', product.id);
      if (error) return '❌ حدث خطأ أثناء تعديل المنتج.';

      let msg = `✅ تم تعديل "${product.name}"!\n\n`;
      if (params.new_name) msg += `📦 الاسم: ${params.new_name}\n`;
      if (params.new_price) msg += `💰 السعر: ${params.new_price} ريال\n`;
      if (params.new_description) msg += `📝 الوصف: ${params.new_description}`;
      return msg;
    }

    case 'delete_product': {
      if (!params.product_name) return '❌ يجب تحديد اسم المنتج المراد حذفه.';
      const { data: product } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', userId)
        .ilike('name', `%${params.product_name}%`)
        .maybeSingle();
      if (!product) return `❌ لم يتم العثور على منتج باسم "${params.product_name}"`;

      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) return '❌ حدث خطأ أثناء حذف المنتج.';
      return `✅ تم حذف "${product.name}"!`;
    }

    case 'list_products': {
      const { data: products } = await supabase
        .from('products')
        .select('name, price, category, is_available')
        .eq('user_id', userId)
        .limit(20);
      if (!products || products.length === 0) {
        return '📦 لا يوجد منتجات.\n\nأضف منتجات: أضف منتج [الاسم] سعره [السعر]';
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
      if (!params.name) return '❌ يجب تحديد اسم التصنيف.';
      const { error } = await supabase.from('category_images').insert({
        user_id: userId,
        category: params.name,
        image_url: '',
      });
      if (error) return '❌ حدث خطأ أثناء إضافة التصنيف.';
      return `✅ تم إضافة التصنيف "${params.name}"!`;
    }

    case 'list_categories': {
      const { data: categories } = await supabase
        .from('category_images')
        .select('category')
        .eq('user_id', userId);
      if (!categories || categories.length === 0) {
        return '📂 لا يوجد تصنيفات.\n\nأضف تصنيف: أضف تصنيف [الاسم]';
      }
      let msg = `📂 تصنيفاتك (${categories.length}):\n\n`;
      categories.forEach((c, i) => { msg += `${i + 1}. ${c.category}\n`; });
      return msg;
    }

    case 'store_info': {
      const { data: settings } = await supabase
        .from('store_settings')
        .select('store_name, slug, template, external_orders_enabled')
        .eq('user_id', userId)
        .maybeSingle();
      const { data: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!settings) return '❌ لم يتم العثور على إعدادات المتجر.';
      return `🏪 *معلومات متجرك*\n\n📛 الاسم: ${settings.store_name || 'غير محدد'}\n🔗 الرابط: ${settings.slug || 'غير محدد'}\n📦 عدد المنتجات: ${productCount || 0}\n🛒 الطلبات الخارجية: ${settings.external_orders_enabled ? 'مفعل' : 'معطل'}`;
    }

    case 'logout': {
      await deleteSession(phone);
      return '✅ تم تسجيل الخروج بنجاح!\n\nيمكنك إعادة تسجيل الدخول في أي وقت بمراسلتنا.';
    }

    case 'help': {
      return `🤖 *بوت إدارة المتجر*\n\n📌 *الأوامر:*\n\n• أضف منتج [الاسم] سعره [السعر]\n• غير سعر [المنتج] إلى [السعر]\n• احذف منتج [الاسم]\n• اعرض منتجاتي\n• أضف تصنيف [الاسم]\n• اعرض تصنيفاتي\n• معلومات متجري\n• تسجيل خروج`;
    }

    default:
      return '❓ لم أفهم طلبك.\n\nاكتب "مساعدة" لعرض الأوامر.';
  }
}

// ========== المعالج الرئيسي ==========
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Received webhook:', JSON.stringify(body));

    const phone = body.phone || body.from || body.sender;
    const message = body.message || body.text || body.body;

    if (!phone || !message) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'missing data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Message from ${phone}: ${message}`);
    const cleanPhone = phone.replace(/\D/g, '');

    // تنظيف الجلسات المنتهية
    await supabase.rpc('cleanup_expired_whatsapp_sessions').catch(() => {});

    // 1. البحث عن المستخدم
    const user = await findUserByPhone(phone);
    if (!user) {
      await sendWhatsAppMessage(phone, '❌ رقمك غير مسجل في النظام.\n\nيرجى التسجيل في الموقع وربط رقم هاتفك من الإعدادات.');
      return new Response(JSON.stringify({ status: 'user_not_found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user.whatsapp_bot_enabled) {
      await sendWhatsAppMessage(phone, '❌ بوت واتساب غير مفعل لحسابك.\n\nفعّله من إعدادات حسابك في الموقع.');
      return new Response(JSON.stringify({ status: 'bot_disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. فحص الجلسة
    let session = await getSession(cleanPhone);

    // إذا لا توجد جلسة → إنشاء واحدة وطلب كلمة السر
    if (!session) {
      await createSession(cleanPhone, user.id);
      await sendWhatsAppMessage(phone, `👋 أهلاً ${user.full_name || ''}!\n\n🔐 للتحقق من هويتك، أرسل كلمة مرور حسابك.`);
      return new Response(JSON.stringify({ status: 'awaiting_password' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // إذا الجلسة منتهية → حذف وإعادة إنشاء
    if (isSessionExpired(session)) {
      await deleteSession(cleanPhone);
      await createSession(cleanPhone, user.id);
      await sendWhatsAppMessage(phone, '⏰ انتهت جلستك السابقة.\n\n🔐 أرسل كلمة مرور حسابك لإعادة تسجيل الدخول.');
      return new Response(JSON.stringify({ status: 'session_expired' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. إذا الجلسة غير مصادق عليها → التحقق من كلمة السر
    if (!session.is_authenticated) {
      // فحص عدد المحاولات
      if (session.auth_attempts >= 5) {
        await deleteSession(cleanPhone);
        await sendWhatsAppMessage(phone, '🚫 تم تجاوز عدد المحاولات المسموح.\n\nحاول مرة أخرى بعد قليل.');
        return new Response(JSON.stringify({ status: 'too_many_attempts' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // الحصول على إيميل المستخدم والتحقق من كلمة السر
      const email = await getUserEmail(user.id);
      if (!email) {
        await sendWhatsAppMessage(phone, '❌ خطأ في استرجاع بيانات حسابك.');
        return new Response(JSON.stringify({ status: 'email_not_found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const isValid = await verifyPassword(email, message.trim());
      if (!isValid) {
        const attempts = await incrementAuthAttempts(cleanPhone);
        const remaining = 5 - attempts;
        await sendWhatsAppMessage(phone, `❌ كلمة المرور غير صحيحة.\n\n🔄 المحاولات المتبقية: ${remaining}`);
        return new Response(JSON.stringify({ status: 'wrong_password', remaining }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // كلمة السر صحيحة → تفعيل الجلسة
      await authenticateSession(cleanPhone);
      await sendWhatsAppMessage(phone, `✅ تم تسجيل الدخول بنجاح!\n\n🎉 مرحباً ${user.full_name || ''}!\n\nاكتب "مساعدة" لعرض الأوامر المتاحة.`);
      return new Response(JSON.stringify({ status: 'authenticated', userId: user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. الجلسة مصادق عليها → تنفيذ الأوامر
    await updateSessionActivity(cleanPhone);
    const { action, params } = await parseUserMessage(message, user.id);
    console.log('Action:', action, 'Params:', params);

    const responseMessage = await executeAction(action, params || {}, user.id, cleanPhone);
    await sendWhatsAppMessage(phone, responseMessage);

    return new Response(JSON.stringify({ status: 'success', action, userId: user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in whatsapp-bot:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
