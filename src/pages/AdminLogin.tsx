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
        // التحقق من دور المستخدم
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (roleData && roleData.role === 'admin') {
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
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول",
          description: error.message || "بيانات الاعتماد غير صحيحة. الرجاء المحاولة مرة أخرى."
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // التحقق من دور المستخدم
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleError || !roleData || roleData.role !== 'admin') {
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
