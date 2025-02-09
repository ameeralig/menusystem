
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-background">
      <div className="w-full max-w-md p-8 bg-white dark:bg-card rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            إعادة تعيين كلمة المرور
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
