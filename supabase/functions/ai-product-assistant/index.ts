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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { message, conversationId, images } = await req.json();
    console.log('Received message:', message, 'conversationId:', conversationId);

    // إنشاء أو الحصول على المحادثة
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('ai_conversations')
        .insert({ user_id: user.id, title: message.substring(0, 50) })
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = newConv.id;
    }

    // حفظ رسالة المستخدم
    await supabase.from('ai_messages').insert({
      conversation_id: currentConversationId,
      role: 'user',
      content: message,
      metadata: images ? { images } : {}
    });

    // جلب آخر 10 رسائل للسياق
    const { data: previousMessages } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    const messages: Message[] = [
      {
        role: 'system',
        content: `أنت مساعد ذكي لإدارة المنتجات في متجر إلكتروني.
معرف المستخدم: ${user.id}

صلاحياتك:
1. إضافة منتجات جديدة - استخدم add_product
2. تعديل المنتجات - استخدم update_product
3. حذف المنتجات - استخدم delete_product

عند استلام طلب:
- استخرج المعلومات بدقة (الاسم، السعر، الوصف، التصنيف)
- السعر يجب أن يكون رقم
- إذا أرسل المستخدم صورة، استخدم رابط الصورة في image_url
- نفذ العملية المطلوبة باستخدام الأداة المناسبة
- أخبر المستخدم بالنتيجة بوضوح

قواعد مهمة:
- الردود بالعربية فقط
- كن واضحاً ومختصراً
- إذا كانت المعلومات ناقصة، اطلبها من المستخدم`
      },
      ...(previousMessages || []),
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
        tools: [
          {
            type: 'function',
            name: 'add_product',
            description: 'إضافة منتج جديد إلى المتجر',
            parameters: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'اسم المنتج' },
                price: { type: 'number', description: 'سعر المنتج' },
                description: { type: 'string', description: 'وصف المنتج' },
                category: { type: 'string', description: 'تصنيف المنتج' },
                image_url: { type: 'string', description: 'رابط صورة المنتج' },
                is_new: { type: 'boolean', description: 'هل المنتج جديد؟' },
                is_popular: { type: 'boolean', description: 'هل المنتج مميز؟' }
              },
              required: ['name', 'price']
            }
          },
          {
            type: 'function',
            name: 'update_product',
            description: 'تعديل منتج موجود',
            parameters: {
              type: 'object',
              properties: {
                product_id: { type: 'string', description: 'معرف المنتج' },
                name: { type: 'string', description: 'اسم المنتج الجديد' },
                price: { type: 'number', description: 'السعر الجديد' },
                description: { type: 'string', description: 'الوصف الجديد' },
                category: { type: 'string', description: 'التصنيف الجديد' },
                image_url: { type: 'string', description: 'رابط الصورة الجديد' },
                is_available: { type: 'boolean', description: 'هل المنتج متاح؟' },
                is_new: { type: 'boolean', description: 'هل المنتج جديد؟' },
                is_popular: { type: 'boolean', description: 'هل المنتج مميز؟' }
              },
              required: ['product_id']
            }
          },
          {
            type: 'function',
            name: 'delete_product',
            description: 'حذف منتج من المتجر',
            parameters: {
              type: 'object',
              properties: {
                product_id: { type: 'string', description: 'معرف المنتج المراد حذفه' }
              },
              required: ['product_id']
            }
          },
          {
            type: 'function',
            name: 'list_products',
            description: 'عرض قائمة المنتجات الموجودة',
            parameters: {
              type: 'object',
              properties: {
                category: { type: 'string', description: 'تصنيف محدد (اختياري)' },
                limit: { type: 'number', description: 'عدد المنتجات المطلوبة' }
              }
            }
          }
        ],
        tool_choice: 'auto'
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    const choice = aiData.choices[0];
    let assistantMessage = choice.message.content || '';
    const toolCalls = choice.message.tool_calls;

    // تنفيذ Function Calls
    if (toolCalls && toolCalls.length > 0) {
      const toolResults = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        console.log('Executing tool:', functionName, 'with args:', args);

        let result;
        try {
          if (functionName === 'add_product') {
            const { data, error } = await supabase
              .from('products')
              .insert({
                user_id: user.id,
                name: args.name,
                price: args.price,
                description: args.description || null,
                category: args.category || null,
                image_url: args.image_url || null,
                is_new: args.is_new || false,
                is_popular: args.is_popular || false,
                is_available: true
              })
              .select()
              .single();

            if (error) throw error;
            result = { success: true, product: data };
            assistantMessage = `✅ تم إضافة المنتج "${args.name}" بنجاح!\nالسعر: ${args.price}\n${args.description ? `الوصف: ${args.description}` : ''}`;

          } else if (functionName === 'update_product') {
            const updateData: any = {};
            if (args.name) updateData.name = args.name;
            if (args.price !== undefined) updateData.price = args.price;
            if (args.description !== undefined) updateData.description = args.description;
            if (args.category !== undefined) updateData.category = args.category;
            if (args.image_url !== undefined) updateData.image_url = args.image_url;
            if (args.is_available !== undefined) updateData.is_available = args.is_available;
            if (args.is_new !== undefined) updateData.is_new = args.is_new;
            if (args.is_popular !== undefined) updateData.is_popular = args.is_popular;

            const { data, error } = await supabase
              .from('products')
              .update(updateData)
              .eq('id', args.product_id)
              .eq('user_id', user.id)
              .select()
              .single();

            if (error) throw error;
            result = { success: true, product: data };
            assistantMessage = `✅ تم تعديل المنتج بنجاح!\n${Object.keys(updateData).map(k => `${k}: ${updateData[k]}`).join('\n')}`;

          } else if (functionName === 'delete_product') {
            const { error } = await supabase
              .from('products')
              .delete()
              .eq('id', args.product_id)
              .eq('user_id', user.id);

            if (error) throw error;
            result = { success: true };
            assistantMessage = `✅ تم حذف المنتج بنجاح!`;

          } else if (functionName === 'list_products') {
            let query = supabase
              .from('products')
              .select('id, name, price, category, is_available')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (args.category) {
              query = query.eq('category', args.category);
            }

            if (args.limit) {
              query = query.limit(args.limit);
            }

            const { data, error } = await query;
            if (error) throw error;

            result = { success: true, products: data };
            assistantMessage = `📦 المنتجات الموجودة (${data.length}):\n\n${data.map((p: any) => 
              `• ${p.name} - ${p.price} (${p.category || 'بدون تصنيف'})`
            ).join('\n')}`;
          }
        } catch (error: any) {
          console.error('Tool execution error:', error);
          result = { success: false, error: error.message };
          assistantMessage = `❌ حدث خطأ: ${error.message}`;
        }

        toolResults.push(result);
      }
    }

    // حفظ رد المساعد
    await supabase.from('ai_messages').insert({
      conversation_id: currentConversationId,
      role: 'assistant',
      content: assistantMessage,
      metadata: toolCalls ? { tool_calls: toolCalls } : {}
    });

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversationId: currentConversationId
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