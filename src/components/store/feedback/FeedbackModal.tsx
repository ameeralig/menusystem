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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div
            className={`
              relative w-full max-w-md mx-4
              ${isMobile ? 'max-h-[95vh]' : 'max-h-[90vh]'}
              bg-background/98 backdrop-blur-xl
              border border-border
              rounded-2xl shadow-2xl
              overflow-hidden
              flex flex-col
            `}
            style={{
              boxShadow: `0 25px 50px -12px ${getThemeAccentColor(colorTheme)}20`
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-background/95 border-b border-border p-4 flex justify-between items-center">
              <h2 
                className="text-lg font-bold text-foreground"
                style={{ color: getThemeAccentColor(colorTheme) }}
              >
                شاركنا رأيك
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-accent rounded-full flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;