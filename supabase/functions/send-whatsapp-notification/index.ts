import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const callmebotApiKey = Deno.env.get('CALLMEBOT_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message, type = 'feedback' } = await req.json();
    
    console.log('تم استلام طلب إرسال إشعار WhatsApp:', { userId, type });

    if (!userId || !message) {
      throw new Error('البيانات المطلوبة مفقودة: userId و message');
    }

    // إنشاء عميل Supabase مع مفتاح الخدمة
    const supabase = createClient(supabaseUrl, supabaseKey);

    // الحصول على رقم هاتف المستخدم
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('خطأ في جلب بيانات المستخدم:', profileError);
      throw new Error('لا يمكن الوصول لبيانات المستخدم');
    }

    if (!profile?.phone_number) {
      console.log('لا يوجد رقم هاتف مسجل للمستخدم');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'لا يوجد رقم هاتف مسجل' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // تنسيق الرسالة
    const formattedMessage = encodeURIComponent(`
🔔 *إشعار من متجرك*

${message}

يمكنك مراجعة التفاصيل الكاملة في لوحة التحكم.
    `.trim());

    // إرسال رسالة WhatsApp عبر CallMeBot
    const whatsappUrl = `https://api.callmebot.com/whatsapp.php?phone=${profile.phone_number}&text=${formattedMessage}&apikey=${callmebotApiKey}`;
    
    console.log('إرسال رسالة WhatsApp إلى:', profile.phone_number);
    
    const response = await fetch(whatsappUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'WhatsApp-Notification-Bot'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('فشل في إرسال رسالة WhatsApp:', errorText);
      throw new Error(`فشل في إرسال الإشعار: ${response.status}`);
    }

    const result = await response.text();
    console.log('نتيجة إرسال WhatsApp:', result);

    // إنشاء إشعار في قاعدة البيانات
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type,
        message: `تم إرسال إشعار WhatsApp: ${message.substring(0, 50)}...`,
        is_read: false
      });

    if (notificationError) {
      console.error('خطأ في حفظ الإشعار:', notificationError);
      // لا نرمي خطأ هنا لأن الرسالة تم إرسالها بنجاح
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال الإشعار بنجاح',
        whatsapp_result: result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('خطأ في دالة إرسال WhatsApp:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'حدث خطأ غير متوقع'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});