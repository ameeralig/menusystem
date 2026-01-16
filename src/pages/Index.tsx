import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useIsMobile } from "@/hooks/use-mobile";
import qrLogo from "@/assets/qr-logo.png";
import PartnersSection from "@/components/partners/PartnersSection";
import SimpleBackground from "@/components/background/SimpleBackground";
import { QrCode, Sparkles, Zap, Shield, Users, BarChart3, Smartphone, Palette, Bell, Search, Link2, Moon, MessageCircle, RefreshCw, Settings, Camera, Globe, ChevronDown } from "lucide-react";
import { useRef } from "react";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const features = [
    { title: "إدارة المنتجات", description: "إضافة وتعديل منتجاتك بسهولة مع تنظيم تلقائي", icon: QrCode, color: "from-cyan-400 to-blue-500" },
    { title: "رمز QR مخصص", description: "أنشئ رمز QR احترافي بألوان مخصصة", icon: Sparkles, color: "from-purple-400 to-pink-500" },
    { title: "تخصيص المتجر", description: "صمم متجرك بألوان وخطوط خاصة", icon: Palette, color: "from-orange-400 to-red-500" },
    { title: "نظام الموظفين", description: "إدارة موظفين مع تتبع مبيعات", icon: Users, color: "from-green-400 to-emerald-500" },
    { title: "إدارة الطاولات", description: "نظام متكامل لإدارة طاولات المطعم", icon: Shield, color: "from-blue-400 to-indigo-500" },
    { title: "نقاط البيع POS", description: "سلة تسوق مع طباعة فواتير", icon: Zap, color: "from-yellow-400 to-orange-500" },
    { title: "تقارير المبيعات", description: "تتبع المبيعات مع إحصائيات", icon: BarChart3, color: "from-pink-400 to-rose-500" },
    { title: "نظام التقييمات", description: "اجمع آراء العملاء", icon: MessageCircle, color: "from-teal-400 to-cyan-500" },
    { title: "تصميم متجاوب", description: "يعمل على جميع الأجهزة", icon: Smartphone, color: "from-violet-400 to-purple-500" },
    { title: "بحث متقدم", description: "بحث سريع للمنتجات", icon: Search, color: "from-indigo-400 to-blue-500" },
    { title: "رابط مخصص", description: "رابط خاص بمتجرك", icon: Link2, color: "from-rose-400 to-pink-500" },
    { title: "الوضع الليلي", description: "تبديل بين الفاتح والداكن", icon: Moon, color: "from-slate-400 to-gray-500" },
    { title: "إشعارات WhatsApp", description: "إشعارات فورية للطلبات", icon: Bell, color: "from-green-400 to-teal-500" },
    { title: "تحديثات فورية", description: "التعديلات تظهر مباشرة", icon: RefreshCw, color: "from-cyan-400 to-blue-500" },
    { title: "لوحة تحكم", description: "إدارة كاملة من مكان واحد", icon: Settings, color: "from-purple-400 to-violet-500" },
    { title: "صور عالية الجودة", description: "رفع صور بجودة احترافية", icon: Camera, color: "from-amber-400 to-orange-500" },
    { title: "روابط اجتماعية", description: "أضف حساباتك الاجتماعية", icon: Globe, color: "from-blue-400 to-cyan-500" },
    { title: "أداء عالي", description: "سرعة تحميل فائقة", icon: Zap, color: "from-yellow-400 to-amber-500" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <>
      <Helmet>
        <title>QRM - منيو رقمي QR | خدمات المنيو الإلكتروني للمطاعم والمقاهي</title>
        <meta name="description" content="QRM - منصة متكاملة لإدارة المنيو الرقمي عبر رمز QR. خدمات منيو إلكتروني احترافي للمطاعم والمقاهي مع إدارة سهلة وتحديثات فورية." />
        <link rel="canonical" href="https://qrmenuc.com" />
      </Helmet>
      
      <SimpleBackground />
      
      <div ref={containerRef} className="min-h-screen relative overflow-hidden font-arabic">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4"
        >
          <div className="container mx-auto">
            <div className="flex justify-between items-center backdrop-blur-xl bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/10 shadow-2xl shadow-black/20">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <img src={qrLogo} alt="QRM" className="h-10 sm:h-12 w-auto drop-shadow-2xl" />
                <div className="flex flex-col">
                  <h1 className="text-lg sm:text-xl font-black text-white font-cyber tracking-wider">
                    QRM
                  </h1>
                  <p className="text-[10px] sm:text-xs text-white/80 font-arabic font-bold">خدمات المنيو</p>
                </div>
              </motion.div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 text-xs sm:text-sm border border-white/20 font-bold px-3 sm:px-4 py-2 h-auto"
                  onClick={() => navigate("/auth/login")}
                >
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                  <span className="sm:hidden">دخول</span>
                </Button>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs sm:text-sm px-3 sm:px-5 py-2 font-black shadow-lg shadow-cyan-500/30 h-auto"
                    onClick={() => navigate("/auth/signup")}
                  >
                    <span className="hidden sm:inline">إنشاء منيو</span>
                    <span className="sm:hidden">إنشاء</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-12 sm:pb-16 relative"
        >
          <div className="container mx-auto px-4 sm:px-6 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-6 sm:mb-8"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs sm:text-sm text-white/90 font-bold">منصة المنيو الرقمي الأولى</span>
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  QRM
                </span>
                <br />
                <span className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                  المنيو الرقمي الذكي
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10 font-bold leading-relaxed px-4"
            >
              حوّل قائمة طعامك إلى تجربة رقمية متكاملة
              <br className="hidden sm:block" />
              <span className="text-cyan-400">بضغطة زر واحدة</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  onClick={() => navigate("/auth/signup")}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 font-black shadow-xl shadow-cyan-500/30 rounded-xl"
                  size="lg"
                >
                  ابدأ مجاناً الآن
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  onClick={() => navigate("/checkpoint")}
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 font-black rounded-xl backdrop-blur-sm"
                  size="lg"
                >
                  عرض نموذج
                </Button>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-2 text-white/50"
              >
                <span className="text-xs font-bold">اكتشف المزيد</span>
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Partners Section */}
        <PartnersSection />

        {/* Features Section */}
        <section className="py-16 sm:py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                <span className="text-white">كل ما تحتاجه في </span>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">مكان واحد</span>
              </h2>
              <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto font-bold">
                مميزات احترافية لإدارة منيو رقمي متكامل
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group p-4 sm:p-5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white text-center mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-white/60 text-center font-bold line-clamp-2">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 p-8 sm:p-12 md:p-16"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
              
              <div className="relative text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6">
                  جاهز لإنشاء منيوك الرقمي؟
                </h2>
                <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 font-bold">
                  انضم لآلاف المطاعم والمقاهي التي تستخدم QRM
                </p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate("/auth/signup")}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-base sm:text-lg px-10 sm:px-12 py-5 sm:py-6 font-black shadow-xl shadow-cyan-500/30 rounded-xl"
                    size="lg"
                  >
                    ابدأ الآن مجاناً
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 backdrop-blur-xl bg-white/5 border-t border-white/10 py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3"
              >
                <img src={qrLogo} alt="QRM" className="h-10 sm:h-12 w-auto" />
                <div className="flex flex-col">
                  <h2 className="text-lg sm:text-xl font-black text-white font-cyber">QRM</h2>
                  <p className="text-xs text-white/60 font-bold">خدمات المنيو الرقمي</p>
                </div>
              </motion.div>
              
              <div className="text-center md:text-right">
                <p className="text-white/60 text-sm font-bold">
                  جميع الحقوق محفوظة © {new Date().getFullYear()} QRM
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
