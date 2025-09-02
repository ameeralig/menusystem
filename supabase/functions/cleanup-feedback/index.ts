import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('بدء عملية تنظيف الملاحظات المحلولة القديمة...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('متغيرات البيئة المطلوبة غير متوفرة');
    }

    // إنشاء عميل Supabase باستخدام Service Role Key للصلاحيات الكاملة
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // استدعاء دالة تنظيف الملاحظات القديمة
    const { data, error } = await supabase.rpc('cleanup_old_resolved_feedback');

    if (error) {
      console.error('خطأ في تنظيف الملاحظات:', error);
      throw error;
    }

    const deletedCount = data || 0;
    console.log(`تم حذف ${deletedCount} ملاحظة محلولة قديمة`);

    // إرجاع النتيجة
    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        message: `تم حذف ${deletedCount} ملاحظة محلولة قديمة بنجاح`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('خطأ في دالة تنظيف الملاحظات:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});