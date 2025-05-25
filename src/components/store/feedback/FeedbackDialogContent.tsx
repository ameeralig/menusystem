
import { motion } from "framer-motion";
import { DialogContent } from "@/components/ui/dialog";

interface FeedbackDialogContentProps {
  children: React.ReactNode;
  colorTheme: string;
}

const FeedbackDialogContent = ({ children, colorTheme }: FeedbackDialogContentProps) => {
  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'coral':
        return 'from-[#ff9178]/5 to-[#ff6342]/5';
      case 'purple':
        return 'from-purple-500/5 to-purple-700/5';
      case 'blue':
        return 'from-blue-500/5 to-blue-700/5';
      case 'green':
        return 'from-green-500/5 to-green-700/5';
      case 'pink':
        return 'from-pink-500/5 to-pink-700/5';
      case 'teal':
        return 'from-teal-500/5 to-teal-700/5';
      case 'amber':
        return 'from-amber-500/5 to-amber-700/5';
      case 'indigo':
        return 'from-indigo-500/5 to-indigo-700/5';
      case 'rose':
        return 'from-rose-500/5 to-rose-700/5';
      default:
        return 'from-gray-500/5 to-gray-700/5';
    }
  };

  const getBorderGradient = (theme: string) => {
    switch (theme) {
      case 'coral':
        return 'border-[#ff9178]/20';
      case 'purple':
        return 'border-purple-500/20';
      case 'blue':
        return 'border-blue-500/20';
      case 'green':
        return 'border-green-500/20';
      case 'pink':
        return 'border-pink-500/20';
      case 'teal':
        return 'border-teal-500/20';
      case 'amber':
        return 'border-amber-500/20';
      case 'indigo':
        return 'border-indigo-500/20';
      case 'rose':
        return 'border-rose-500/20';
      default:
        return 'border-gray-500/20';
    }
  };

  return (
    <DialogContent className={`
      sm:max-w-[450px] 
      backdrop-blur-xl 
      bg-white/95 dark:bg-gray-900/95 
      border-2 ${getBorderGradient(colorTheme)}
      shadow-2xl 
      rounded-2xl
      overflow-hidden
      relative
    `}>
      {/* خلفية متدرجة متحركة */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(colorTheme)} rounded-2xl`}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* نقاط ديكورية */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r ${getThemeGradient(colorTheme).replace('/5', '/30')} rounded-full`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
              y: [-20, 20, -20],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* المحتوى */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </DialogContent>
  );
};

export default FeedbackDialogContent;
