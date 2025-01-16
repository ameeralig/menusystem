import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://YOUR_PROJECT_URL.supabase.co",
  "YOUR_ANON_KEY"
);

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الحساب",
        description: error.message,
      });
    } else if (data.user) {
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك!",
      });
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h2>
          <p className="mt-2 text-sm text-gray-600">
            لديك حساب بالفعل؟{" "}
            <button
              onClick={() => navigate("/auth/login")}
              className="font-medium text-primary hover:text-primary/80"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                اسم المستخدم
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 text-right"
                dir="rtl"
              />
            </div>

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
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري التحميل..." : "إنشاء حساب"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Signup;