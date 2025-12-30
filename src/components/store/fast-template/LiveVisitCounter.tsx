import React, { useState, useEffect, useCallback } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Eye } from "lucide-react";

const LiveVisitCounter: React.FC = () => {
  // حساب القيمة الابتدائية بناءً على اليوم (تُعاد الساعة 3 صباحاً)
  const getDailyStartValue = useCallback(() => {
    const now = new Date();
    const resetHour = 3;
    
    // حساب تاريخ اليوم مع مراعاة الساعة 3 صباحاً
    const dayKey = now.getHours() < resetHour 
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()
      : now.toDateString();
    
    // توليد رقم عشوائي ثابت لليوم (120-280)
    const seed = dayKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const randomStart = 120 + (seed % 161); // 120 to 280
    
    return randomStart;
  }, []);

  const [baseCount] = useState(getDailyStartValue);
  const [additionalCount, setAdditionalCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // تحديث العداد كل ثانية بزيادة عشوائية طبيعية
  useEffect(() => {
    const interval = setInterval(() => {
      // توقف عشوائي لجعله أكثر طبيعية (10% احتمال التوقف)
      if (Math.random() < 0.1) {
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 2000 + Math.random() * 3000);
        return;
      }

      if (!isPaused) {
        // زيادة عشوائية بين 1-3
        const increment = Math.floor(Math.random() * 3) + 1;
        setAdditionalCount(prev => prev + increment);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const totalCount = baseCount + additionalCount;

  // Animated counter using spring
  const springValue = useSpring(totalCount, { stiffness: 150, damping: 20 });
  const displayValue = useTransform(springValue, (val) => Math.floor(val));
  const [displayCount, setDisplayCount] = useState(totalCount);

  useEffect(() => {
    springValue.set(totalCount);
    const unsubscribe = displayValue.on("change", (v) => setDisplayCount(v));
    return () => unsubscribe();
  }, [totalCount, springValue, displayValue]);

  // Highlight keywords in text
  const highlightText = (text: string, keywords: string[]) => {
    let result = text;
    keywords.forEach(keyword => {
      result = result.replace(
        new RegExp(`(${keyword})`, 'g'),
        `<span class="text-primary font-bold">$1</span>`
      );
    });
    return result;
  };

  const mainText = "أكثر من 130 شريك يعتمدون هذا النظام لأن زبائنهم يهتمون بالتجربة السلسة والسريعة";
  const subText = "الأنظمة الذكية ما تنتظر… هي تسبق";
  const highlightKeywords = ["130", "التجربة", "الذكية"];

  return (
    <div 
      className="mt-8 mb-36 mx-4"
      style={{ direction: 'rtl' }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[14px] p-[14px]"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(20, 20, 30, 0.98) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(var(--primary-rgb, 99, 102, 241), 0.1)',
        }}
      >
        {/* Soft glow effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.3), transparent 60%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Counter Section */}
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-white/70" />
            <span className="text-sm text-[#bdbdbd]/90">عدد الزيارات اليوم</span>
            
            {/* Pulsing dot divider */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            
            {/* Animated Counter */}
            <motion.span 
              className="text-[28px] font-bold text-white"
              key={displayCount}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              {displayCount.toLocaleString('ar-EG')}
            </motion.span>
          </div>

          {/* Marketing Text */}
          <div className="text-center space-y-1.5 pt-2 border-t border-white/10">
            <p 
              className="text-sm font-medium text-white/90 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: highlightText(mainText, highlightKeywords) 
              }}
            />
            <p 
              className="text-xs text-[#bdbdbd]/80"
              dangerouslySetInnerHTML={{ 
                __html: highlightText(subText, highlightKeywords) 
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveVisitCounter;
