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

    const { message, conversationId, imageUrl } = await req.json();
    console.log('Received message:', message, 'conversationId:', conversationId, 'imageUrl:', imageUrl);

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
      metadata: imageUrl ? { image_url: imageUrl } : {}
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
        content: `أنت مساعد ذكي ودود لمتجر إلكتروني. 

💬 دورك:
- محاور ممتع وودود يمكنه الحديث في مواضيع عامة
- خبير في تقديم نصائح حول المتجر الإلكتروني
- مستشار لتحسين المبيعات وتنظيم المنتجات

✨ أسلوبك:
- ردود قصيرة وواضحة بالعربية
- استخدم إيموجي بشكل مناسب 🎉
- كن مساعد حقيقي وليس مجرد روبوت
- قدم نصائح عملية عندما يُطلب منك

معرف المستخدم: ${user.id}

ملاحظة: حالياً يمكنني المحادثة وتقديم النصائح فقط. لإضافة/تعديل/حذف المنتجات، يحتاج المستخدم لإضافة رصيد AI.`
      },
      ...(previousMessages || []),
      { role: 'user', content: message }
    ];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // استدعاء Lovable AI للمحادثة البسيطة
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite', // نموذج أرخص
        messages,
        max_tokens: 500, // حد أقصى للرد
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

    // حفظ رد المساعد
    await supabase.from('ai_messages').insert({
      conversation_id: currentConversationId,
      role: 'assistant',
      content: assistantMessage
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