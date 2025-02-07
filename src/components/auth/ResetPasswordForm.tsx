
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/utils/errorHandling";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface ResetPasswordFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ResetPasswordForm = ({ onBack, onSuccess }: ResetPasswordFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOTP] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: null,
      });

      if (error) {
        toast({
          title: "خطأ",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else {
        setShowOTPInput(true);
        toast({
          title: "تم إرسال رمز التحقق",
          description: "يرجى إدخال الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني",
        });
      }
    } catch (err) {
      console.error("Reset password error:", err);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }

    setIsResetting(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });

      if (error) {
        toast({
          title: "خطأ",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم التحقق بنجاح",
          description: "يمكنك الآن تعيين كلمة سر جديدة",
        });
        onSuccess();
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast({
        title: "خطأ",
        description: "حدث خطأ في التحقق من الرمز",
        variant: "destructive",
      });
    }

    setIsResetting(false);
  };

  return (
    <div className="space-y-4">
      {!showOTPInput ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              البريد الإلكتروني
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 text-right"
              dir="rtl"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onBack}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isResetting}>
              {isResetting ? "جاري إرسال الرمز..." : "إرسال رمز التحقق"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOTP(value)}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, idx) => (
                    <InputOTPSlot key={idx} {...slot} />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowOTPInput(false)}>
              رجوع
            </Button>
            <Button type="submit" disabled={isResetting || otp.length !== 6}>
              {isResetting ? "جاري التحقق..." : "تحقق من الرمز"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
