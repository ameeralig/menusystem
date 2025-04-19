
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    // التحقق إذا كان النطاق الحالي هو login.qrmenuc.com
    const hostname = window.location.hostname;
    setIsSubdomain(hostname === 'login.qrmenuc.com');
    
    console.log("صفحة تسجيل الدخول - النطاق الحالي:", hostname);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-background">
      <div className="w-full max-w-md p-8 bg-white dark:bg-card rounded-lg shadow-lg">
        {isSubdomain && (
          <div className="text-center mb-4">
            <a href="https://qrmenuc.com" className="text-primary hover:underline">
              العودة إلى الصفحة الرئيسية
            </a>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            تسجيل الدخول
          </h2>
        </div>

        <LoginForm />

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="link"
            className="text-sm text-primary hover:text-primary/80"
            onClick={() => navigate("/auth/reset-password")}
          >
            نسيت كلمة السر؟
          </Button>

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
