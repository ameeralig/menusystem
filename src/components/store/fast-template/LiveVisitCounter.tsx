import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Eye } from "lucide-react";

const LiveVisitCounter: React.FC = () => {
  const [visitCount, setVisitCount] = useState(0);
  
  // Get or initialize today's visit count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('qrm_visit_data');
    
    let data = { date: today, count: 0 };
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      // Reset if it's a new day (after 3 AM)
      const now = new Date();
      const resetHour = 3;
      if (parsed.date !== today && now.getHours() >= resetHour) {
        data = { date: today, count: 1 };
      } else {
        data = { ...parsed, count: parsed.count + 1 };
      }
    } else {
      data = { date: today, count: 1 };
    }
    
    localStorage.setItem('qrm_visit_data', JSON.stringify(data));
    setVisitCount(data.count);
  }, []);

  // Animated counter using spring
  const springValue = useSpring(0, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(springValue, (val) => Math.floor(val));
  const [displayCount, setDisplayCount] = useState(0);

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
  const subText = "المنصات الذكية ما تنتظر… هي تسبق";
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
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 py-6 px-4 shadow-sm"
      >
        {/* عداد الزيارات */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span className="text-sm">عدد الزيارات اليوم</span>
          </div>
          
          <motion.div 
            className="text-4xl font-bold text-primary"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {displayCount}
          </motion.div>
        </div>

        {/* النص التسويقي */}
        <div className="text-center space-y-2">
          <p 
            className="text-sm font-semibold text-foreground/90 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: highlightText(mainText, highlightKeywords) 
            }}
          />
          <p 
            className="text-xs text-muted-foreground/80"
            dangerouslySetInnerHTML={{ 
              __html: highlightText(subText, highlightKeywords) 
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LiveVisitCounter;
