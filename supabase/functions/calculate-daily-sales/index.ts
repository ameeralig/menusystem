import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily sales calculation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // الحصول على التاريخ المستهدف (الأمس بشكل افتراضي)
    const { targetDate } = await req.json().catch(() => ({ targetDate: null }));
    const dateToCalculate = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log('Calculating sales for date:', dateToCalculate);

    // حساب مبيعات الموظفين
    const { data: salesData, error: calcError } = await supabase
      .rpc('calculate_employee_daily_sales', { target_date: dateToCalculate });

    if (calcError) {
      console.error('Error calculating sales:', calcError);
      throw calcError;
    }

    console.log('Sales data calculated:', salesData?.length || 0, 'employees');

    // إدراج أو تحديث السجلات
    let insertedCount = 0;
    let updatedCount = 0;

    for (const sale of salesData || []) {
      // التحقق من وجود سجل لهذا اليوم
      const { data: existing } = await supabase
        .from('employee_daily_sales')
        .select('id')
        .eq('employee_id', sale.employee_id)
        .eq('sale_date', dateToCalculate)
        .single();

      if (existing) {
        // تحديث السجل الموجود
        const { error: updateError } = await supabase
          .from('employee_daily_sales')
          .update({
            total_orders: sale.total_orders,
            total_sales: sale.total_sales,
          })
          .eq('id', existing.id);

        if (!updateError) updatedCount++;
      } else {
        // إدراج سجل جديد
        const { error: insertError } = await supabase
          .from('employee_daily_sales')
          .insert({
            store_owner_id: sale.store_owner_id,
            employee_id: sale.employee_id,
            employee_name: sale.employee_name,
            sale_date: dateToCalculate,
            total_orders: sale.total_orders,
            total_sales: sale.total_sales,
          });

        if (!insertError) insertedCount++;
      }
    }

    console.log(`Inserted: ${insertedCount}, Updated: ${updatedCount}`);

    // حذف السجلات القديمة (أكثر من أسبوع)
    const { data: deletedCount, error: deleteError } = await supabase
      .rpc('cleanup_old_employee_sales');

    if (deleteError) {
      console.error('Error cleaning up old records:', deleteError);
    } else {
      console.log('Deleted old records:', deletedCount);
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: dateToCalculate,
        inserted: insertedCount,
        updated: updatedCount,
        deleted: deletedCount || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in calculate-daily-sales:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
