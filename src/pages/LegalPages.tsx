
import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { HelmetProvider } from "react-helmet-async";
import { useIsMobile } from "@/hooks/use-mobile";

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

/**
 * صفحة المعلومات القانونية - الشروط والخصوصية والاتصال
 */
const LegalPages = () => {
  const [activeTab, setActiveTab] = useState("terms");
  const navigate = useNavigate();
  const location = useLocation();
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
      <div className="min-h-screen w-full bg-[#FFF8F3] overflow-hidden relative">
        {/* SEO */}
        <SeoHelmet 
          title={seoData.title}
          description={seoData.description}
          canonicalUrl={currentUrl}
        />
        
        {/* خلفية وديكورات */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-primary/10 blur-[80px] sm:blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 blur-[100px] sm:blur-[120px] rounded-full"></div>
        
        {/* المحتوى الرئيسي */}
        <div className="container mx-auto flex flex-col items-center justify-center py-4 sm:py-6 md:py-10 px-3 sm:px-4 relative z-10">
          {/* الترويسة وأزرار التنقل */}
          <LegalHeader />
          
          {/* أزرار التنقل بين الأقسام */}
          <div className="w-full max-w-4xl mb-4 sm:mb-6 md:mb-8">
            <Tabs 
              defaultValue="terms" 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              {/* أزرار التبويب - تحسين للموبايل */}
              <LegalTabs activeTab={activeTab} />

              {/* محتوى التبويبات */}
              <div className="w-full max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                  <TabsContent key="terms" value="terms" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Suspense fallback={<LegalLoading />}>
                      <TermsSection />
                    </Suspense>
                  </TabsContent>
                  
                  <TabsContent key="privacy" value="privacy" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Suspense fallback={<LegalLoading />}>
                      <PrivacySection />
                    </Suspense>
                  </TabsContent>
                  
                  <TabsContent key="contact" value="contact" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <Suspense fallback={<LegalLoading />}>
                      <ContactSection />
                    </Suspense>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
          
          {/* تذييل الصفحة */}
          <LegalFooter />
        </div>
      </div>
    </HelmetProvider>
  );
};

export default LegalPages;
