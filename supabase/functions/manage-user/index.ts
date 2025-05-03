
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
    const { action, userId, message, messageAll } = requestData;
    
    console.log(`الإجراء المطلوب: ${action}, معرف المستخدم: ${userId}`);
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'الإجراء مطلوب في الطلب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // التحقق من الجلسة الحالية للمستخدم (تخطي هذا الجزء حاليًا للتطوير)
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    // لتبسيط التطوير، نتخطى التحقق من الصلاحيات حاليًا
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
      if (!message && !messageAll) {
        return new Response(
          JSON.stringify({ error: 'نص الرسالة مطلوب' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        // التحقق إذا كانت الرسالة لمستخدم محدد أو لجميع المستخدمين
        if (messageAll) {
          console.log(`إرسال إشعار لجميع المستخدمين: ${messageAll}`);
          
          // الحصول على جميع المستخدمين
          const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
          
          if (usersError) {
            console.error('خطأ في جلب قائمة المستخدمين:', usersError);
            throw usersError;
          }
          
          if (usersData && usersData.users) {
            // إنشاء مصفوفة من الإشعارات لجميع المستخدمين
            const notifications = usersData.users.map(user => ({
              user_id: user.id,
              message: messageAll,
              type: 'admin_message',
              is_read: false
            }));
            
            // إدراج جميع الإشعارات دفعة واحدة
            const { error: batchNotificationError } = await supabase
              .from('notifications')
              .insert(notifications);
              
            if (batchNotificationError) {
              console.error('خطأ في إرسال الإشعارات الجماعية:', batchNotificationError);
              throw batchNotificationError;
            }
            
            return new Response(
              JSON.stringify({ success: true, action: 'message_all', count: notifications.length }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else if (userId) {
          console.log(`إرسال إشعار للمستخدم ${userId}: ${message}`);
          
          // التحقق من وجود جدول الإشعارات
          await checkNotificationsTable(supabase);
          
          // إرسال إشعار لمستخدم محدد
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
      } catch (error) {
        console.error("خطأ في إرسال الإشعار:", error);
        throw error;
      }
    }
    else if (action === 'approve') {
      // الموافقة على حساب المستخدم
      console.log(`تفعيل حساب المستخدم: ${userId}`);
      
      // إضافة سجلات لأغراض التصحيح والمراقبة
      console.log(`جلب بيانات المستخدم الحالية للتحقق من حالته قبل التحديث`);
      
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError) {
        console.error('خطأ في جلب بيانات المستخدم:', userError);
        throw userError;
      }
      
      if (userData && userData.user) {
        console.log(`البيانات الوصفية الحالية للمستخدم:`, JSON.stringify(userData.user.user_metadata || {}, null, 2));
      }
      
      // تحديث حالة حساب المستخدم إلى "active"
      const { data: updateData, error: approveError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          user_metadata: {
            account_status: 'active',
            phone: userData?.user?.user_metadata?.phone || null,
            username: userData?.user?.user_metadata?.username || null
          }
        }
      );
      
      if (approveError) {
        console.error('خطأ في تفعيل حساب المستخدم:', approveError);
        throw approveError;
      }
      
      // سجل تفاصيل التحديث
      console.log(`تم تحديث حالة حساب المستخدم:`, JSON.stringify(updateData || {}, null, 2));
      
      // إضافة إشعار للمستخدم
      try {
        // التحقق من وجود جدول الإشعارات
        await checkNotificationsTable(supabase);
        
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
      } catch (notifyError) {
        // نسجل الخطأ ولكن لا نوقف العملية
        console.warn('خطأ في إرسال إشعار التفعيل:', notifyError);
      }
      
      return new Response(
        JSON.stringify({ success: true, action: 'approve', updated: true }),
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

// دالة للتحقق من وجود جدول الإشعارات وإنشائه إذا لم يكن موجودًا
async function checkNotificationsTable(supabase) {
  try {
    // التحقق من وجود جدول الإشعارات
    const { error } = await supabase.from('notifications').select('id').limit(1);
    
    if (error) {
      console.log('جدول الإشعارات غير موجود، محاولة إنشاءه...');
      
      // هنا يمكن إضافة منطق لإنشاء الجدول إذا كان لديك صلاحيات لذلك
      // ولكن في معظم الحالات، سيكون الجدول موجودًا بالفعل
      
      throw new Error('جدول الإشعارات غير موجود. يرجى إنشاءه أولاً.');
    }
  } catch (error) {
    console.error('خطأ في التحقق من جدول الإشعارات:', error);
    throw error;
  }
}
