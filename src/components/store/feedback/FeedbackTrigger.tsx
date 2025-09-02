import { MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FeedbackTriggerProps {
  colorTheme?: string;
  onClick: () => void;
}

const FeedbackTrigger = ({ colorTheme = "default", onClick }: FeedbackTriggerProps) => {
  const getThemeColors = (theme: string) => {
    const themes = {
      coral: "from-[#ff9178] to-[#ff6342] hover:from-[#ff8765] hover:to-[#ff5c3a] shadow-[#ff9178]/30",
      purple: "from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-purple-500/30",
      blue: "from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-blue-500/30",
      green: "from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 shadow-green-500/30",
      pink: "from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 shadow-pink-500/30",
      teal: "from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 shadow-teal-500/30",
      amber: "from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-amber-500/30",
      indigo: "from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 shadow-indigo-500/30",
      rose: "from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 shadow-rose-500/30",
      default: "from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 shadow-gray-600/30"
    };
    return themes[theme as keyof typeof themes] || themes.default;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex justify-center"
    >
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={onClick}
          className={`
            relative overflow-hidden
            bg-gradient-to-r ${getThemeColors(colorTheme)}
            text-white font-semibold
            px-6 py-3 rounded-full
            shadow-lg hover:shadow-xl
            border-0 transition-all duration-300
            flex items-center gap-2
            text-sm md:text-base
            min-w-[160px] justify-center
          `}
        >
          {/* خلفية متدرجة متحركة */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear"
            }}
          />
          
          {/* أيقونات متحركة */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
          </motion.div>
          
          <span className="relative z-10">شاركنا رأيك</span>
          
          <motion.div
            animate={{ 
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
          </motion.div>
        </Button>
        
        {/* شرارات محيطة */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              top: `${20 + i * 20}%`,
              left: `${10 + i * 30}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default FeedbackTrigger;