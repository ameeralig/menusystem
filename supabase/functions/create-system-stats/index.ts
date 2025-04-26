
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
    // السماح فقط بطلبات POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من البيانات المرسلة
    const { action } = await req.json();
    
    if (action !== 'create_system_stats') {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // إنشاء عميل Supabase باستخدام مفتاح الخدمة
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // التحقق من وجود سجل في جدول system_stats
    const { data: existingStats, error: queryError } = await supabase
      .from('system_stats')
      .select('id')
      .limit(1);

    if (queryError) {
      console.error('Error checking system stats:', queryError);
      throw queryError;
    }

    // إذا لم يكن هناك سجل، أنشئ واحداً
    if (!existingStats || existingStats.length === 0) {
      // حساب الإحصائيات الأولية
      const { data: usersCount, error: usersError } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true });

      const { data: storesCount, error: storesError } = await supabase
        .from('store_settings')
        .select('*', { count: 'exact', head: true })
        .not('store_name', 'is', null);

      const { data: viewsData, error: viewsError } = await supabase
        .from('page_views')
        .select('view_count');

      let totalViews = 0;
      if (viewsData) {
        totalViews = viewsData.reduce((sum, item) => sum + (item.view_count || 0), 0);
      }

      // إنشاء سجل جديد مع الإحصائيات المحسوبة
      const { data: insertData, error: insertError } = await supabase
        .from('system_stats')
        .insert([
          {
            total_users: usersCount?.length || 0,
            total_active_stores: storesCount?.length || 0,
            total_page_views: totalViews,
            last_updated: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error('Error creating system stats:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'System stats created successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // إذا كان السجل موجوداً بالفعل
      return new Response(
        JSON.stringify({ success: true, message: 'System stats already exists' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
