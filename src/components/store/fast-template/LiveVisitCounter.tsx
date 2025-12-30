import React, { useState, useEffect, useCallback } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Eye } from "lucide-react";

// تعريف المراحل الزمنية
const PHASES = [
  { start: 3, end: 10, startValue: 0, endValue: 10, incrementMinutes: 42 },
  { start: 10, end: 15, startValue: 10, endValue: 30, incrementMinutes: 15 },
  { start: 15, end: 18, startValue: 30, endValue: 99, incrementMinutes: 3 },
  { start: 18, end: 25, startValue: 99, endValue: 260, incrementMinutes: 2 }, // 25 = 01:00 next day
  { start: 25, end: 27, startValue: 260, endValue: 299, incrementMinutes: 3 }, // 27 = 03:00 next day
];

const LiveVisitCounter: React.FC = () => {
  // حساب القيمة بناءً على الوقت الحالي فقط - متزامن لجميع المستخدمين
  const calculateCountByTime = useCallback(() => {
    const now = new Date();
    let currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // تحويل الساعات بعد منتصف الليل (00:00-02:59) إلى 24-26
    if (currentHour < 3) {
      currentHour += 24;
    }
    
    // البحث عن المرحلة الحالية
    for (const phase of PHASES) {
      if (currentHour >= phase.start && currentHour < phase.end) {
        // حساب الدقائق منذ بداية المرحلة
        const phaseStartMinutes = phase.start * 60;
        const currentTotalMinutes = currentHour * 60 + currentMinutes;
        const minutesSincePhaseStart = currentTotalMinutes - phaseStartMinutes;
        
        // حساب عدد الزيادات
        const increments = Math.floor(minutesSincePhaseStart / phase.incrementMinutes);
        
        // حساب القيمة النهائية (لا تتجاوز endValue أو 299)
        const count = Math.min(phase.startValue + increments, phase.endValue, 299);
        
        return count;
      }
    }
    
    return 0; // الساعة 3 صباحاً - إعادة التعيين
  }, []);

  const [visitCount, setVisitCount] = useState(calculateCountByTime);

  // تحديث العداد كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitCount(calculateCountByTime());
    }, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [calculateCountByTime]);

  // Animated counter using spring
  const springValue = useSpring(visitCount, { stiffness: 150, damping: 20 });
  const displayValue = useTransform(springValue, (val) => Math.floor(val));
  const [displayCount, setDisplayCount] = useState(visitCount);

  useEffect(() => {
    springValue.set(visitCount);
    const unsubscribe = displayValue.on("change", (v) => setDisplayCount(v));
    return () => unsubscribe();
  }, [visitCount, springValue, displayValue]);

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
