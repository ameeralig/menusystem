import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Phone, KeyRound, User, Store, Loader2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "login" | "signup";
type Step = "phone" | "details" | "otp";

interface PhoneAuthFormProps {
  mode: Mode;
}

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

  // إرسال OTP عبر واتساب (لكلٍ من login و signup)
  const sendOtp = async () => {
    const p = phone.replace(/\D/g, "");
    if (p.length < 8) {
      toast({ variant: "destructive", title: "رقم غير صالح", description: "أدخل رقم هاتف صحيح" });
      return false;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("phone-auth", {
        body: { action: "send_otp", phone, purpose: isSignup ? "signup" : "login" },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast({ title: "تم إرسال الرمز", description: "تحقق من رسائل SMS على هاتفك" });
      setStep("otp");
      startResendTimer();
      return true;
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: e.message });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // مرحلة 1 للتسجيل: التحقق من الرقم ثم الانتقال لجمع التفاصيل
  const handlePhoneContinue = () => {
    const p = phone.replace(/\D/g, "");
    if (p.length < 8) {
      toast({ variant: "destructive", title: "رقم غير صالح" });
      return;
    }
    if (isSignup) setStep("details");
    else sendOtp();
  };

  // إرسال OTP بعد جمع تفاصيل التسجيل
  const handleSendSignupOtp = async () => {
    if (!fullName.trim()) {
      toast({ variant: "destructive", title: "الاسم مطلوب" });
      return;
    }
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleanSlug.length < 3) {
      toast({ variant: "destructive", title: "معرف المتجر قصير", description: "3 أحرف إنجليزية على الأقل" });
      return;
    }
    setSlug(cleanSlug);

    // فحص توفر المعرف قبل الإرسال
    setLoading(true);
    try {
      const { data: taken } = await supabase
        .from("store_settings")
        .select("user_id")
        .eq("slug", cleanSlug)
        .maybeSingle();
      if (taken) {
        toast({ variant: "destructive", title: "معرف المتجر مأخوذ", description: "اختر معرفاً آخر" });
        return;
      }
    } finally {
      setLoading(false);
    }

    await sendOtp();
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({ variant: "destructive", title: "أدخل الرمز كاملاً (6 أرقام)" });
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        action: "verify_otp",
        phone,
        otp,
        purpose: isSignup ? "signup" : "login",
      };
      if (isSignup) {
        payload.full_name = fullName;
        payload.slug = slug;
      }

      const { data, error } = await supabase.functions.invoke("phone-auth", { body: payload });
      if (error || data?.error) throw new Error(data?.error || error?.message);

      const { error: vErr } = await supabase.auth.verifyOtp({
        email: data.email,
        token_hash: data.hashed_token,
        type: "magiclink",
      });
      if (vErr) throw vErr;

      toast({ title: "أهلاً بك!", description: isSignup ? "تم إنشاء حسابك بنجاح" : "تم تسجيل الدخول بنجاح" });

      if (isSignup) {
        navigate(`/${slug}`);
        return;
      }

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

  const handleResend = isSignup ? handleSendSignupOtp : sendOtp;

  // ====================== UI ======================
  return (
    <AnimatePresence mode="wait">
      {step === "phone" && (
        <motion.div
          key="phone"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label className="text-foreground/90">رقم الهاتف</Label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                dir="ltr"
                type="tel"
                placeholder="07XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pr-10 text-right h-12 bg-background/40 border-border/50 backdrop-blur"
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MessageCircle className="h-3 w-3 text-emerald-500" />
              سيتم إرسال رمز التحقق عبر SMS
            </p>
          </div>
          <Button
            className="w-full h-12 font-semibold"
            onClick={handlePhoneContinue}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "متابعة"}
          </Button>
        </motion.div>
      )}

      {step === "details" && (
        <motion.div
          key="details"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pr-10 h-12 bg-background/40 border-border/50"
                placeholder="اسمك الكامل"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>معرف المتجر</Label>
            <div className="relative">
              <Store className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                dir="ltr"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className="pr-10 h-12 text-left bg-background/40 border-border/50"
                placeholder="my-store"
              />
            </div>
            <p className="text-xs text-muted-foreground" dir="ltr">
              qrmenuc.com/{slug || "..."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep("phone")}>
              رجوع
            </Button>
            <Button className="flex-1 h-12 font-semibold" onClick={handleSendSignupOtp} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إرسال الرمز"}
            </Button>
          </div>
        </motion.div>
      )}

      {step === "otp" && (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
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
                className="pr-10 h-12 text-center tracking-[0.6em] text-xl font-bold bg-background/40 border-border/50"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              تم إرسال الرمز إلى SMS على الرقم {phone}
            </p>
          </div>
          <Button className="w-full h-12 font-semibold" onClick={handleVerify} disabled={loading || otp.length !== 6}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تأكيد ودخول"}
          </Button>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              className="text-muted-foreground hover:text-primary transition-colors"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
