import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WAWP_TOKEN = Deno.env.get('WAWP_ACCESS_TOKEN')!;
const WAWP_INSTANCE = Deno.env.get('WAWP_INSTANCE_ID')!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// تطبيع رقم الهاتف إلى أرقام فقط مع كود الدولة
function normalizePhone(raw: string): string {
  let p = (raw || '').replace(/\D/g, '');
  if (p.startsWith('00')) p = p.slice(2);
  if (p.startsWith('0')) p = '964' + p.slice(1); // افتراض العراق إذا بدأ بصفر
  return p;
}

function phoneToEmail(phone: string): string {
  return `${phone}@phone.qrmenuc.local`;
}

async function sendWhatsApp(phone: string, message: string) {
  const res = await fetch(`https://wawp.net/api/send?access_token=${WAWP_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instance_id: WAWP_INSTANCE, phone, message, type: 'text' }),
  });
  const txt = await res.text();
  console.log('Wawp response:', res.status, txt);
  return res.ok;
}

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function issueSession(email: string) {
  // إنشاء magic link واستخراج البيانات لتسليمها للعميل لتعيين الجلسة
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (error) throw error;
  const props: any = data?.properties || {};
  return {
    email,
    hashed_token: props.hashed_token,
    verification_type: 'magiclink',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as string;
    const phone = normalizePhone(body.phone || '');

    if (!phone || phone.length < 8) {
      return json({ error: 'رقم هاتف غير صالح' }, 400);
    }

    // ---------- إرسال OTP ----------
    if (action === 'send_otp') {
      const purpose = body.purpose === 'signup' ? 'signup' : 'login';

      // التحقق من توفر الحساب حسب الغرض
      const email = phoneToEmail(phone);
      const { data: existing } = await admin.auth.admin.listUsers();
      const found = existing?.users?.find((u: any) => u.email === email);

      if (purpose === 'login' && !found) {
        return json({ error: 'لا يوجد حساب مرتبط بهذا الرقم' }, 404);
      }
      if (purpose === 'signup' && found) {
        return json({ error: 'هذا الرقم مسجل بالفعل، استخدم تسجيل الدخول' }, 409);
      }

      // منع الإفراط: حذف القديمة + التحقق من آخر إرسال
      const { data: recent } = await admin
        .from('phone_otps')
        .select('created_at')
        .eq('phone', phone)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recent && recent[0]) {
        const ageSec = (Date.now() - new Date(recent[0].created_at).getTime()) / 1000;
        if (ageSec < 45) {
          return json({ error: `يرجى الانتظار ${Math.ceil(45 - ageSec)} ثانية قبل إعادة الإرسال` }, 429);
        }
      }

      const code = genOtp();
      await admin.from('phone_otps').insert({ phone, otp_code: code, purpose });

      const msg = `🔐 رمز التحقق الخاص بك في QRMenuc هو:\n\n*${code}*\n\nصالح لمدة 10 دقائق. لا تشاركه مع أحد.`;
      const sent = await sendWhatsApp(phone, msg);
      if (!sent) {
        return json({ error: 'تعذر إرسال الرمز عبر واتساب' }, 500);
      }
      return json({ success: true, message: 'تم إرسال الرمز عبر واتساب' });
    }

    // ---------- التحقق من OTP ----------
    if (action === 'verify_otp') {
      const otp = String(body.otp || '').trim();
      const purpose = body.purpose === 'signup' ? 'signup' : 'login';

      const { data: otpRow } = await admin
        .from('phone_otps')
        .select('*')
        .eq('phone', phone)
        .eq('purpose', purpose)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!otpRow) return json({ error: 'لم يتم إرسال رمز لهذا الرقم' }, 404);
      if (new Date(otpRow.expires_at) < new Date()) {
        return json({ error: 'انتهت صلاحية الرمز، أعد الإرسال' }, 410);
      }
      if (otpRow.attempts >= 5) {
        return json({ error: 'تجاوزت عدد المحاولات المسموح بها' }, 429);
      }
      if (otpRow.otp_code !== otp) {
        await admin.from('phone_otps').update({ attempts: otpRow.attempts + 1 }).eq('id', otpRow.id);
        return json({ error: 'الرمز غير صحيح' }, 401);
      }

      await admin.from('phone_otps').update({ is_used: true }).eq('id', otpRow.id);

      const email = phoneToEmail(phone);

      if (purpose === 'signup') {
        const fullName = String(body.full_name || '').trim();
        const slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (!fullName) return json({ error: 'الاسم مطلوب' }, 400);
        if (!slug || slug.length < 3) return json({ error: 'اختر معرف متجر صالح (3 أحرف فأكثر)' }, 400);

        // التحقق من توفر slug
        const { data: slugTaken } = await admin
          .from('store_settings')
          .select('user_id')
          .eq('slug', slug)
          .maybeSingle();
        if (slugTaken) return json({ error: 'معرف المتجر مأخوذ، اختر آخر' }, 409);

        // إنشاء المستخدم
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          phone: `+${phone}`,
          user_metadata: { full_name: fullName, phone_number: phone, auth_method: 'phone' },
        });
        if (createErr) return json({ error: createErr.message }, 400);
        const uid = created.user!.id;

        // تحديث الملف الشخصي وإنشاء المتجر
        await admin.from('profiles').upsert({ id: uid, full_name: fullName, phone_number: phone });
        await admin.from('store_settings').insert({ user_id: uid, slug, store_name: fullName });
      }

      const session = await issueSession(email);
      return json({ success: true, ...session });
    }

    return json({ error: 'إجراء غير معروف' }, 400);
  } catch (e: any) {
    console.error('phone-auth error:', e);
    return json({ error: e?.message || 'حدث خطأ' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
