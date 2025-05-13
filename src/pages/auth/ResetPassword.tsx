
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* خلفية متحركة */}
      <AnimatedBackground />
      
      {/* تأثيرات نيون إضافية في الخلفية */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
      
      {/* بطاقة إعادة تعيين كلمة المرور */}
      <motion.div
        className="auth-container z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="auth-card backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)" }}
        >
          <div className="text-center mb-8">
            <motion.h2 
              className="auth-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              إعادة تعيين كلمة المرور
            </motion.h2>
            <motion.p 
              className="mt-2 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور
            </motion.p>
          </div>

          <ResetPasswordForm
            onBack={() => navigate("/auth/login")}
            onSuccess={() => navigate("/auth/login")}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
