import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // التحقق من المستخدم
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "غير مصرح" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "غير مصرح" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`بدء حذف حساب المستخدم: ${userId}`);

    // حذف الملفات من التخزين
    const buckets = ["product-images", "store_assets", "banners", "صور التصنيفات", "avatars"];
    
    for (const bucket of buckets) {
      try {
        const { data: files } = await supabase.storage.from(bucket).list(userId);
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${userId}/${f.name}`);
          await supabase.storage.from(bucket).remove(filePaths);
          console.log(`تم حذف ملفات من ${bucket}`);
        }
      } catch (e) {
        console.log(`لا يوجد ملفات في ${bucket} أو خطأ:`, e);
      }
    }

    // حذف البيانات من الجداول بالترتيب الصحيح
    const tables = [
      { table: "order_items", column: null, joinTable: "orders", joinColumn: "store_owner_id" },
      { table: "orders", column: "store_owner_id" },
      { table: "orders", column: "employee_id" },
      { table: "employee_daily_sales", column: "store_owner_id" },
      { table: "employees", column: "store_owner_id" },
      { table: "employees", column: "user_id" },
      { table: "tables", column: "store_owner_id" },
      { table: "feedback", column: "store_owner_id" },
      { table: "ai_messages", column: null, joinTable: "ai_conversations", joinColumn: "user_id" },
      { table: "ai_conversations", column: "user_id" },
      { table: "customer_ai_messages", column: "store_owner_id" },
      { table: "api_keys", column: "user_id" },
      { table: "categories", column: "user_id" },
      { table: "category_images", column: "user_id" },
      { table: "products", column: "user_id" },
      { table: "page_views", column: "user_id" },
      { table: "notifications", column: "user_id" },
      { table: "password_reset_otps", column: "user_id" },
      { table: "store_settings", column: "user_id" },
      { table: "user_roles", column: "user_id" },
      { table: "profiles", column: "id" },
    ];

    for (const { table, column, joinTable, joinColumn } of tables) {
      try {
        if (joinTable && joinColumn) {
          // حذف من جدول مرتبط
          const { data: relatedIds } = await supabase
            .from(joinTable)
            .select("id")
            .eq(joinColumn, userId);
          
          if (relatedIds && relatedIds.length > 0) {
            const ids = relatedIds.map(r => r.id);
            await supabase.from(table).delete().in("order_id", ids);
            console.log(`تم حذف البيانات المرتبطة من ${table}`);
          }
        } else if (column) {
          const { error } = await supabase.from(table).delete().eq(column, userId);
          if (!error) {
            console.log(`تم حذف البيانات من ${table}`);
          }
        }
      } catch (e) {
        console.log(`خطأ في حذف ${table}:`, e);
      }
    }

    // حذف حساب المستخدم من auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error("خطأ في حذف المستخدم:", deleteError);
      throw new Error("فشل في حذف الحساب");
    }

    console.log(`تم حذف حساب المستخدم بنجاح: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "تم حذف الحساب بنجاح" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "حدث خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
