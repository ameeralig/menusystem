
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // معالجة طلب CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // استخراج المعلومات من طلب POST
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'معرف المستخدم (userId) مطلوب' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // إنشاء عميل Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // التحقق من وجود سجل page_views للمستخدم
    const { data: existingRecord, error: selectError } = await supabaseAdmin
      .from('page_views')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('خطأ في البحث عن سجل المشاهدات:', selectError);
      throw selectError;
    }

    // إذا لم يكن هناك سجل، قم بإنشاء واحد
    if (!existingRecord) {
      const { error: insertError } = await supabaseAdmin
        .from('page_views')
        .insert([
          { 
            user_id: userId, 
            view_count: 1, 
            last_viewed_at: new Date().toISOString() 
          }
        ]);

      if (insertError) {
        console.error('خطأ في إضافة سجل المشاهدات:', insertError);
        throw insertError;
      }
    } else {
      // تحديث السجل الموجود
      const { error: updateError } = await supabaseAdmin
        .from('page_views')
        .update({ 
          view_count: existingRecord.view_count + 1,
          last_viewed_at: new Date().toISOString() 
        })
        .eq('id', existingRecord.id);

      if (updateError) {
        console.error('خطأ في تحديث سجل المشاهدات:', updateError);
        throw updateError;
      }
    }

    // إرجاع رد ناجح
    return new Response(
      JSON.stringify({ success: true, message: 'تم زيادة عداد المشاهدات' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('خطأ في معالجة طلب زيادة المشاهدات:', error);
    
    return new Response(
      JSON.stringify({ error: 'حدث خطأ أثناء معالجة الطلب', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
