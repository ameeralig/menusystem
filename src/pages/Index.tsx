
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background bg-[url('/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png')] bg-cover bg-center bg-blend-overlay">
      {/* Header/Navbar */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <motion.h1 
              className="text-xl sm:text-2xl font-bold relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-gradient">متجرك الرقمي</span>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-accent"></div>
            </motion.h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                variant="glass"
                className="text-white hover:text-accent text-sm sm:text-base"
                onClick={() => navigate("/auth/login")}
              >
                تسجيل الدخول
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                variant="3d-accent"
                className="text-sm sm:text-base px-3 py-2 sm:px-6 sm:py-3"
                onClick={() => navigate("/auth/signup")}
              >
                إنشاء متجر
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div 
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center md:text-right"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-accent">متجر QR</span>
              <br />
              <span className="text-gradient">يعمل من أجلك</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mt-6">
              منصة متكاملة لإدارة وعرض منتجاتك بكل سهولة عبر رمز QR
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/products")}
                  variant="ghost"
                  size={isMobile ? "default" : "xl"}
                  className="border border-accent hover:bg-accent/20 text-accent"
                >
                  عرض نموذج
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/auth/signup")}
                  variant="3d"
                  size={isMobile ? "default" : "xl"}
                  className="glow-primary"
                >
                  إنشاء متجر QR
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] max-w-xs sm:max-w-sm md:max-w-md mx-auto">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#c156f1]/20 to-[#41fadc]/20 animate-pulse-glow"
                style={{ filter: "blur(25px)", zIndex: -1 }}
              ></motion.div>
              <motion.img 
                src="/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png" 
                alt="تطبيق متجر QR نموذج" 
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(193,86,241,0.5)]"
                animate={{ y: ["0px", "-10px", "0px"] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient">مميزات المتجر الرقمي</h2>
          <p className="text-muted-foreground mt-4">كل ما تحتاجه لعرض منتجاتك بطريقة احترافية</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
              title: "إدارة سهلة",
              desc: "واجهة بسيطة وسهلة لإدارة منتجاتك"
            },
            {
              icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
              title: "تصميم متجاوب",
              desc: "يعمل على جميع الأجهزة بشكل مثالي"
            },
            {
              icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
              title: "تحكم كامل",
              desc: "تحكم في جميع تفاصيل منتجاتك"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="glass-card p-6 text-center"
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {[
            {
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              title: "التخلص من القوائم الورقية",
              desc: "استبدل القوائم الورقية برمز QR سهل المسح"
            },
            {
              icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
              title: "سهولة التعديل",
              desc: "حدّث منتجاتك وأسعارك في أي وقت بسهولة"
            },
            {
              icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
              title: "تجربة مستخدم سلسة",
              desc: "واجهة سهلة الاستخدام تعزز من تجربة العميل"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.2, duration: 0.5 }}
              className="glass-card p-6 text-center"
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gradient">متجرك الرقمي</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="/terms" className="text-muted-foreground hover:text-accent transition-colors duration-300 text-sm sm:text-base">الشروط والأحكام</a>
              <a href="/privacy" className="text-muted-foreground hover:text-accent transition-colors duration-300 text-sm sm:text-base">سياسة الخصوصية</a>
              <a href="/contact" className="text-muted-foreground hover:text-accent transition-colors duration-300 text-sm sm:text-base">تواصل معنا</a>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground/60 text-sm">
            &copy; {new Date().getFullYear()} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
