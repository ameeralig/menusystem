
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    // تحقق من أن المستخدم مشرف
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'admin') {
      throw new Error('Not authorized');
    }

    const { action, userId } = await req.json();

    if (!action || !userId) {
      throw new Error('Missing required fields');
    }

    let result;

    switch (action) {
      case 'ban':
        result = await supabaseClient.auth.admin.updateUserById(
          userId,
          { ban_duration: '876000h' } // حظر لمدة 100 سنة
        );
        break;
      case 'unban':
        result = await supabaseClient.auth.admin.updateUserById(
          userId,
          { ban_duration: null }
        );
        break;
      case 'delete':
        // حذف المتجر أولاً لإزالة جميع البيانات المرتبطة
        await supabaseClient
          .from('store_settings')
          .delete()
          .eq('user_id', userId);

        // حذف حساب المستخدم
        result = await supabaseClient.auth.admin.deleteUser(userId);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
})
