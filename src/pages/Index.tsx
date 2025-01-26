import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-primary">
            متجرك الإلكتروني
          </h1>
          
          <p className="text-xl text-gray-600 mt-4">
            منصة متكاملة لإدارة وعرض منتجاتك بكل سهولة
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/auth/login")}
                className="w-full sm:w-auto text-lg px-8 py-6"
                size="lg"
              >
                تسجيل الدخول
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate("/auth/signup")}
                variant="outline"
                className="w-full sm:w-auto text-lg px-8 py-6"
                size="lg"
              >
                إنشاء حساب جديد
              </Button>
            </motion.div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-white rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2">إدارة سهلة</h3>
              <p className="text-gray-600">واجهة بسيطة وسهلة لإدارة منتجاتك</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-white rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2">تصميم متجاوب</h3>
              <p className="text-gray-600">يعمل على جميع الأجهزة بشكل مثالي</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 bg-white rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2">تحكم كامل</h3>
              <p className="text-gray-600">تحكم في جميع تفاصيل منتجاتك</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;