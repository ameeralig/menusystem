
import { motion } from "framer-motion";
import { MessageSquareText, Sparkles } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackDialogHeaderProps {
  colorTheme: string;
}

const FeedbackDialogHeader = ({ colorTheme }: FeedbackDialogHeaderProps) => {
  const isMobile = useIsMobile();

  const getThemeAccent = (theme: string) => {
    switch (theme) {
      case 'coral':
        return '[#ff9178]';
      case 'purple':
        return 'purple-500';
      case 'blue':
        return 'blue-500';
      case 'green':
        return 'green-500';
      case 'pink':
        return 'pink-500';
      case 'teal':
        return 'teal-500';
      case 'amber':
        return 'amber-500';
      case 'indigo':
        return 'indigo-500';
      case 'rose':
        return 'rose-500';
      default:
        return 'gray-500';
    }
  };

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'coral':
        return 'from-[#ff9178] via-[#ff7b5f] to-[#ff6342]';
      case 'purple':
        return 'from-purple-500 via-purple-600 to-purple-700';
      case 'blue':
        return 'from-blue-500 via-blue-600 to-blue-700';
      case 'green':
        return 'from-green-500 via-green-600 to-green-700';
      case 'pink':
        return 'from-pink-500 via-pink-600 to-pink-700';
      case 'teal':
        return 'from-teal-500 via-teal-600 to-teal-700';
      case 'amber':
        return 'from-amber-500 via-amber-600 to-amber-700';
      case 'indigo':
        return 'from-indigo-500 via-indigo-600 to-indigo-700';
      case 'rose':
        return 'from-rose-500 via-rose-600 to-rose-700';
      default:
        return 'from-gray-600 via-gray-700 to-gray-800';
    }
  };

  return (
    <DialogHeader className={`relative overflow-hidden ${isMobile ? 'pb-2' : 'pb-4'}`}>
      {/* خلفية متحركة */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${getThemeGradient(colorTheme)} opacity-10 rounded-t-lg`}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* شرارات متحركة */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {[...Array(isMobile ? 2 : 3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 bg-${getThemeAccent(colorTheme)} rounded-full`}
            style={{
              top: `${20 + i * 30}%`,
              left: `${10 + i * 30}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div
        className={`relative z-10 flex items-center justify-center gap-3 ${isMobile ? 'py-1' : 'py-2'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* أيقونة متحركة */}
        <motion.div
          className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-full bg-gradient-to-r ${getThemeGradient(colorTheme)} shadow-lg`}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <MessageSquareText className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
        </motion.div>

        <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold bg-gradient-to-r ${getThemeGradient(colorTheme)} bg-clip-text text-transparent text-center`}>
          إرسال ملاحظات
        </DialogTitle>

        {/* أيقونة شرارة */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-${getThemeAccent(colorTheme)}`} />
        </motion.div>
      </motion.div>

      {/* خط متحرك في الأسفل */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${getThemeGradient(colorTheme)}`}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </DialogHeader>
  );
};

export default FeedbackDialogHeader;
