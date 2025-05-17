
import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { HelmetProvider } from "react-helmet-async";

// استيراد المكونات المقسمة
import SeoHelmet from "@/components/legal/SeoHelmet";
import LegalHeader from "@/components/legal/LegalHeader";
import LegalTabs from "@/components/legal/LegalTabs";
import LegalLoading from "@/components/legal/LegalLoading";
import LegalFooter from "@/components/legal/LegalFooter";

// استخدام التحميل الكسول للمكونات
const TermsSection = lazy(() => import("@/components/legal/TermsSection"));
const PrivacySection = lazy(() => import("@/components/legal/PrivacySection"));
const ContactSection = lazy(() => import("@/components/legal/ContactSection"));

// تأثيرات الانتقال بين الصفحات
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

/**
 * صفحة المعلومات القانونية - محسنة للتجاوب مع جميع أحجام الشاشات
 */
const LegalPages = () => {
  const [activeTab, setActiveTab] = useState("terms");
  const navigate = useNavigate();
  const location = useLocation();

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
  const currentUrl = window.location.href;

  return (
    <HelmetProvider>
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pageVariants}
        className="min-h-screen w-full bg-[#FFF8F3] overflow-x-hidden relative"
      >
        {/* SEO */}
        <SeoHelmet 
          title={seoData.title}
          description={seoData.description}
          canonicalUrl={currentUrl}
        />
        
        {/* خلفية وديكورات - محسنة للموبايل */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 
                      bg-primary/10 blur-[60px] sm:blur-[80px] md:blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 sm:w-64 sm:h-64 md:w-96 md:h-96 
                      bg-primary/10 blur-[70px] sm:blur-[100px] md:blur-[120px] rounded-full"></div>
        
        {/* المحتوى الرئيسي */}
        <div className="container mx-auto flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 
                      px-3 sm:px-4 md:px-5 relative z-10">
          {/* الترويسة وأزرار التنقل */}
          <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            <LegalHeader />
            
            {/* أزرار التنقل بين الأقسام */}
            <Tabs 
              defaultValue="terms" 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              {/* أزرار التبويب */}
              <LegalTabs activeTab={activeTab} />

              {/* محتوى التبويبات مع تأثيرات الانتقال */}
              <div className="w-full mx-auto">
                <AnimatePresence mode="wait">
                  <TabsContent key="terms" value="terms" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Suspense fallback={<LegalLoading />}>
                        <TermsSection />
                      </Suspense>
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent key="privacy" value="privacy" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Suspense fallback={<LegalLoading />}>
                        <PrivacySection />
                      </Suspense>
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent key="contact" value="contact" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Suspense fallback={<LegalLoading />}>
                        <ContactSection />
                      </Suspense>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
          
          {/* تذييل الصفحة */}
          <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            <LegalFooter />
          </div>
        </div>
      </motion.div>
    </HelmetProvider>
  );
};

export default LegalPages;
