
import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { FileText, Shield, Mail, Loader2 } from "lucide-react";
import { HelmetProvider } from "react-helmet-async";
import SeoHelmet from "@/components/legal/SeoHelmet";
import { useIsMobile } from "@/hooks/use-mobile";

// استخدام التحميل الكسول للمكونات
const TermsSection = lazy(() => import("@/components/legal/TermsSection"));
const PrivacySection = lazy(() => import("@/components/legal/PrivacySection"));
const ContactSection = lazy(() => import("@/components/legal/ContactSection"));

// مكون التحميل
const LoadingSuspense = () => (
  <div className="flex justify-center items-center py-16 w-full">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 text-gray-800 animate-spin" />
      <p className="text-gray-800 font-medium">جاري التحميل...</p>
    </div>
  </div>
);

const LegalPages = () => {
  const [activeTab, setActiveTab] = useState("terms");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // قراءة معلمة tab من عنوان URL عند تحميل الصفحة
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam && ["terms", "privacy", "contact"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // تغيير عنوان URL عند تغيير التبويب النشط بدون إعادة تحميل الصفحة
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // استخدام replace: true لتجنب إضافة إدخالات متعددة في تاريخ التصفح
    navigate(`/legal?tab=${value}`, { replace: true });
  };

  const currentYear = new Date().getFullYear();

  // تحديد العنوان والوصف بناءً على التبويب النشط
  const getSeoData = () => {
    switch (activeTab) {
      case 'terms':
        return {
          title: "الشروط والأحكام | متجرك الرقمي",
          description: "اقرأ الشروط والأحكام الخاصة بمنصة متجرك الرقمي، وتعرف على قواعد استخدام الخدمة"
        };
      case 'privacy':
        return {
          title: "سياسة الخصوصية | متجرك الرقمي",
          description: "تعرف على كيفية جمع واستخدام وحماية بياناتك الشخصية على منصة متجرك الرقمي"
        };
      case 'contact':
        return {
          title: "اتصل بنا | متجرك الرقمي",
          description: "تواصل مع فريق دعم متجرك الرقمي للاستفسارات والمساعدة"
        };
      default:
        return {
          title: "متجرك الرقمي | المعلومات القانونية",
          description: "معلومات قانونية وتواصل مع متجرك الرقمي"
        };
    }
  };

  const seoData = getSeoData();

  // تكوينات الأزرار وتأثيراتها
  const tabButtons = [
    { 
      id: "terms", 
      label: "الشروط والأحكام", 
      icon: <FileText className="mb-1 size-5" />
    },
    { 
      id: "privacy", 
      label: "سياسة الخصوصية", 
      icon: <Shield className="mb-1 size-5" />
    },
    { 
      id: "contact", 
      label: "اتصل بنا", 
      icon: <Mail className="mb-1 size-5" />
    }
  ];

  // تكوين تأثيرات الانتقال الرئيسية
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
        {/* SEO */}
        <SeoHelmet 
          title={seoData.title}
          description={seoData.description}
        />
        
        {/* خلفية متحركة */}
        <AnimatedBackground />
        
        {/* تأثيرات النيون في الخلفية */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
        
        {/* البطاقة الرئيسية */}
        <motion.div
          className="auth-container z-10 px-4 w-full max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={pageVariants}
        >
          {/* زر العودة للصفحة الرئيسية */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-gray-800 backdrop-blur-sm bg-white/80 border border-white/50 hover:bg-white/90 font-medium text-base"
            >
              العودة للرئيسية
            </Button>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center" style={{ textShadow: "0 0 15px rgba(255, 255, 255, 0.5)" }}>
            معلومات المنصة
          </h2>

          {/* أزرار التنقل باستخدام مكون Tabs */}
          <Tabs 
            defaultValue="terms" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full mb-6 sm:mb-10"
          >
            {/* أزرار التنقل ثلاثية الأبعاد */}
            <TabsList className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-3 gap-4"} w-full bg-transparent p-0`}>
              {tabButtons.map((button) => (
                <TabsTrigger
                  key={button.id}
                  value={button.id}
                  className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl transition-all duration-300 
                    data-[state=active]:text-white data-[state=active]:shadow-lg
                    data-[state=active]:translate-y-[-5px] data-[state=active]:bg-gradient-to-r 
                    data-[state=active]:from-[rgba(255,145,120,0.9)] data-[state=active]:to-[rgba(255,99,55,0.8)]
                    data-[state=inactive]:text-gray-800 data-[state=inactive]:hover:text-gray-900
                    data-[state=inactive]:bg-white/80 data-[state=inactive]:hover:bg-white/90
                    tab-3d ${activeTab === button.id ? 'active' : ''}`}
                  style={{
                    transformStyle: "preserve-3d",
                    textShadow: activeTab === button.id ? "0 0 10px rgba(255, 255, 255, 0.5)" : "none",
                    backdropFilter: "blur(8px)"
                  }}
                >
                  {button.icon}
                  <span className="mt-2 font-semibold text-base sm:text-lg">{button.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* محتوى التبويبات */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar px-2 mt-6 sm:mt-8">
              <TabsContent value="terms" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <Suspense fallback={<LoadingSuspense />}>
                  <TermsSection />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="privacy" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <Suspense fallback={<LoadingSuspense />}>
                  <PrivacySection />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="contact" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <Suspense fallback={<LoadingSuspense />}>
                  <ContactSection />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="mt-6 sm:mt-8 text-center text-gray-800 text-base">
            &copy; {currentYear} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </motion.div>
      </div>
    </HelmetProvider>
  );
};

export default LegalPages;
