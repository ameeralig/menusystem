
import { motion } from "framer-motion";

/**
 * مكون تذييل الصفحة القانونية
 * محسن للتجاوب مع جميع أحجام الشاشات
 * مع إضافة تأثيرات حركية
 */
const LegalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-6 sm:mt-8 md:mt-10 text-center text-xs sm:text-sm text-gray-700 pb-4 sm:pb-6"
    >
      &copy; {currentYear} متجرك الرقمي. جميع الحقوق محفوظة.
    </motion.div>
  );
};

export default LegalFooter;
