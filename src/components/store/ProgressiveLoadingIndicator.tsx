import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Package, Sparkles } from "lucide-react";
import { EyesLoader } from "@/components/ui/eyes-loader";

interface ProgressiveLoadingIndicatorProps {
  progress: number;
  isVisible: boolean;
}

const ProgressiveLoadingIndicator = ({ progress, isVisible }: ProgressiveLoadingIndicatorProps) => {
  if (!isVisible) return null;

  const getLoadingText = () => {
    if (progress <= 10) return "بدء تحميل المتجر...";
    if (progress <= 30) return "جلب المنتجات...";
    if (progress <= 60) return "تحسين الصور...";
    if (progress <= 90) return "إعداد التصنيفات...";
    return "اكتمل التحميل!";
  };

  const getLoadingIcon = () => {
    if (progress <= 30) return <EyesLoader size="md" />;
    if (progress <= 90) return <Package className="w-6 h-6" />;
    return <Sparkles className="w-6 h-6 text-green-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        {/* أيقونة وعنوان */}
        <div className="text-center mb-6">
          <motion.div
            key={progress}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-4"
          >
            {getLoadingIcon()}
          </motion.div>
          
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            تحميل المتجر
          </h3>
          
          <motion.p 
            key={getLoadingText()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {getLoadingText()}
          </motion.p>
        </div>

        {/* شريط التقدم */}
        <div className="space-y-3">
          <Progress 
            value={progress} 
            className="h-3 bg-gray-200 dark:bg-gray-700"
          />
          
          <div className="flex justify-between items-center">
            <motion.span 
              key={progress}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-primary"
            >
              {progress}%
            </motion.span>
            
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* رسالة تشجيعية */}
        {progress >= 80 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                أوشكنا على الانتهاء! 🎉
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProgressiveLoadingIndicator;