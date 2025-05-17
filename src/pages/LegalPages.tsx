
import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { FileText, Shield, Mail, Loader2, ArrowRight } from "lucide-react";
import { HelmetProvider } from "react-helmet-async";
import SeoHelmet from "@/components/legal/SeoHelmet";
import { useIsMobile } from "@/hooks/use-mobile";

// استخدام التحميل الكسول للمكونات
const TermsSection = lazy(() => import("@/components/legal/TermsSection"));
const PrivacySection = lazy(() => import("@/components/legal/PrivacySection"));
const ContactSection = lazy(() => import("@/components/legal/ContactSection"));

// مكون التحميل
const LoadingSuspense = () => (
  <div className="flex justify-center items-center py-12 w-full">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 text-gray-800 animate-spin" />
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

  return (
    <HelmetProvider>
      <div className="min-h-screen w-full bg-[#FFF8F3] overflow-hidden relative">
        {/* SEO */}
        <SeoHelmet 
          title={seoData.title}
          description={seoData.description}
        />
        
        {/* خلفية متحركة */}
        <AnimatedBackground />
        
        {/* الديكورات */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
        
        {/* المحتوى الرئيسي */}
        <div className="container mx-auto flex flex-col items-center justify-center py-6 px-4 sm:py-10 relative z-10">
          {/* زر العودة للصفحة الرئيسية */}
          <div className="w-full flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-gray-800 flex items-center gap-2 bg-white/90 border border-gray-200 hover:bg-white shadow-sm"
            >
              <span>العودة للرئيسية</span>
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
          </div>
          
          {/* عنوان الصفحة */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              معلومات المنصة
            </h1>
            <p className="text-gray-600 mt-2">
              كل ما تحتاج معرفته حول استخدام منصة متجرك الرقمي
            </p>
          </div>

          {/* أزرار التنقل بين الأقسام */}
          <div className="w-full max-w-4xl mb-8">
            <Tabs 
              defaultValue="terms" 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              {/* أزرار التبويب - تحسين للموبايل */}
              <TabsList className="grid w-full bg-transparent p-0 mb-8 gap-2 grid-cols-1 sm:grid-cols-3">
                {/* تبويب الشروط والأحكام */}
                <TabsTrigger
                  value="terms"
                  className={`flex items-center gap-2 p-3 sm:p-4 text-center rounded-lg transition-all duration-300 
                    ${activeTab === "terms" 
                      ? "bg-primary text-white shadow-md" 
                      : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
                >
                  <FileText className="size-4 sm:size-5" />
                  <span className="font-medium">الشروط والأحكام</span>
                </TabsTrigger>
                
                {/* تبويب سياسة الخصوصية */}
                <TabsTrigger
                  value="privacy"
                  className={`flex items-center gap-2 p-3 sm:p-4 text-center rounded-lg transition-all duration-300 
                    ${activeTab === "privacy" 
                      ? "bg-primary text-white shadow-md" 
                      : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
                >
                  <Shield className="size-4 sm:size-5" />
                  <span className="font-medium">سياسة الخصوصية</span>
                </TabsTrigger>
                
                {/* تبويب اتصل بنا */}
                <TabsTrigger
                  value="contact"
                  className={`flex items-center gap-2 p-3 sm:p-4 text-center rounded-lg transition-all duration-300 
                    ${activeTab === "contact" 
                      ? "bg-primary text-white shadow-md" 
                      : "bg-white text-gray-800 border border-gray-200 hover:border-primary/50"}`}
                >
                  <Mail className="size-4 sm:size-5" />
                  <span className="font-medium">اتصل بنا</span>
                </TabsTrigger>
              </TabsList>

              {/* محتوى التبويبات */}
              <div className="w-full max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
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
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
          
          {/* حقوق النشر */}
          <div className="mt-8 text-center text-gray-700">
            &copy; {currentYear} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default LegalPages;
