import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { PhoneAuthForm } from "@/components/auth/PhoneAuthForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

const Login = () => {
  const navigate = useNavigate();

  return (
    <AuthShell
      title="أهلاً بعودتك"
      subtitle="سجّل دخولك للوصول إلى متجرك"
      footer={
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/auth/reset-password")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            نسيت كلمة السر؟
          </button>
          <button
            onClick={() => navigate("/auth/signup")}
            className="font-medium text-primary hover:underline"
          >
            إنشاء حساب جديد
          </button>
        </div>
      }
    >
      <Tabs defaultValue="phone" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-5 h-11 bg-muted/50 backdrop-blur">
          <TabsTrigger value="phone" className="gap-1.5 data-[state=active]:shadow-sm">
            <Phone className="h-4 w-4" /> الهاتف
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5 data-[state=active]:shadow-sm">
            <Mail className="h-4 w-4" /> البريد
          </TabsTrigger>
        </TabsList>
        <TabsContent value="phone" className="mt-0">
          <PhoneAuthForm mode="login" />
        </TabsContent>
        <TabsContent value="email" className="mt-0">
          <LoginForm />
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
};

export default Login;
