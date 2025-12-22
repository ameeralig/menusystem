import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for AI
const tools = [
  {
    type: "function",
    function: {
      name: "add_product",
      description: "إضافة منتج جديد للمتجر",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "اسم المنتج" },
          price: { type: "number", description: "سعر المنتج" },
          category: { type: "string", description: "تصنيف المنتج" },
          description: { type: "string", description: "وصف المنتج (اختياري)" },
        },
        required: ["name", "price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "تحديث منتج موجود",
      parameters: {
        type: "object",
        properties: {
          product_name: { type: "string", description: "اسم المنتج المراد تعديله" },
          new_name: { type: "string", description: "الاسم الجديد (اختياري)" },
          new_price: { type: "number", description: "السعر الجديد (اختياري)" },
          new_category: { type: "string", description: "التصنيف الجديد (اختياري)" },
          is_available: { type: "boolean", description: "متاح أو غير متاح" },
        },
        required: ["product_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "حذف منتج من المتجر",
      parameters: {
        type: "object",
        properties: {
          product_name: { type: "string", description: "اسم المنتج المراد حذفه" },
        },
        required: ["product_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_products",
      description: "عرض قائمة المنتجات",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "تصفية حسب التصنيف (اختياري)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_category",
      description: "إضافة تصنيف جديد",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "اسم التصنيف" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_categories",
      description: "عرض قائمة التصنيفات",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_category",
      description: "حذف تصنيف",
      parameters: {
        type: "object",
        properties: {
          category_name: { type: "string", description: "اسم التصنيف المراد حذفه" },
        },
        required: ["category_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_stats",
      description: "عرض إحصائيات المتجر",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const { message, from, phoneNumberId } = await req.json();
    
    console.log(`📩 رسالة جديدة من: ${from}`);
    console.log(`📝 المحتوى: ${message}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // تنظيف رقم الهاتف (إزالة + و 00 من البداية)
    const cleanPhone = from.replace(/^\+|^00/, "");
    console.log(`📱 رقم الهاتف المُنظف: ${cleanPhone}`);

    // البحث عن المستخدم برقم الهاتف في جدول profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, phone_number")
      .or(`phone_number.eq.${cleanPhone},phone_number.eq.+${cleanPhone},phone_number.eq.${from}`)
      .maybeSingle();

    console.log("🔍 نتيجة البحث عن المستخدم:", profile, profileError);

    // إذا لم يتم العثور على المستخدم
    if (!profile) {
      console.log("❌ المستخدم غير موجود");
      
      const welcomeMessage = `مرحباً بك في منصة QR Menu! 🎉

يبدو أنك لا تملك حساباً لدينا بعد.

🚀 *مزايا إنشاء حساب:*
• إنشاء قائمة QR رقمية لمتجرك أو مطعمك
• إدارة المنتجات والتصنيفات بسهولة
• الحصول على رابط خاص لمتجرك
• متابعة إحصائيات الزوار
• إدارة متجرك عبر واتساب مباشرة

📲 أنشئ حسابك الآن من خلال:
https://qr-m.lovable.app

بعد إنشاء حسابك، تأكد من إضافة رقم هاتفك في إعدادات الملف الشخصي حتى تتمكن من إدارة متجرك عبر واتساب.`;

      await sendWhatsAppMessage(from, welcomeMessage);
      
      return new Response(JSON.stringify({ 
        success: true, 
        userExists: false,
        message: "User not found, welcome message sent" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // المستخدم موجود - البحث عن إعدادات متجره
    const userId = profile.id;
    const userName = profile.full_name || "صديقي";
    
    console.log(`✅ المستخدم موجود: ${userName} (${userId})`);

    // البحث عن إعدادات المتجر
    const { data: storeSettings } = await supabase
      .from("store_settings")
      .select("store_name, slug")
      .eq("user_id", userId)
      .maybeSingle();

    const storeName = storeSettings?.store_name || "متجرك";
    const storeSlug = storeSettings?.slug;

    console.log(`🏪 المتجر: ${storeName} (${storeSlug})`);

    // التحقق إذا كانت هذه أول رسالة (رسالة ترحيب)
    const isFirstMessage = message.toLowerCase().includes("مرحبا") || 
                          message.toLowerCase().includes("اهلا") ||
                          message.toLowerCase().includes("السلام") ||
                          message.toLowerCase().includes("hi") ||
                          message.toLowerCase().includes("hello") ||
                          message.trim().length < 10;

    if (isFirstMessage) {
      const storeLink = storeSlug ? `\n\n🔗 رابط متجرك:\nhttps://qr-m.lovable.app/store/${storeSlug}` : "";
      
      const welcomeMessage = `مرحباً ${userName}! 👋

أنا مساعدك الذكي لإدارة متجرك *${storeName}* 🏪${storeLink}

🎯 *ما يمكنني مساعدتك به:*

📦 *إدارة المنتجات:*
• أضف منتج [اسم] سعره [سعر]
• عدل سعر [منتج] إلى [سعر جديد]
• احذف [اسم المنتج]
• اعرض منتجاتي

📂 *إدارة التصنيفات:*
• أضف تصنيف [اسم]
• اعرض تصنيفاتي
• احذف تصنيف [اسم]

📊 *الإحصائيات:*
• إحصائياتي

💡 جرب الآن! أرسل أي أمر وسأساعدك.`;

      await sendWhatsAppMessage(from, welcomeMessage);
      
      return new Response(JSON.stringify({ 
        success: true, 
        userExists: true,
        userId,
        message: "Welcome message sent to existing user" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // معالجة الأوامر العادية
    const systemPrompt = `أنت مساعد ذكي لإدارة متجر إلكتروني عبر واتساب.
اسم المستخدم: ${userName}
اسم المتجر: ${storeName}
معرف المستخدم: ${userId}

مهامك:
1. فهم طلبات المستخدم لإدارة المنتجات والتصنيفات
2. استخدام الأدوات المتاحة لتنفيذ الطلبات
3. الرد بشكل ودي ومختصر باللغة العربية
4. استخدام الإيموجي لجعل الردود جذابة

أوامر شائعة:
- "أضف منتج [اسم] سعره [سعر] في تصنيف [تصنيف]"
- "عدل سعر [منتج] إلى [سعر]"
- "احذف [منتج]"
- "اعرض منتجاتي"
- "اعرض تصنيفاتي"
- "إحصائياتي"

عند إضافة منتج بدون تصنيف، استخدم "عام" كتصنيف افتراضي.
الرد يجب أن يكون قصير ومباشر.`;

    // Call AI with tools
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    console.log("AI Response:", JSON.stringify(aiResult, null, 2));

    const assistantMessage = aiResult.choices?.[0]?.message;
    let responseText = "";

    // Check if AI wants to use tools
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`Executing tool: ${functionName}`, args);

        const result = await executeFunction(supabase, userId, functionName, args);
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result),
        });
      }

      // Get final response from AI with tool results
      const finalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
            assistantMessage,
            ...toolResults,
          ],
        }),
      });

      const finalResult = await finalResponse.json();
      responseText = finalResult.choices?.[0]?.message?.content || "تم تنفيذ الأمر ✅";
    } else {
      responseText = assistantMessage?.content || "عذراً، لم أفهم طلبك. جرب:\n• أضف منتج [اسم] سعره [سعر]\n• اعرض منتجاتي\n• اعرض تصنيفاتي";
    }

    // Send response via WhatsApp
    await sendWhatsAppMessage(from, responseText);

    return new Response(JSON.stringify({ success: true, response: responseText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Bot error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Execute database functions
async function executeFunction(supabase: any, userId: string, functionName: string, args: any) {
  switch (functionName) {
    case "add_product": {
      const { name, price, category = "عام", description = "" } = args;
      
      const { data, error } = await supabase
        .from("products")
        .insert({
          user_id: userId,
          name,
          price,
          category,
          description,
          is_available: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Add product error:", error);
        return { success: false, error: error.message };
      }
      return { success: true, product: data };
    }

    case "update_product": {
      const { product_name, new_name, new_price, new_category, is_available } = args;

      // Find product first
      const { data: existingProduct } = await supabase
        .from("products")
        .select("id")
        .eq("user_id", userId)
        .ilike("name", `%${product_name}%`)
        .single();

      if (!existingProduct) {
        return { success: false, error: "المنتج غير موجود" };
      }

      const updates: any = {};
      if (new_name) updates.name = new_name;
      if (new_price !== undefined) updates.price = new_price;
      if (new_category) updates.category = new_category;
      if (is_available !== undefined) updates.is_available = is_available;

      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", existingProduct.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, product: data };
    }

    case "delete_product": {
      const { product_name } = args;

      const { data: existingProduct } = await supabase
        .from("products")
        .select("id, name")
        .eq("user_id", userId)
        .ilike("name", `%${product_name}%`)
        .single();

      if (!existingProduct) {
        return { success: false, error: "المنتج غير موجود" };
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", existingProduct.id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, deletedProduct: existingProduct.name };
    }

    case "list_products": {
      const { category } = args;
      
      let query = supabase
        .from("products")
        .select("name, price, category, is_available")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (category) {
        query = query.ilike("category", `%${category}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, products: data, count: data?.length || 0 };
    }

    case "add_category": {
      const { name } = args;
      
      const { data, error } = await supabase
        .from("category_images")
        .insert({
          user_id: userId,
          category: name,
          image_url: "",
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, category: data };
    }

    case "list_categories": {
      const { data, error } = await supabase
        .from("category_images")
        .select("category")
        .eq("user_id", userId);

      // Also get unique categories from products
      const { data: productCategories } = await supabase
        .from("products")
        .select("category")
        .eq("user_id", userId);

      const allCategories = new Set<string>();
      data?.forEach((c: any) => allCategories.add(c.category));
      productCategories?.forEach((p: any) => {
        if (p.category) allCategories.add(p.category);
      });

      return { success: true, categories: Array.from(allCategories) };
    }

    case "delete_category": {
      const { category_name } = args;

      const { error } = await supabase
        .from("category_images")
        .delete()
        .eq("user_id", userId)
        .ilike("category", `%${category_name}%`);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, deletedCategory: category_name };
    }

    case "get_stats": {
      const { data: products } = await supabase
        .from("products")
        .select("id, price, is_available")
        .eq("user_id", userId);

      const { data: pageViews } = await supabase
        .from("page_views")
        .select("view_count")
        .eq("user_id", userId)
        .single();

      const totalProducts = products?.length || 0;
      const availableProducts = products?.filter((p: any) => p.is_available).length || 0;
      const views = pageViews?.view_count || 0;

      return {
        success: true,
        stats: {
          totalProducts,
          availableProducts,
          unavailableProducts: totalProducts - availableProducts,
          pageViews: views,
        },
      };
    }

    default:
      return { success: false, error: "وظيفة غير معروفة" };
  }
}

// Send WhatsApp message
async function sendWhatsAppMessage(to: string, message: string) {
  const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const result = await response.json();
    console.log("WhatsApp send result:", result);
    return result;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
}
