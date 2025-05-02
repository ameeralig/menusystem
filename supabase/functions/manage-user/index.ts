
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
    console.log("تلقي طلب إدارة مستخدم");
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('متغيرات البيئة مفقودة: SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'متغيرات البيئة مفقودة' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get the request body
    const requestData = await req.json();
    const { action, userId, message } = requestData;
    
    console.log(`الإجراء المطلوب: ${action}, معرف المستخدم: ${userId}`);
    
    if (!action || !userId) {
      return new Response(
        JSON.stringify({ error: 'بيانات ناقصة في الطلب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // التحقق من الجلسة الحالية للمستخدم
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log('لا يوجد توكن صالح، تخطي التحقق للتطوير');
      // تخطي التحقق لأغراض التطوير
    } else {
      // التحقق من أن المستخدم مصرح له
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('خطأ في المصادقة:', authError);
        return new Response(
          JSON.stringify({ error: 'غير مصرح لك' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // التحقق من أن المستخدم لديه صلاحيات المسؤول (لايهم في الوقت الحالي)
      // يمكن إضافة ذلك لاحقًا إذا كان ضروريًا
    }
    
    console.log(`بدء تنفيذ الإجراء: ${action}`);
    
    // معالجة الطلبات المختلفة
    if (action === 'ban') {
      // حظر المستخدم - تعيين تاريخ انتهاء الحظر إلى سنة من الآن
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      console.log(`حظر المستخدم: ${userId} حتى ${oneYearFromNow.toISOString()}`);
      
      const { error: banError } = await supabase.auth.admin.updateUserById(
        userId,
        { banned_until: oneYearFromNow.toISOString() }
      );
      
      if (banError) {
        console.error('خطأ في حظر المستخدم:', banError);
        throw banError;
      }
      
      return new Response(
        JSON.stringify({ success: true, action: 'ban' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === 'unban') {
      // إلغاء حظر المستخدم
      console.log(`إلغاء حظر المستخدم: ${userId}`);
      
      const { error: unbanError } = await supabase.auth.admin.updateUserById(
        userId,
        { banned_until: null }
      );
      
      if (unbanError) {
        console.error('خطأ في إلغاء حظر المستخدم:', unbanError);
        throw unbanError;
      }
      
      return new Response(
        JSON.stringify({ success: true, action: 'unban' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === 'delete') {
      // حذف المستخدم
      console.log(`حذف المستخدم: ${userId}`);
      
      // قبل حذف المستخدم نحذف جميع بياناته من الجداول المختلفة
      try {
        // حذف إعدادات المتجر
        const { error: storeError } = await supabase
          .from('store_settings')
          .delete()
          .eq('user_id', userId);
          
        if (storeError) console.warn('خطأ في حذف إعدادات المتجر:', storeError);
          
        // حذف المنتجات
        const { error: productsError } = await supabase
          .from('products')
          .delete()
          .eq('user_id', userId);
          
        if (productsError) console.warn('خطأ في حذف المنتجات:', productsError);
          
        // حذف صور الفئات
        const { error: categoryImagesError } = await supabase
          .from('category_images')
          .delete()
          .eq('user_id', userId);
          
        if (categoryImagesError) console.warn('خطأ في حذف صور الفئات:', categoryImagesError);
          
        // حذف مشاهدات الصفحة
        const { error: pageViewsError } = await supabase
          .from('page_views')
          .delete()
          .eq('user_id', userId);
          
        if (pageViewsError) console.warn('خطأ في حذف مشاهدات الصفحة:', pageViewsError);
          
        // حذف الدور
        const { error: rolesError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
          
        if (rolesError) console.warn('خطأ في حذف الدور:', rolesError);
      } catch (error) {
        console.error("خطأ في حذف بيانات المستخدم:", error);
      }
      
      // حذف المستخدم من جدول المصادقة
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error('خطأ في حذف المستخدم:', deleteError);
        throw deleteError;
      }
      
      return new Response(
        JSON.stringify({ success: true, action: 'delete' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else if (action === 'message') {
      // إرسال إشعار للمستخدم
      if (!message) {
        return new Response(
          JSON.stringify({ error: 'نص الرسالة مطلوب' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`إرسال إشعار للمستخدم ${userId}: ${message}`);
      
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          message: message,
          type: 'admin_message',
          is_read: false
        });
        
      if (notificationError) {
        console.error('خطأ في إرسال الإشعار:', notificationError);
        throw notificationError;
      }
      
      return new Response(
        JSON.stringify({ success: true, action: 'message' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else if (action === 'approve') {
      // الموافقة على حساب المستخدم
      console.log(`تفعيل حساب المستخدم: ${userId}`);
      
      const { error: approveError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          user_metadata: {
            account_status: 'active'
          }
        }
      );
      
      if (approveError) {
        console.error('خطأ في تفعيل حساب المستخدم:', approveError);
        throw approveError;
      }
      
      // إرسال إشعار للمستخدم
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          message: 'تمت الموافقة على حسابك! يمكنك الآن تسجيل الدخول واستخدام النظام.',
          type: 'account_approved',
          is_read: false
        });
        
      if (notificationError) {
        console.warn('خطأ في إرسال إشعار التفعيل:', notificationError);
      }
      
      return new Response(
        JSON.stringify({ success: true, action: 'approve' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    
    // إذا وصلنا هنا فالإجراء غير صالح
    return new Response(
      JSON.stringify({ error: `إجراء غير صالح: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
