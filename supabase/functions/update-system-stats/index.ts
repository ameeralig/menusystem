
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
    // التحقق من الطريقة
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // إذا لم يكن هناك سجل، استدعاء وظيفة إنشاء السجل
    if (!existingStats || existingStats.length === 0) {
      const createResponse = await fetch(`${supabaseUrl}/functions/v1/create-system-stats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'create_system_stats' })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create system stats');
      }
    }

    // حساب الإحصائيات الحالية
    const { count: usersCount, error: usersError } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error counting users:', usersError);
    }

    const { count: storesCount, error: storesError } = await supabase
      .from('store_settings')
      .select('*', { count: 'exact', head: true })
      .not('store_name', 'is', null);

    if (storesError) {
      console.error('Error counting stores:', storesError);
    }

    const { data: viewsData, error: viewsError } = await supabase
      .from('page_views')
      .select('view_count');

    if (viewsError) {
      console.error('Error fetching views:', viewsError);
    }

    let totalViews = 0;
    if (viewsData) {
      totalViews = viewsData.reduce((sum, item) => sum + (item.view_count || 0), 0);
    }

    // تحديث الإحصائيات
    const { data: updateData, error: updateError } = await supabase
      .from('system_stats')
      .update({
        total_users: usersCount || 0,
        total_active_stores: storesCount || 0,
        total_page_views: totalViews,
        last_updated: new Date().toISOString()
      })
      .eq('id', existingStats[0].id);

    if (updateError) {
      console.error('Error updating system stats:', updateError);
      throw updateError;
    }

    // جلب الإحصائيات المُحدَّثة
    const { data: updatedStats, error: fetchError } = await supabase
      .from('system_stats')
      .select('*')
      .single();

    if (fetchError) {
      console.error('Error fetching updated stats:', fetchError);
      throw fetchError;
    }

    return new Response(
      JSON.stringify({ success: true, data: updatedStats }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
