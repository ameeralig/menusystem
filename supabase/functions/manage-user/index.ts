
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
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get the request body
    const { action, userId } = await req.json();
    
    if (!action || !userId) {
      return new Response(
        JSON.stringify({ error: 'بيانات ناقصة في الطلب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // التحقق من الجلسة الحالية للمستخدم
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح لك' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // التحقق من أن المستخدم مصرح له
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح لك' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // التحقق من أن المستخدم لديه صلاحيات المسؤول
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');
      
    if (roleError || !roleData || roleData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح لك، يجب أن تكون مشرفاً' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // معالجة الطلبات المختلفة
    if (action === 'ban') {
      // حظر المستخدم - تعيين تاريخ انتهاء الحظر إلى سنة من الآن
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      const { error: banError } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: '1y' }
      );
      
      if (banError) {
        throw banError;
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === 'unban') {
      // إلغاء حظر المستخدم
      const { error: unbanError } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: null }
      );
      
      if (unbanError) {
        throw unbanError;
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === 'delete') {
      // حذف المستخدم
      // قبل حذف المستخدم نحذف جميع بياناته من الجداول المختلفة
      try {
        // حذف إعدادات المتجر
        await supabase
          .from('store_settings')
          .delete()
          .eq('user_id', userId);
          
        // حذف المنتجات
        await supabase
          .from('products')
          .delete()
          .eq('user_id', userId);
          
        // حذف صور الفئات
        await supabase
          .from('category_images')
          .delete()
          .eq('user_id', userId);
          
        // حذف مشاهدات الصفحة
        await supabase
          .from('page_views')
          .delete()
          .eq('user_id', userId);
          
        // حذف الدور
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.error("Error deleting user data:", error);
      }
      
      // حذف المستخدم من جدول المصادقة
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // إذا وصلنا هنا فالإجراء غير صالح
    return new Response(
      JSON.stringify({ error: 'إجراء غير صالح' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
