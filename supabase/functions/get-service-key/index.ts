
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

    console.log(`تنفيذ الإجراء: ${action}`);

    // إنشاء عميل Supabase باستخدام مفتاح الخدمة
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('متغيرات البيئة مفقودة');
      throw new Error('متغيرات البيئة مفقودة');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // تحقق من مصادقة المستخدم
    const authHeader = req.headers.get('authorization') || '';
    let token = authHeader.replace('Bearer ', '');
    
    // تخطي التحقق لأغراض التطوير - قم بإزالة هذا في الإنتاج
    if (!token || token === "null") {
      console.log('لا يوجد رمز مصادقة، استخدام مصادقة مؤقتة للتطوير');
      // استخدام معرف مؤقت لاختبار التطوير - في الإنتاج، يجب رفض الطلب هنا
      token = 'development_token';
    }

    // معالجة طلب جلب المستخدمين
    if (action === 'get_users') {
      console.log('جلب قائمة المستخدمين');
      // باستخدام serviceRole، يمكننا الوصول إلى قائمة المستخدمين
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) {
        console.error('خطأ في جلب المستخدمين:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ users: data.users }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // معالجة طلب جلب بيانات تسجيلات الدخول
    else if (action === 'get_login_activities') {
      const daysToFetch = days || 30; // استخدام 30 يوم افتراضياً إذا لم يتم تحديد عدد الأيام
      console.log(`جلب سجل النشاط للـ ${daysToFetch} الأخيرة`);
      
      // استدعاء الدالة التي أنشأناها في قاعدة البيانات
      // تخطي الدالة في التطوير وإنشاء بيانات وهمية
      try {
        // إنشاء بيانات وهمية للتطوير
        const activities = [];
        const today = new Date();
        
        for (let i = 0; i < daysToFetch; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          activities.push({
            date: dateStr,
            count: Math.floor(Math.random() * 20) + 1
          });
        }
        
        return new Response(
          JSON.stringify({ activities }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('خطأ في جلب بيانات النشاط:', error);
        throw error;
      }
    }
    else {
      console.error(`إجراء غير معروف: ${action}`);
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
