import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import qrLogo from "@/assets/qr-logo.png";
import SeoHelmet from "@/components/legal/SeoHelmet";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <>
      <SeoHelmet 
        title="QRM - منيو رقمي QR | خدمات المنيو الإلكتروني للمطاعم والمقاهي"
        description="QRM - منصة متكاملة لإدارة المنيو الرقمي عبر رمز QR. خدمات منيو إلكتروني احترافي للمطاعم والمقاهي مع إدارة سهلة وتحديثات فورية. QRM Menu Services."
        keywords="QRM, منيو QR, منيو رقمي, QR Menu, خدمات المنيو, منيو إلكتروني, QRM Menu, قائمة طعام رقمية, QR Code Menu, خدمات المنيو الإلكتروني"
        canonicalUrl="https://qrmenuc.com"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#0E0C35] via-[#161437] to-[#000054] relative overflow-hidden font-arabic">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 right-20 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-cyber-blue/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header/Navbar */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10">
        <div className="flex justify-between items-center backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <img src={qrLogo} alt="QRM - خدمات المنيو الرقمي QR" className="h-12 sm:h-14 w-auto drop-shadow-2xl" />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-white font-cyber tracking-wider drop-shadow-[0_2px_10px_rgba(0,156,255,0.8)]">
                QRM
              </h1>
              <p className="text-xs sm:text-sm text-white font-arabic font-bold drop-shadow-lg">خدمات المنيو والقوائم</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/10 text-sm sm:text-base border border-white/30 font-bold drop-shadow-lg"
              onClick={() => navigate("/auth/login")}
            >
              تسجيل الدخول
            </Button>
            <Button
              className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink text-white text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 font-black shadow-xl shadow-cyber-blue/60 transition-all duration-300 drop-shadow-xl"
              onClick={() => navigate("/auth/signup")}
            >
              إنشاء منيو QRM
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:gap-12 items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-4 font-cyber tracking-wider drop-shadow-2xl">
                <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(0,156,255,0.8)]">
                  QRM - QR MENU
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.5)] font-arabic">
                QRM - خدمات المنيو والقوائم الرقمية
              </p>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg sm:text-xl text-white mt-6 max-w-2xl mx-auto font-arabic font-bold drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
            >
              QRM - منصة متكاملة لإدارة وعرض منتجاتك بكل سهولة عبر رمز QR بتقنية متطورة. نظام QRM للمنيو الرقمي الاحترافي
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
            >
              <Button
                onClick={() => navigate("/checkpoint")}
                className="bg-transparent border-2 border-cyber-blue text-cyber-blue hover:bg-cyber-blue hover:text-white text-base sm:text-lg px-8 py-6 font-black transition-all duration-300 shadow-lg shadow-cyber-blue/30 drop-shadow-xl"
                size={isMobile ? "default" : "lg"}
              >
                عرض نموذج QRM
              </Button>

              <Button
                onClick={() => navigate("/auth/signup")}
                className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink text-white text-base sm:text-lg px-8 py-6 font-black shadow-xl shadow-cyber-purple/50 transition-all duration-300 drop-shadow-2xl"
                size={isMobile ? "default" : "lg"}
              >
                إنشاء منيو QRM الآن
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 font-cyber drop-shadow-2xl"
          >
            مميزات <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,156,255,0.6)]">QRM المنيو الرقمي</span>
          </motion.h2>
          <p className="text-white text-lg font-bold drop-shadow-lg font-arabic">كل ما تحتاجه في نظام QRM لعرض منتجاتك بطريقة احترافية</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              title: "إدارة سهلة مع QRM",
              description: "واجهة بسيطة وسهلة لإدارة منتجاتك عبر نظام QRM",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              ),
              delay: 0.2
            },
            {
              title: "تصميم متجاوب",
              description: "يعمل على جميع الأجهزة بشكل مثالي",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
              delay: 0.3
            },
            {
              title: "تحكم كامل",
              description: "تحكم في جميع تفاصيل منتجاتك",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ),
              delay: 0.4
            },
            {
              title: "التخلص من القوائم الورقية مع QRM",
              description: "استبدل القوائم الورقية برمز QR سهل المسح عبر QRM Menu",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              delay: 0.5
            },
            {
              title: "سهولة التعديل",
              description: "حدّث منتجاتك وأسعارك في أي وقت بسهولة",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
              delay: 0.6
            },
            {
              title: "تجربة مستخدم سلسة QRM",
              description: "واجهة QRM سهلة الاستخدام تعزز من تجربة العميل",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ),
              delay: 0.7
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group p-6 backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-xl hover:shadow-cyber-blue/30 transition-all duration-300"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-cyber-purple/40">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black mb-2 text-white text-center font-arabic drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]">{feature.title}</h3>
              <p className="text-white text-center font-arabic font-bold drop-shadow-lg">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-xl bg-white/5 border-t border-white/10 py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center gap-3">
              <img src={qrLogo} alt="QRM - خدمات المنيو الرقمي" className="h-12 w-auto drop-shadow-2xl" />
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-white font-cyber tracking-wider drop-shadow-[0_2px_10px_rgba(0,156,255,0.8)]">QRM</h2>
                <p className="text-xs text-white font-arabic font-bold drop-shadow-lg">MENU SERVICES</p>
              </div>
            </div>
            <div className="flex justify-center">
              <a 
                href="/legal" 
                className="text-white hover:text-white text-sm sm:text-base transition-all duration-300 font-bold drop-shadow-lg"
              >
                معلومات منصة QRM
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-white text-sm font-bold drop-shadow-lg">
            &copy; {new Date().getFullYear()} QRM Menu Services - خدمات المنيو الرقمي. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;
