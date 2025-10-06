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
    console.log('Starting cleanup of old employee sales records...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // حذف السجلات القديمة (أكثر من أسبوع)
    const { data: deletedCount, error: deleteError } = await supabase
      .rpc('cleanup_old_employee_sales');

    if (deleteError) {
      console.error('Error cleaning up old records:', deleteError);
      throw deleteError;
    }

    console.log('Deleted old records:', deletedCount);

    return new Response(
      JSON.stringify({
        success: true,
        deleted: deletedCount || 0,
        message: 'تم حذف السجلات القديمة بنجاح',
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
