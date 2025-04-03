
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff0e8]">
      {/* Header/Navbar */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800 relative">
              متجرك الرقمي
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#ff9178]"></div>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#examples" className="text-gray-600 hover:text-gray-900">عرض الأمثلة</a>
            <a href="#blog" className="text-gray-600 hover:text-gray-900">المدونة</a>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => navigate("/auth/login")}
            >
              تسجيل الدخول
            </Button>
            <Button
              className="coral-button"
              onClick={() => navigate("/auth/signup")}
            >
              إنشاء متجر
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <span className="sr-only">Menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-right"
          >
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="text-[#ff9178]">متجر QR</span>
              <br />
              <span className="text-gray-700">يعمل من أجلك</span>
            </h1>
            
            <p className="text-xl text-gray-600 mt-6">
              منصة متكاملة لإدارة وعرض منتجاتك بكل سهولة عبر رمز QR
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-8">
              <Button
                onClick={() => navigate("/products")}
                className="coral-button-outline"
                size="lg"
              >
                عرض نموذج
              </Button>

              <Button
                onClick={() => navigate("/auth/signup")}
                className="coral-button"
                size="lg"
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
            <div className="relative aspect-[3/4] max-w-md mx-auto">
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
      <div className="container mx-auto px-6 py-16 md:py-24" id="examples">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800">مميزات المتجر الرقمي</h2>
          <p className="text-gray-600 mt-4">كل ما تحتاجه لعرض منتجاتك بطريقة احترافية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-16 w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">إدارة سهلة</h3>
            <p className="text-gray-600">واجهة بسيطة وسهلة لإدارة منتجاتك</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-16 w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">تصميم متجاوب</h3>
            <p className="text-gray-600">يعمل على جميع الأجهزة بشكل مثالي</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-white rounded-lg shadow-md text-center"
          >
            <div className="h-16 w-16 bg-[#fff0e8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ff9178]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">تحكم كامل</h3>
            <p className="text-gray-600">تحكم في جميع تفاصيل منتجاتك</p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-800">متجرك الرقمي</h2>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">سياسة الخصوصية</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">الشروط والأحكام</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">تواصل معنا</a>
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
