
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/utils/errorHandling";

interface UsePasswordResetProps {
  onSuccess: () => void;
}

export const usePasswordReset = ({ onSuccess }: UsePasswordResetProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
  const [otp, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await supabase.functions.invoke('handle-password-reset', {
        body: { email, action: 'send' }
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
      const { error } = await supabase.functions.invoke('handle-password-reset', {
        body: { email, otp, action: 'verify' }
      });

      if (error) {
        toast({
          title: "خطأ",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else {
        setShowNewPasswordInput(true);
        toast({
          title: "تم التحقق بنجاح",
          description: "يمكنك الآن تعيين كلمة سر جديدة",
        });
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await supabase.functions.invoke('handle-password-reset', {
        body: { email, newPassword, action: 'reset' }
      });

      if (error) {
        toast({
          title: "خطأ",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم تغيير كلمة السر بنجاح",
          description: "يمكنك الآن تسجيل الدخول بكلمة السر الجديدة",
        });
        onSuccess();
      }
    } catch (err) {
      console.error("Password reset error:", err);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تغيير كلمة السر",
        variant: "destructive",
      });
    }

    setIsResetting(false);
  };

  return {
    email,
    setEmail,
    isResetting,
    showOTPInput,
    showNewPasswordInput,
    otp,
    setOTP,
    newPassword,
    setNewPassword,
    handleSendOTP,
    handleVerifyOTP,
    handleResetPassword,
    setShowOTPInput,
    setShowNewPasswordInput
  };
};
