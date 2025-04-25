
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-8">
          <h2 className="auth-title">
            إعادة تعيين كلمة المرور
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور
          </p>
        </div>

        <ResetPasswordForm
          onBack={() => navigate("/auth/login")}
          onSuccess={() => navigate("/auth/login")}
        />
      </div>
    </div>
  );
};

export default ResetPassword;
