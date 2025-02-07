import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/utils/errorHandling";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOTP] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(getErrorMessage(signInError));
        toast({
          title: "خطأ في تسجيل الدخول",
          description: getErrorMessage(signInError),
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "جاري تحويلك إلى لوحة التحكم",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى");
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
          description: "يرجى إدخال الرمز المكون من 6 أرقام",
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
        email: resetEmail,
        token: otp,
        type: 'recovery'
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
        setIsResetDialogOpen(false);
        navigate("/auth/reset-password");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-background">
      <div className="w-full max-w-md p-8 bg-white dark:bg-card rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">تسجيل الدخول</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                كلمة المرور
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 text-right"
                dir="rtl"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="link" className="text-sm text-primary hover:text-primary/80">
                نسيت كلمة السر؟
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>إعادة تعيين كلمة السر</AlertDialogTitle>
                <AlertDialogDescription>
                  {!showOTPInput 
                    ? "أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق"
                    : "أدخل رمز التحقق المكون من 6 أرقام"
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              {!showOTPInput ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      البريد الإلكتروني
                    </label>
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="mt-1 text-right"
                      dir="rtl"
                    />
                  </div>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <Button type="submit" disabled={isResetting}>
                      {isResetting ? "جاري إرسال الرمز..." : "إرسال رمز التحقق"}
                    </Button>
                  </AlertDialogFooter>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <InputOTP
                      value={otp}
                      onChange={(value) => setOTP(value)}
                      maxLength={6}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((slot, idx) => (
                            <InputOTPSlot key={idx} {...slot} index={idx} />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                  </div>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel onClick={() => setShowOTPInput(false)}>
                      رجوع
                    </AlertDialogCancel>
                    <Button type="submit" disabled={isResetting || otp.length !== 6}>
                      {isResetting ? "جاري التحقق..." : "تحقق من الرمز"}
                    </Button>
                  </AlertDialogFooter>
                </form>
              )}
            </AlertDialogContent>
          </AlertDialog>

          <button
            onClick={() => navigate("/auth/signup")}
            className="text-sm text-primary hover:text-primary/80"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
