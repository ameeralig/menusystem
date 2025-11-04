import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      throw new Error('Missing API key');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // التحقق من صحة المفتاح
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, permissions, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // تحديث آخر استخدام
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('api_key', apiKey);

    const { action, data } = await req.json();
    const userId = keyData.user_id;
    const permissions = keyData.permissions;

    // معالجة المنتجات
    if (action.startsWith('product_')) {
      if (!permissions.products) {
        throw new Error('No permission for products');
      }

      if (action === 'product_add') {
        const { error } = await supabase
          .from('products')
          .insert({ ...data, user_id: userId });
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: 'تم إضافة المنتج بنجاح' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'product_update') {
        const { id, ...updateData } = data;
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: 'تم تحديث المنتج بنجاح' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'product_delete') {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', data.id)
          .eq('user_id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: 'تم حذف المنتج بنجاح' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'product_list') {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, data: products }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // معالجة التصنيفات
    if (action.startsWith('category_')) {
      if (!permissions.categories) {
        throw new Error('No permission for categories');
      }

      if (action === 'category_add') {
        const { error } = await supabase
          .from('category_images')
          .insert({ ...data, user_id: userId });
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: 'تم إضافة التصنيف بنجاح' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'category_update') {
        const { category, ...updateData } = data;
        const { error } = await supabase
          .from('category_images')
          .update(updateData)
          .eq('category', category)
          .eq('user_id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: 'تم تحديث التصنيف بنجاح' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'category_delete') {
        const { error } = await supabase
          .from('category_images')
          .delete()
          .eq('category', data.category)
          .eq('user_id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, message: 'تم حذف التصنيف بنجاح' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (action === 'category_list') {
        const { data: categories, error } = await supabase
          .from('category_images')
          .select('*')
          .eq('user_id', userId)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, data: categories }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // معالجة الدردشة
    if (action === 'chat') {
      if (!permissions.chat) {
        throw new Error('No permission for chat');
      }

      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite',
          messages: [
            {
              role: 'system',
              content: 'أنت مساعد ذكي لإدارة المتجر الإلكتروني. قدم إجابات قصيرة ومفيدة بالعربية.'
            },
            { role: 'user', content: data.message }
          ],
          max_tokens: 500
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const reply = aiData.choices[0].message.content;

      return new Response(JSON.stringify({ success: true, message: reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
