import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  colorTheme?: string;
}

const FeedbackModal = ({ isOpen, onClose, children, colorTheme = "default" }: FeedbackModalProps) => {
  const isMobile = useIsMobile();

  const getThemeColors = (theme: string) => {
    const themes = {
      coral: "border-[#ff9178]/30 bg-gradient-to-br from-[#ff9178]/5 to-[#ff6342]/5",
      purple: "border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-purple-700/5",
      blue: "border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-700/5",
      green: "border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-700/5",
      pink: "border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-pink-700/5",
      teal: "border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-teal-700/5",
      amber: "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-700/5",
      indigo: "border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-indigo-700/5",
      rose: "border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-rose-700/5",
      default: "border-gray-500/30 bg-gradient-to-br from-gray-500/5 to-gray-700/5"
    };
    return themes[theme as keyof typeof themes] || themes.default;
  };

  const getAccentColor = (theme: string) => {
    const colors = {
      coral: "[#ff9178]",
      purple: "purple-500",
      blue: "blue-500",
      green: "green-500",
      pink: "pink-500",
      teal: "teal-500",
      amber: "amber-500",
      indigo: "indigo-500",
      rose: "rose-500",
      default: "gray-500"
    };
    return colors[theme as keyof typeof colors] || colors.default;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={`
                relative w-full max-w-md mx-auto
                ${isMobile ? 'max-h-[90vh]' : 'max-h-[85vh]'}
                bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                border-2 ${getThemeColors(colorTheme)}
                rounded-2xl shadow-2xl
                overflow-hidden
              `}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className={`text-lg font-bold text-${getAccentColor(colorTheme)}`}>
                  شاركنا رأيك
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className={`p-4 ${isMobile ? 'pb-6' : 'pb-6'} overflow-y-auto flex-1`}>
                {children}
              </div>

              {/* Decorative elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: isMobile ? 3 : 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 bg-${getAccentColor(colorTheme)}/30 rounded-full`}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 0.8, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;