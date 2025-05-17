
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * مكون عرض حالة التحميل
 * محسن للتجاوب مع جميع أحجام الشاشات
 * مع إضافة تأثيرات حركية
 */
const LegalLoading = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center py-8 sm:py-10 md:py-12 w-full"
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5 
        }}
        className="flex flex-col items-center gap-2 sm:gap-3"
      >
        <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary animate-spin" />
        <p className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">جاري التحميل...</p>
      </motion.div>
    </motion.div>
  );
};

export default LegalLoading;
