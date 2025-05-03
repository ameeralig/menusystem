
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
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'متغيرات البيئة مفقودة' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    try {
      // التحقق من جدول الإشعارات
      const { data, error } = await supabase.rpc(
        'create_notifications_table_if_not_exists'
      );
      
      if (error) {
        console.error('خطأ في التحقق من جدول الإشعارات:', error);
        throw error;
      }
      
      // إنشاء SQL لفحص وإنشاء الدوال الضرورية
      const checkFunctionSql = `
      -- التحقق مما إذا كانت الدالة موجودة بالفعل
      DO $$
      BEGIN
        -- دالة وضع علامة قراءة على الإشعار
        IF NOT EXISTS (
          SELECT FROM pg_proc 
          WHERE proname = 'mark_notification_as_read'
        ) THEN
          -- إنشاء دالة وضع علامة "مقروء" على الإشعار
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
        END IF;
      END
      $$;
      `;
      
      // تنفيذ SQL لإنشاء الدوال إذا لم تكن موجودة
      const { error: funcError } = await supabase.rpc('exec_sql', {
        sql_query: checkFunctionSql
      });
      
      if (funcError) {
        console.error('خطأ في إنشاء دوال الإشعارات:', funcError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'تم التحقق من جدول الإشعارات بنجاح',
          data
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('خطأ في التحقق من جدول الإشعارات:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('خطأ عام في معالجة الطلب:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
