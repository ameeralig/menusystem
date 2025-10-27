import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import VantaBackground from "@/components/background/VantaBackground";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* Vanta Dots Background */}
      <VantaBackground />
      
      {/* بطاقة تسجيل الدخول */}
      <motion.div
        className="auth-container z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="auth-card backdrop-blur-xl bg-white/5 border border-white/20"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ boxShadow: "0 20px 60px rgba(59, 170, 255, 0.3)" }}
        >
          <motion.h2 
            className="text-3xl font-black text-white mb-6 text-center font-cyber drop-shadow-[0_0_20px_rgba(59,170,255,0.8)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="bg-gradient-to-r from-[#3baaff] via-[#a78bfa] to-[#f0abfc] bg-clip-text text-transparent">
              تسجيل الدخول
            </span>
          </motion.h2>

          <LoginForm />

          <motion.div 
            className="mt-6 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Button
              variant="link"
              className="text-sm text-white hover:text-[#3baaff] drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]"
              onClick={() => navigate("/auth/reset-password")}
            >
              نسيت كلمة السر؟
            </Button>

            <button
              onClick={() => navigate("/auth/signup")}
              className="text-sm text-white hover:text-[#3baaff] transition-colors drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]"
            >
              إنشاء حساب جديد
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
