import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

interface HiddenLoginTriggerProps {
  requiredClicks?: number;
}

const HiddenLoginTrigger = ({ requiredClicks = 5 }: HiddenLoginTriggerProps) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showLoginCard, setShowLoginCard] = useState(false);

  const handleClick = useCallback(() => {
    const now = Date.now();
    
    // إذا مر أكثر من 2 ثانية منذ آخر نقرة، نعيد العداد
    if (now - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(now);

    // عند الوصول للعدد المطلوب
    if (clickCount + 1 >= requiredClicks) {
      setShowLoginCard(true);
      setClickCount(0);
    }
  }, [clickCount, lastClickTime, requiredClicks]);

  const handleClose = useCallback(() => {
    setShowLoginCard(false);
  }, []);

  return (
    <>
      {/* الزر المخفي - شفاف تماماً */}
      <button
        onClick={handleClick}
        className="absolute top-2 left-2 w-12 h-12 z-20 cursor-default opacity-0"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* بطاقة تسجيل الدخول */}
      {showLoginCard && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            {/* الخلفية الضبابية */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={handleClose}
            />

            {/* البطاقة */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              {/* رأس البطاقة */}
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6 pb-4">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <h2 className="text-2xl font-bold text-center text-foreground">
                  تسجيل الدخول
                </h2>
                <p className="text-sm text-center text-muted-foreground mt-1">
                  قم بتسجيل الدخول لإدارة متجرك
                </p>
              </div>

              {/* محتوى النموذج */}
              <div className="p-6">
                <LoginForm />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default HiddenLoginTrigger;
