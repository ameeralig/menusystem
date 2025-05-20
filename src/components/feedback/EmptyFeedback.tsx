
import { motion } from "framer-motion";

const EmptyFeedback = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center py-12 px-4"
    >
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold mb-2">لا توجد شكاوى أو اقتراحات</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        سيتم عرض الشكاوى والاقتراحات الواردة من زوار المتجر هنا
      </p>
    </motion.div>
  );
};

export default EmptyFeedback;
