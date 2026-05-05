import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Phone, KeyRound, User, Store, Loader2, MessageCircle } from "lucide-react";

type Mode = "login" | "signup";
type Step = "phone" | "details" | "otp";

interface PhoneAuthFormProps {
  mode: Mode;
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

  const startResendTimer = () => {
    setResendIn(45);
    const t = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      toast({ variant: "destructive", title: "رقم غير صالح", description: "أدخل رقم هاتف صحيح" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("phone-auth", {
        body: { action: "send_otp", phone, purpose: mode },
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
    await handleSendOtp();
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({ variant: "destructive", title: "أدخل الرمز كاملاً (6 أرقام)" });
      return;
    }
    setLoading(true);
    try {
      const payload: any = { action: "verify_otp", phone, otp, purpose: mode };
      if (mode === "signup") { payload.full_name = fullName; payload.slug = slug; }

      const { data, error } = await supabase.functions.invoke("phone-auth", { body: payload });
      if (error || data?.error) throw new Error(data?.error || error?.message);

      // إنشاء جلسة باستخدام hashed_token (verifyOtp)
      const { error: vErr } = await supabase.auth.verifyOtp({
        email: data.email,
        token_hash: data.hashed_token,
        type: "magiclink",
      });
      if (vErr) throw vErr;

      toast({ title: "أهلاً بك!", description: "تم تسجيل الدخول بنجاح" });

      if (mode === "signup") {
        navigate(`/${slug}`);
      } else {
        // البحث عن متجر المستخدم
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
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل التحقق", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  // ====================== UI ======================
  if (step === "phone") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">رقم الهاتف (واتساب)</Label>
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
            <MessageCircle className="h-3 w-3" /> سيتم إرسال رمز التحقق عبر واتساب
          </p>
        </div>
        <Button
          className="w-full"
          onClick={mode === "signup" ? handleStartSignup : handleSendOtp}
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
          تم إرسال الرمز إلى واتساب على الرقم {phone}
        </p>
      </div>
      <Button className="w-full" onClick={handleVerify} disabled={loading || otp.length !== 6}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد ودخول"}
      </Button>
      <div className="flex justify-between text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-primary"
          onClick={() => { setStep(mode === "signup" ? "details" : "phone"); setOtp(""); }}
        >
          تعديل البيانات
        </button>
        <button
          type="button"
          className="text-primary disabled:text-muted-foreground"
          disabled={resendIn > 0 || loading}
          onClick={handleSendOtp}
        >
          {resendIn > 0 ? `إعادة الإرسال (${resendIn})` : "إعادة إرسال الرمز"}
        </button>
      </div>
    </div>
  );
}
