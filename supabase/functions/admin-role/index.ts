
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // التعامل مع طلبات CORS المسبقة
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // التحقق من المصادقة
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("غير مصرح");

    // التحقق من أن المستخدم هو مشرف
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError || roleData?.role !== 'admin') {
      throw new Error("يجب أن تكون مشرفًا للقيام بهذه العملية");
    }

    const { email } = await req.json();
    if (!email) throw new Error("عنوان البريد الإلكتروني مطلوب");

    // استخدام مفتاح خدمة Supabase للبحث عن المستخدم
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    
    // البحث عن المستخدم بواسطة البريد الإلكتروني
    const { data: userData, error: userError } = await adminClient.auth.admin.listUsers({
      filter: {
        email: email
      }
    });

    if (userError || !userData.users.length) {
      throw new Error("المستخدم غير موجود");
    }

    const targetUserId = userData.users[0].id;

    // إضافة دور المشرف
    const { error } = await adminClient
      .from('user_roles')
      .upsert({ 
        user_id: targetUserId, 
        role: 'admin' 
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "تم إضافة دور المشرف بنجاح" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "حدث خطأ غير معروف" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
