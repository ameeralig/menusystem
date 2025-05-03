
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'متغيرات البيئة مفقودة' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // إنشاء دالة RPC لوضع علامة "مقروء" على الإشعار
    const markAsReadSql = `
    CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id_param uuid)
    RETURNS void
    SECURITY DEFINER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      UPDATE public.notifications
      SET is_read = true
      WHERE id = notification_id_param 
      AND user_id = auth.uid();
    END;
    $$;
    `;

    // إنشاء دالة RPC لجلب إشعارات المستخدم
    const getUserNotificationsSql = `
    CREATE OR REPLACE FUNCTION get_user_notifications(user_id_param uuid)
    RETURNS SETOF public.notifications
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT * FROM public.notifications
      WHERE user_id = user_id_param
      ORDER BY created_at DESC;
    $$;
    `;
    
    // تنفيذ الإجراءين المخزنين
    const { error: markAsReadError } = await supabase.rpc('exec_sql', {
      sql_query: markAsReadSql
    });
    
    if (markAsReadError) {
      console.error('خطأ في إنشاء دالة وضع علامة مقروء:', markAsReadError);
      throw markAsReadError;
    }
    
    const { error: getUserNotificationsError } = await supabase.rpc('exec_sql', {
      sql_query: getUserNotificationsSql
    });
    
    if (getUserNotificationsError) {
      console.error('خطأ في إنشاء دالة جلب الإشعارات:', getUserNotificationsError);
      throw getUserNotificationsError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'تم إنشاء دوال RPC للإشعارات بنجاح',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('خطأ في تنفيذ وظيفة إعداد دوال الإشعارات:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
