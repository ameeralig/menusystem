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

  const getThemeAccentColor = (theme: string) => {
    const colors = {
      coral: "#ff9178",
      purple: "#8b5cf6",
      blue: "#3b82f6",
      green: "#10b981",
      pink: "#ec4899",
      teal: "#14b8a6",
      amber: "#f59e0b",
      indigo: "#6366f1",
      rose: "#f43f5e",
      default: "#6b7280"
    };
    return colors[theme as keyof typeof colors] || colors.default;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto relative w-full max-w-md mx-auto">
              <motion.div
                className={`
                  relative w-full
                  ${isMobile ? 'max-h-[90vh]' : 'max-h-[85vh]'}
                  bg-background/95 backdrop-blur-xl
                  border-2 border-primary/20
                  rounded-2xl shadow-2xl
                  overflow-hidden z-50
                `}
              style={{
                boxShadow: `0 25px 50px -12px ${getThemeAccentColor(colorTheme)}20`
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border p-4 flex justify-between items-center">
                <h2 
                  className="text-lg font-bold"
                  style={{ color: getThemeAccentColor(colorTheme) }}
                >
                  شاركنا رأيك
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-accent rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className={`p-6 ${isMobile ? 'pb-8' : 'pb-8'} overflow-y-auto flex-1 max-h-[70vh] relative z-50`}>
                {children}
              </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;