
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // مع CORS تعامل طلبات التهيئة
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'الإجراء مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // إنشاء عميل Supabase باستخدام مفتاح الخدمة
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('متغيرات البيئة مفقودة');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // تحقق من مصادقة المستخدم
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (token) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'غير مصرح لك' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // تحقق من أن المستخدم لديه صلاحيات المسؤول إذا كان الإجراء يتطلب ذلك
      if (action === 'get_users') {
        // تحقق من صلاحيات المشرف
        const { data: adminRole, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin');
        
        if (roleError || !adminRole || adminRole.length === 0) {
          return new Response(
            JSON.stringify({ error: 'غير مصرح لك، يجب أن تكون مشرفاً' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // معالجة الإجراء المطلوب
      if (action === 'get_users') {
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
          throw usersError;
        }

        return new Response(
          JSON.stringify({ users }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'إجراء غير معروف' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'رمز المصادقة مطلوب' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('حدث خطأ:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
