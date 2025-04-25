
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[#fff0e8]">
      {/* Header/Navbar */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 relative">
              متجرك الرقمي
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#ff9178]"></div>
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
              onClick={() => navigate("/auth/login")}
            >
              تسجيل الدخول
            </Button>
            <Button
              className="coral-button text-sm sm:text-base px-3 py-2 sm:px-6 sm:py-3"
              onClick={() => navigate("/auth/signup")}
            >
              إنشاء متجر
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-right"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-[#ff9178]">متجر QR</span>
              <br />
              <span className="text-gray-700">يعمل من أجلك</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mt-6">
              منصة متكاملة لإدارة وعرض منتجاتك بكل سهولة عبر رمز QR
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-8">
              <Button
                onClick={() => navigate("/products")}
                className="coral-button-outline"
                size={isMobile ? "default" : "lg"}
              >
                عرض نموذج
              </Button>

              <Button
                onClick={() => navigate("/auth/signup")}
                className="coral-button"
                size={isMobile ? "default" : "lg"}
              >
                إنشاء متجر QR
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] max-w-xs sm:max-w-sm md:max-w-md mx-auto">
              <img 
                src="/lovable-uploads/e78cce88-ead6-4a09-ba47-8f8b59485cbb.png" 
                alt="تطبيق متجر QR نموذج" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">مميزات المتجر الرقمي</h2>
          <p className="text-gray-600 mt-4">كل ما تحتاجه لعرض منتجاتك بطريقة احترافية</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">إدارة سهلة</h3>
            <p className="text-gray-600 text-sm sm:text-base">واجهة بسيطة وسهلة لإدارة منتجاتك</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">تصميم متجاوب</h3>
            <p className="text-gray-600 text-sm sm:text-base">يعمل على جميع الأجهزة بشكل مثالي</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">تحكم كامل</h3>
            <p className="text-gray-600 text-sm sm:text-base">تحكم في جميع تفاصيل منتجاتك</p>
          </motion.div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">التخلص من القوائم الورقية</h3>
            <p className="text-gray-600 text-sm sm:text-base">استبدل القوائم الورقية برمز QR سهل المسح</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">سهولة التعديل</h3>
            <p className="text-gray-600 text-sm sm:text-base">حدّث منتجاتك وأسعارك في أي وقت بسهولة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">تجربة مستخدم سلسة</h3>
            <p className="text-gray-600 text-sm sm:text-base">واجهة سهلة الاستخدام تعزز من تجربة العميل</p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-800">متجرك الرقمي</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="/terms" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">الشروط والأحكام</a>
              <a href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">سياسة الخصوصية</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">تواصل معنا</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
