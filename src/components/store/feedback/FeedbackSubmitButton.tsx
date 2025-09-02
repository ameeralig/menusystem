import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackSubmitButtonProps {
  isSubmitting: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
  colorTheme?: string;
}

const FeedbackSubmitButton = ({ 
  isSubmitting, 
  isDisabled, 
  onSubmit, 
  colorTheme = "default" 
}: FeedbackSubmitButtonProps) => {
  const isMobile = useIsMobile();

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
      className="pt-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <motion.div
        whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
      >
        <Button
          onClick={onSubmit}
          disabled={isDisabled}
          size="lg"
          className={`
            w-full h-12 
            bg-gradient-to-r ${getThemeColors(colorTheme)}
            text-white font-semibold rounded-xl
            shadow-lg hover:shadow-xl
            transition-all duration-300 transform
            border-0 relative overflow-hidden
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:scale-100 disabled:hover:shadow-lg
          `}
        >
          {/* خلفية متدرجة متحركة للحالة النشطة */}
          {!isDisabled && !isSubmitting && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
          
          <motion.div
            className="flex items-center gap-3 relative z-10"
            animate={isSubmitting ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={isSubmitting ? {
              duration: 1,
              repeat: Infinity,
            } : {}}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
                <span className="text-base">جاري الإرسال...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ 
                    x: [0, 5, 0],
                    rotate: [0, 15, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Send className="w-5 h-5" />
                </motion.div>
                <span className="text-base">إرسال الملاحظات</span>
              </>
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* رسالة تشجيعية */}
      <motion.p
        className="text-xs text-center text-muted-foreground mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        رأيك مهم لنا ويساعدنا على التحسن المستمر 💝
      </motion.p>
    </motion.div>
  );
};

export default FeedbackSubmitButton;