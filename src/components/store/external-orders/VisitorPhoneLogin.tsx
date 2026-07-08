import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, KeyRound, Loader2, MessageCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  defaultName?: string;
  defaultPhone?: string;
  onSuccess?: () => void;
}

/**
 * تسجيل دخول الزائر عبر OTP:
 * - يُرسل الرمز على واتساب أولاً ثم SMS كاحتياط
 * - يُنشئ حساب زائر تلقائياً إن لم يكن موجوداً
 */
export default function VisitorPhoneLogin({ defaultName = "", defaultPhone = "", onSuccess }: Props) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(defaultPhone);
  const [fullName, setFullName] = useState(defaultName);
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [via, setVia] = useState<"whatsapp" | "sms">("whatsapp");

  const startResendTimer = () => {
    setResendIn(45);
    const t = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    const p = phone.replace(/\D/g, "");
    if (p.length < 10) {
      toast.error("أدخل الرقم بصيغة صحيحة مثال: 07701234567");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("phone-auth", {
        body: { action: "send_otp", phone, purpose: "visitor" },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setVia(data?.via === "sms" ? "sms" : "whatsapp");
      toast.success(data?.via === "sms" ? "تم إرسال الرمز عبر SMS" : "تم إرسال الرمز عبر واتساب");
      setStep("otp");
      startResendTimer();
    } catch (e: any) {
      toast.error(e.message || "تعذر الإرسال");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return toast.error("أدخل الرمز كاملاً (6 أرقام)");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("phone-auth", {
        body: {
          action: "verify_otp",
          phone,
          otp,
          purpose: "visitor",
          full_name: fullName,
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);

      const { error: vErr } = await supabase.auth.verifyOtp({
        email: data.email,
        token_hash: data.hashed_token,
        type: "magiclink",
      });
      if (vErr) throw vErr;

      toast.success("تم تسجيل الدخول");
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "فشل التحقق");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
      <p className="text-sm font-semibold mb-1">وفّر وقتك في الطلبات القادمة</p>
      <p className="text-xs text-muted-foreground mb-3">سجّل الدخول برقم هاتفك ليتم حفظ بياناتك تلقائياً</p>

      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div>
              <Label className="text-xs">الاسم</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="اسمك الكامل"
                className="mt-1 bg-background"
              />
            </div>
            <div>
              <Label className="text-xs">رقم الهاتف</Label>
              <div className="relative mt-1">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  dir="ltr"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07701234567"
                  className="pr-10 text-right bg-background"
                />
              </div>
              <div className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                <span>
                  أدخل رقمك كاملاً مع الصفر (11 رقم) مثل: <span dir="ltr" className="font-semibold">07701234567</span>.
                  سيصلك الرمز على <span className="font-semibold">واتساب</span> خلال ثوانٍ.
                </span>
              </div>
            </div>
            <Button
              onClick={sendOtp}
              disabled={loading}
              className="w-full"
              size="sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <MessageCircle className="w-4 h-4 ml-1" />
                  إرسال الرمز
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div>
              <Label className="text-xs">أدخل الرمز المرسل ({via === "sms" ? "SMS" : "واتساب"})</Label>
              <div className="relative mt-1">
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="pr-10 text-center tracking-[0.5em] text-lg font-bold bg-background"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1" dir="ltr">
                → {phone}
              </p>
            </div>
            <Button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full"
              size="sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد ودخول"}
            </Button>
            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); }}
                className="text-muted-foreground hover:text-primary"
              >
                تعديل الرقم
              </button>
              <button
                type="button"
                disabled={resendIn > 0 || loading}
                onClick={sendOtp}
                className="text-primary disabled:text-muted-foreground"
              >
                {resendIn > 0 ? `إعادة الإرسال (${resendIn})` : "إعادة إرسال"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
