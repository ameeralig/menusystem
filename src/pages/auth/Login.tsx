import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Alert } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError) => {
    console.log("Error details:", error);

    if (error.message.includes("Email logins are disabled")) {
      return "تسجيل الدخول بالبريد الإلكتروني معطل حالياً. يرجى التواصل مع مسؤول النظام.";
    }
    
    if (error.message.includes("Invalid login credentials")) {
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    }

    if (error.message.includes("Email not confirmed")) {
      return "لم يتم تأكيد البريد الإلكتروني بعد. يرجى التحقق من بريدك الإلكتروني والضغط على رابط التأكيد.";
    }

    return error.message;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Attempting login with email:", email);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      console.log("Login response:", { data, error: signInError });

      if (signInError) {
        setError(getErrorMessage(signInError));
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول",
          description: getErrorMessage(signInError),
        });
      } else if (data.user) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بعودتك!",
        });
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h2>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 text-right"
                dir="rtl"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                كلمة المرور
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 text-right"
                dir="rtl"
                placeholder="أدخل كلمة المرور"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>

          <p className="mt-4 text-sm text-gray-600 text-center">
            ليس لديك حساب؟{" "}
            <button
              onClick={() => navigate("/auth/signup")}
              className="font-medium text-primary hover:text-primary/80"
            >
              إنشاء حساب جديد
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;