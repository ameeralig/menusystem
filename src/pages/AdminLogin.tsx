import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // التحقق مما إذا كان المستخدم مسجل الدخول بالفعل
  useEffect(() => {
    const checkAdminSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // التحقق من دور المستخدم باستخدام has_role function
        const { data: hasAdminRole } = await supabase
          .rpc('has_role', { 
            _user_id: user.id, 
            _role: 'admin' 
          });
        
        if (hasAdminRole) {
          navigate("/admin/dashboard");
        }
      }
    };

    checkAdminSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // تسجيل الدخول إلى Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("خطأ تسجيل الدخول:", error);
        
        let errorMessage = "بيانات الاعتماد غير صحيحة. الرجاء التحقق من البريد الإلكتروني وكلمة المرور.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "❌ البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "⚠️ يرجى تأكيد بريدك الإلكتروني أولاً";
        } else if (error.message.includes("Rate limit")) {
          errorMessage = "⏳ عدد المحاولات تجاوز الحد المسموح. انتظر دقيقة وحاول مرة أخرى";
        }
        
        toast({
          variant: "destructive",
          title: "فشل تسجيل الدخول",
          description: errorMessage
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // التحقق من دور المستخدم باستخدام has_role function
        const { data: hasAdminRole, error: roleError } = await supabase
          .rpc('has_role', { 
            _user_id: data.user.id, 
            _role: 'admin' 
          });

        console.log('Admin role check:', { hasAdminRole, roleError });

        if (roleError || !hasAdminRole) {
          // تسجيل الخروج إذا كان المستخدم ليس مسؤولاً
          await supabase.auth.signOut();
          
          toast({
            variant: "destructive",
            title: "غير مصرح",
            description: "ليس لديك صلاحيات للوصول إلى لوحة تحكم المسؤول."
          });
          setIsLoading(false);
          return;
        }

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
          <p className="text-sm text-muted-foreground">
            قم بتسجيل الدخول باستخدام حساب المسؤول
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="أدخل البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="text-right"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جارِ تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
            
            <div className="text-center mt-4">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => navigate("/reset-password")}
              >
                نسيت كلمة المرور؟
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
