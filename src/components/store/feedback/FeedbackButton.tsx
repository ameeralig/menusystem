
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackButtonProps {
  onClick: () => void;
  colorTheme?: string;
  className?: string;
}

const FeedbackButton = ({ onClick, colorTheme = "default", className }: FeedbackButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // الحصول على ألوان الثيم
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'coral':
        return {
          primary: 'from-[#ff9178] via-[#ff7b5f] to-[#ff6342]',
          secondary: 'from-[#ffbcad] to-[#ff9178]',
          glow: 'shadow-[#ff9178]/30',
          border: 'border-[#ff9178]/20'
        };
      case 'purple':
        return {
          primary: 'from-purple-500 via-purple-600 to-purple-700',
          secondary: 'from-purple-400 to-purple-500',
          glow: 'shadow-purple-500/30',
          border: 'border-purple-500/20'
        };
      case 'blue':
        return {
          primary: 'from-blue-500 via-blue-600 to-blue-700',
          secondary: 'from-blue-400 to-blue-500',
          glow: 'shadow-blue-500/30',
          border: 'border-blue-500/20'
        };
      case 'green':
        return {
          primary: 'from-green-500 via-green-600 to-green-700',
          secondary: 'from-green-400 to-green-500',
          glow: 'shadow-green-500/30',
          border: 'border-green-500/20'
        };
      case 'pink':
        return {
          primary: 'from-pink-500 via-pink-600 to-pink-700',
          secondary: 'from-pink-400 to-pink-500',
          glow: 'shadow-pink-500/30',
          border: 'border-pink-500/20'
        };
      case 'teal':
        return {
          primary: 'from-teal-500 via-teal-600 to-teal-700',
          secondary: 'from-teal-400 to-teal-500',
          glow: 'shadow-teal-500/30',
          border: 'border-teal-500/20'
        };
      case 'amber':
        return {
          primary: 'from-amber-500 via-amber-600 to-amber-700',
          secondary: 'from-amber-400 to-amber-500',
          glow: 'shadow-amber-500/30',
          border: 'border-amber-500/20'
        };
      case 'indigo':
        return {
          primary: 'from-indigo-500 via-indigo-600 to-indigo-700',
          secondary: 'from-indigo-400 to-indigo-500',
          glow: 'shadow-indigo-500/30',
          border: 'border-indigo-500/20'
        };
      case 'rose':
        return {
          primary: 'from-rose-500 via-rose-600 to-rose-700',
          secondary: 'from-rose-400 to-rose-500',
          glow: 'shadow-rose-500/30',
          border: 'border-rose-500/20'
        };
      default:
        return {
          primary: 'from-gray-600 via-gray-700 to-gray-800',
          secondary: 'from-gray-500 to-gray-600',
          glow: 'shadow-gray-600/30',
          border: 'border-gray-600/20'
        };
    }
  };

  const themeColors = getThemeColors(colorTheme);

  return (
    <div className={cn("relative group", className)}>
      {/* التأثير المضيء في الخلفية */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          `bg-gradient-to-r ${themeColors.secondary}`,
          themeColors.glow
        )}
        animate={{
          scale: isHovered ? 1.1 : 1,
          opacity: isHovered ? 0.3 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* الزر الرئيسي */}
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className={cn(
          "relative flex items-center justify-center gap-2 px-6 py-3 rounded-full",
          "bg-gradient-to-r text-white font-medium text-sm",
          "border backdrop-blur-sm",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          `${themeColors.primary}`,
          `${themeColors.border}`,
          "hover:shadow-lg",
          themeColors.glow
        )}
        whileHover={{ 
          scale: 1.05,
          y: -2,
        }}
        whileTap={{ 
          scale: 0.98,
          y: 0,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          delay: 0.1
        }}
      >
        {/* خلفية متحركة */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full opacity-0",
            `bg-gradient-to-r ${themeColors.secondary}`
          )}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* المحتوى */}
        <div className="relative flex items-center gap-2 z-10">
          {/* أيقونة متحركة */}
          <motion.div
            animate={{
              rotate: isHovered ? 360 : 0,
              scale: isPressed ? 0.9 : 1,
            }}
            transition={{
              rotate: { duration: 0.6, ease: "easeInOut" },
              scale: { duration: 0.1 }
            }}
          >
            <AnimatePresence mode="wait">
              {isHovered ? (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageSquare className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* النص */}
          <motion.span
            animate={{
              x: isHovered ? 2 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            إرسال ملاحظات
          </motion.span>

          {/* تأثير الشرارات */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* تأثير الموجة عند الضغط */}
        <AnimatePresence>
          {isPressed && (
            <motion.div
              className={cn(
                "absolute inset-0 rounded-full",
                `bg-gradient-to-r ${themeColors.primary}`
              )}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* النقاط المتحركة حول الزر */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute w-1 h-1 rounded-full",
                  `bg-gradient-to-r ${themeColors.secondary}`
                )}
                style={{
                  top: `${20 + i * 20}%`,
                  right: `${-10 + i * 5}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  y: [-10, 10, -10]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackButton;
