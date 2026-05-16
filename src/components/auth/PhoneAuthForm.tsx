import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Phone, KeyRound, User, Store, Loader2, MessageCircle, MessageSquare } from "lucide-react";

type Mode = "login" | "signup";
type Step = "phone" | "details" | "otp";

interface PhoneAuthFormProps {
  mode: Mode;
}

// تطبيع الرقم إلى الصيغة الدولية E.164 (افتراض العراق إذا لم يبدأ بكود)
function normalizePhone(raw: string): string {
  let p = (raw || "").replace(/\D/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) p = "964" + p.slice(1);
  return p;
}

export function PhoneAuthForm({ mode }: PhoneAuthFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const isSignup = mode === "signup";

  const startResendTimer = () => {
    setResendIn(45);
    const t = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  // ====== LOGIN: WhatsApp عبر edge function ======
  const handleSendLoginOtp = async () => {
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      toast({ variant: "destructive", title: "رقم غير صالح", description: "أدخل رقم هاتف صحيح" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("phone-auth", {
        body: { action: "send_otp", phone, purpose: "login" },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast({ title: "تم إرسال الرمز", description: "افتح واتساب لمشاهدة رمز التحقق" });
      setStep("otp");
      startResendTimer();
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  // ====== SIGNUP: SMS عبر Supabase Auth ======
  const handleStartSignup = () => {
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      toast({ variant: "destructive", title: "رقم غير صالح" }); return;
    }
    setStep("details");
  };

  const handleSendSignupOtp = async () => {
    if (!fullName.trim()) {
      toast({ variant: "destructive", title: "الاسم مطلوب" }); return;
    }
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleanSlug.length < 3) {
      toast({ variant: "destructive", title: "معرف المتجر قصير", description: "3 أحرف إنجليزية على الأقل" });
      return;
    }
    setSlug(cleanSlug);

    setLoading(true);
    try {
      const e164 = "+" + normalizePhone(phone);
      // فحص توفر المعرّف قبل الإرسال
      const { data: taken } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("slug", cleanSlug)
        .maybeSingle();
      if (taken) throw new Error("معرف المتجر مأخوذ، اختر آخر");

      // إرسال OTP عبر SMS من Supabase Auth (يتطلب تفعيل مزوّد SMS في إعدادات Supabase)
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: {
          channel: "sms",
          data: { full_name: fullName, phone_number: e164, auth_method: "phone" },
        },
      });
      if (error) throw error;

      toast({ title: "تم إرسال الرمز", description: "تحقق من رسائل SMS على هاتفك" });
      setStep("otp");
      startResendTimer();
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({ variant: "destructive", title: "أدخل الرمز كاملاً (6 أرقام)" });
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        // التحقق عبر Supabase Auth SMS
        const e164 = "+" + normalizePhone(phone);
        const { data: vData, error: vErr } = await supabase.auth.verifyOtp({
          phone: e164,
          token: otp,
          type: "sms",
        });
        if (vErr) throw vErr;
        const uid = vData.user?.id;
        if (!uid) throw new Error("فشل إنشاء الجلسة");

        // إنشاء الملف الشخصي والمتجر
        await supabase.from("profiles").upsert({ id: uid, full_name: fullName, phone_number: normalizePhone(phone) });
        const { error: storeErr } = await supabase
          .from("store_settings")
          .insert({ user_id: uid, slug, store_name: fullName });
        if (storeErr) throw storeErr;

        toast({ title: "أهلاً بك!", description: "تم إنشاء حسابك بنجاح" });
        navigate(`/${slug}`);
        return;
      }

      // LOGIN: مسار WhatsApp القديم
      const { data, error } = await supabase.functions.invoke("phone-auth", {
        body: { action: "verify_otp", phone, otp, purpose: "login" },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);

      const { error: vErr } = await supabase.auth.verifyOtp({
        email: data.email,
        token_hash: data.hashed_token,
        type: "magiclink",
      });
      if (vErr) throw vErr;

      toast({ title: "أهلاً بك!", description: "تم تسجيل الدخول بنجاح" });

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: store } = await supabase
          .from("store_settings")
          .select("slug")
          .eq("user_id", userData.user.id)
          .maybeSingle();
        navigate(store?.slug ? `/${store.slug}` : "/");
      } else {
        navigate("/");
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل التحقق", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = isSignup ? handleSendSignupOtp : handleSendLoginOtp;

  // ====================== UI ======================
  if (step === "phone") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">رقم الهاتف</Label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              dir="ltr"
              type="tel"
              placeholder="07XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {isSignup ? (
              <><MessageSquare className="h-3 w-3" /> سيتم إرسال رمز التحقق عبر رسالة SMS</>
            ) : (
              <><MessageCircle className="h-3 w-3" /> سيتم إرسال رمز التحقق عبر واتساب</>
            )}
          </p>
        </div>
        <Button
          className="w-full"
          onClick={isSignup ? handleStartSignup : handleSendLoginOtp}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "متابعة"}
        </Button>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>الاسم الكامل</Label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pr-10" placeholder="اسمك" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>معرف المتجر (subdomain)</Label>
          <div className="relative">
            <Store className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              dir="ltr"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              className="pr-10 text-left"
              placeholder="my-store"
            />
          </div>
          <p className="text-xs text-muted-foreground">سيكون رابط متجرك: qrmenuc.com/{slug || "..."}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setStep("phone")}>رجوع</Button>
          <Button className="flex-1" onClick={handleSendSignupOtp} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إرسال الرمز"}
          </Button>
        </div>
      </div>
    );
  }

  // step === "otp"
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>أدخل رمز التحقق</Label>
        <div className="relative">
          <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            dir="ltr"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="pr-10 text-center tracking-[0.5em] text-lg font-bold"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {isSignup
            ? `تم إرسال الرمز عبر SMS إلى الرقم ${phone}`
            : `تم إرسال الرمز إلى واتساب على الرقم ${phone}`}
        </p>
      </div>
      <Button className="w-full" onClick={handleVerify} disabled={loading || otp.length !== 6}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد ودخول"}
      </Button>
      <div className="flex justify-between text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-primary"
          onClick={() => { setStep(isSignup ? "details" : "phone"); setOtp(""); }}
        >
          تعديل البيانات
        </button>
        <button
          type="button"
          className="text-primary disabled:text-muted-foreground"
          disabled={resendIn > 0 || loading}
          onClick={handleResend}
        >
          {resendIn > 0 ? `إعادة الإرسال (${resendIn})` : "إعادة إرسال الرمز"}
        </button>
      </div>
    </div>
  );
}
