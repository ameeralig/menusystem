import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import qrLogo from "@/assets/qr-logo.png";
import SeoHelmet from "@/components/legal/SeoHelmet";
import VantaBackground from "@/components/background/VantaBackground";

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
      <div className="min-h-screen relative overflow-hidden font-arabic">
      {/* Vanta Dots Background */}
      <VantaBackground />

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
                <span className="bg-gradient-to-r from-[#3baaff] via-[#a78bfa] to-[#f0abfc] bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(59,170,255,0.9)]">
                  QRM - QR MENU
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.8)] font-arabic">
                QRM - خدمات المنيو والقوائم الرقمية
              </p>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg sm:text-xl text-white/95 mt-6 max-w-2xl mx-auto font-arabic font-bold drop-shadow-[0_4px_15px_rgba(255,255,255,0.7)]"
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
                className="bg-transparent border-2 border-[#3baaff] text-[#3baaff] hover:bg-[#3baaff] hover:text-white text-base sm:text-lg px-8 py-6 font-black transition-all duration-300 shadow-lg shadow-[#3baaff]/40 drop-shadow-xl"
                size={isMobile ? "default" : "lg"}
              >
                عرض نموذج QRM
              </Button>

              <Button
                onClick={() => navigate("/auth/signup")}
                className="bg-gradient-to-r from-[#3baaff] to-[#a78bfa] hover:from-[#a78bfa] hover:to-[#f0abfc] text-white text-base sm:text-lg px-8 py-6 font-black shadow-xl shadow-[#a78bfa]/60 transition-all duration-300 drop-shadow-2xl"
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
            مميزات <span className="bg-gradient-to-r from-[#3baaff] to-[#a78bfa] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,170,255,0.8)]">QRM المنيو الرقمي</span>
          </motion.h2>
          <p className="text-white/95 text-lg font-bold drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)] font-arabic">كل ما تحتاجه في نظام QRM لعرض منتجاتك بطريقة احترافية</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              title: "إدارة المنتجات والفئات",
              description: "إضافة وتعديل منتجاتك بسهولة مع تنظيم تلقائي حسب الفئات",
              icon: "📦",
              delay: 0.1
            },
            {
              title: "رمز QR مخصص",
              description: "أنشئ رمز QR احترافي بألوان وأشكال مخصصة لعلامتك التجارية",
              icon: "📱",
              delay: 0.2
            },
            {
              title: "تخصيص المتجر",
              description: "صمم متجرك بألوان وخطوط وصور خاصة تناسب هويتك",
              icon: "🎨",
              delay: 0.3
            },
            {
              title: "نظام الموظفين",
              description: "إضافة موظفين مع صلاحيات وتتبع مبيعات كل موظف",
              icon: "👥",
              delay: 0.4
            },
            {
              title: "إدارة الطاولات",
              description: "نظام متكامل لإدارة طاولات المطعم أو المقهى",
              icon: "🪑",
              delay: 0.5
            },
            {
              title: "نظام نقاط البيع POS",
              description: "سلة تسوق متقدمة للموظفين مع طباعة فواتير احترافية",
              icon: "💳",
              delay: 0.6
            },
            {
              title: "تقارير المبيعات",
              description: "تتبع المبيعات اليومية والشهرية مع إحصائيات تفصيلية",
              icon: "📊",
              delay: 0.7
            },
            {
              title: "نظام التقييمات",
              description: "اجمع آراء العملاء وتقييماتهم لتحسين خدماتك",
              icon: "⭐",
              delay: 0.8
            },
            {
              title: "معاينة مباشرة",
              description: "شاهد متجرك كما يراه العملاء قبل النشر",
              icon: "👁️",
              delay: 0.9
            },
            {
              title: "تصميم متجاوب",
              description: "يعمل بشكل مثالي على الهواتف والأجهزة اللوحية",
              icon: "📲",
              delay: 1.0
            },
            {
              title: "بحث متقدم",
              description: "بحث سريع وفعال للعملاء للوصول للمنتجات بسهولة",
              icon: "🔍",
              delay: 1.1
            },
            {
              title: "رابط مخصص",
              description: "احصل على رابط خاص بمتجرك سهل الحفظ والمشاركة",
              icon: "🔗",
              delay: 1.2
            },
            {
              title: "وضع الليل والنهار",
              description: "تبديل تلقائي بين الوضع الفاتح والداكن",
              icon: "🌙",
              delay: 1.3
            },
            {
              title: "إشعارات WhatsApp",
              description: "إشعارات فورية عبر واتساب للطلبات الجديدة",
              icon: "💬",
              delay: 1.4
            },
            {
              title: "تحديثات فورية",
              description: "التعديلات تظهر مباشرة للعملاء بدون تأخير",
              icon: "⚡",
              delay: 1.5
            },
            {
              title: "لوحة تحكم شاملة",
              description: "إدارة كاملة لكل جوانب متجرك من مكان واحد",
              icon: "⚙️",
              delay: 1.6
            },
            {
              title: "صور عالية الجودة",
              description: "رفع وعرض صور منتجاتك بجودة احترافية",
              icon: "📸",
              delay: 1.7
            },
            {
              title: "تواصل اجتماعي",
              description: "أضف روابط حساباتك الاجتماعية لسهولة التواصل",
              icon: "🌐",
              delay: 1.8
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
              <div className="h-16 w-16 bg-gradient-to-br from-[#3baaff] to-[#a78bfa] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-[#a78bfa]/50">
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-black mb-2 text-white text-center font-arabic drop-shadow-[0_3px_10px_rgba(255,255,255,0.6)]">{feature.title}</h3>
              <p className="text-white/95 text-center font-arabic font-bold drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]">{feature.description}</p>
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
