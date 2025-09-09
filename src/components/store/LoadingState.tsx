
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingStateProps {
  progress?: number;
  message?: string;
  loadingTips?: string[];
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  progress, 
  message = "جاري التعرف على المتجر...",
  loadingTips = []
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // تغيير النصيحة كل 3 ثوان
  useEffect(() => {
    if (loadingTips.length > 0) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % loadingTips.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loadingTips.length]);

  const currentTip = loadingTips.length > 0 ? loadingTips[currentTipIndex] : null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center max-w-sm mx-auto text-center space-y-6"
      >
        <div className="space-y-4 w-full">
          <h2 className="text-lg font-medium text-foreground">{message}</h2>
          
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div 
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* شريط المعلومات المتدور */}
          {currentTip && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-muted-foreground">نصيحة مفيدة</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTipIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-foreground leading-relaxed"
                >
                  {currentTip}
                </motion.p>
              </AnimatePresence>
              
              {loadingTips.length > 1 && (
                <div className="flex justify-center mt-3 space-x-1" dir="ltr">
                  {loadingTips.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index === currentTipIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingState;
