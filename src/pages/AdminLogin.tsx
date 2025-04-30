
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // التحقق مما إذا كان المستخدم مسجل الدخول كمسؤول بالفعل
  useEffect(() => {
    const checkAdminSession = () => {
      const adminSession = localStorage.getItem("adminSession");
      if (adminSession) {
        navigate("/admin/dashboard");
      }
    };

    checkAdminSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // التحقق من صحة بيانات الدخول
      if (email !== "ameer_a16@icloud.com" || pin !== "1234") {
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول",
          description: "بيانات الاعتماد غير صحيحة. الرجاء المحاولة مرة أخرى."
        });
        setIsLoading(false);
        return;
      }

      // محاولة تسجيل الدخول إلى Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pin
      });

      // إذا كان هناك خطأ في تسجيل الدخول في Supabase، نقوم بإنشاء جلسة محلية
      if (error) {
        console.log("تسجيل الدخول باستخدام الجلسة المحلية");
        
        // تسجيل جلسة المسؤول
        localStorage.setItem("adminSession", JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          isAdmin: true
        }));
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة تحكم المسؤول."
        });
        
        // توجيه المستخدم إلى لوحة التحكم
        navigate("/admin/dashboard");
      } else {
        // تم تسجيل الدخول بنجاح في Supabase
        localStorage.setItem("adminSession", JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          isAdmin: true,
          supabase_session: data.session
        }));
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة تحكم المسؤول."
        });
        
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      console.error("خطأ في تسجيل الدخول:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">لوحة تحكم المسؤول</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل البريد الإلكتروني المخوّل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">رمز الدخول</Label>
              <Input
                id="pin"
                type="password"
                placeholder="أدخل رمز الدخول"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                required
                dir="ltr"
                className="text-right"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جارِ تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
