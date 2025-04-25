
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          تسجيل الدخول
        </h2>

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
