
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
    
    // إنشاء دالة SQL لإنشاء جدول الإشعارات إذا لم يكن موجودًا
    const createNotificationsTableSql = `
    CREATE OR REPLACE FUNCTION public.create_notifications_table_if_not_exists()
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- التحقق من وجود الجدول
      IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications'
      ) THEN
        RETURN 'جدول الإشعارات موجود بالفعل';
      ELSE
        -- إنشاء جدول الإشعارات
        CREATE TABLE public.notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'info',
          is_read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        
        -- إضافة سياسة أمان RLS
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        
        -- سياسة للقراءة - يمكن للمستخدمين قراءة إشعاراتهم فقط
        CREATE POLICY "Users can read their own notifications"
        ON public.notifications
        FOR SELECT
        USING (auth.uid() = user_id);
        
        -- سياسة للتحديث - يمكن للمستخدمين تحديث إشعاراتهم فقط
        CREATE POLICY "Users can update their own notifications"
        ON public.notifications
        FOR UPDATE
        USING (auth.uid() = user_id);
        
        RETURN 'تم إنشاء جدول الإشعارات بنجاح';
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN 'حدث خطأ أثناء إنشاء جدول الإشعارات: ' || SQLERRM;
    END;
    $$;
    `;
    
    // تنفيذ إنشاء دالة جدول الإشعارات
    const { error: createFunctionError } = await supabase.rpc('exec_sql', {
      sql_query: createNotificationsTableSql
    });
    
    if (createFunctionError) {
      console.error('خطأ في إنشاء دالة جدول الإشعارات:', createFunctionError);
      throw createFunctionError;
    }
    
    // استدعاء الدالة للتحقق من وجود جدول الإشعارات وإنشائه إذا لزم الأمر
    const { data: tableCheckResult, error: tableCheckError } = await supabase.rpc('create_notifications_table_if_not_exists');
    
    if (tableCheckError) {
      console.error('خطأ في التحقق من جدول الإشعارات:', tableCheckError);
      throw tableCheckError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'تم إنشاء وظائف الإشعارات بنجاح',
        table_result: tableCheckResult
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('خطأ في تنفيذ وظيفة إعداد وظائف الإشعارات:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
