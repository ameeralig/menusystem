
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
    const { action, days } = await req.json();

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
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح لك' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من أن المستخدم مصرح له
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح لك' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق مما إذا كان المستخدم لديه صلاحية مسؤول عند طلب بيانات المستخدمين
    if (action === 'get_users') {
      // تحقق من صلاحيات المسؤول
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
      
      // جلب قائمة المستخدمين
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) {
        throw usersError;
      }

      return new Response(
        JSON.stringify({ users }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // معالجة طلب جلب بيانات تسجيلات الدخول
    else if (action === 'get_login_activities') {
      const daysToFetch = days || 30; // استخدام 30 يوم افتراضياً إذا لم يتم تحديد عدد الأيام
      
      // استدعاء الدالة التي أنشأناها في قاعدة البيانات
      const { data: loginActivities, error: loginError } = await supabase.rpc(
        'get_login_activities', 
        { days: daysToFetch }
      );
      
      if (loginError) {
        throw loginError;
      }
      
      return new Response(
        JSON.stringify({ activities: loginActivities }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: 'إجراء غير معروف' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
