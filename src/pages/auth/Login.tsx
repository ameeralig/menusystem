
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-background">
      <div className="w-full max-w-md p-8 bg-white dark:bg-card rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            تسجيل الدخول
          </h2>
        </div>

        <LoginForm />

        <div className="mt-6 flex items-center justify-between">
          <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="link" className="text-sm text-primary hover:text-primary/80">
                نسيت كلمة السر؟
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>إعادة تعيين كلمة السر</AlertDialogTitle>
                <AlertDialogDescription>
                  أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
                </AlertDialogDescription>
              </AlertDialogHeader>
              <ResetPasswordForm
                onBack={() => setIsResetDialogOpen(false)}
                onSuccess={() => {
                  setIsResetDialogOpen(false);
                  navigate("/auth/reset-password");
                }}
              />
            </AlertDialogContent>
          </AlertDialog>

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
