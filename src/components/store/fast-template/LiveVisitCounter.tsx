import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Eye, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LiveVisitCounterProps {
  storeOwnerId?: string;
}

const LiveVisitCounter: React.FC<LiveVisitCounterProps> = ({ storeOwnerId }) => {
  const [visitCount, setVisitCount] = useState(0);
  const [isLive, setIsLive] = useState(false);

  // حساب تاريخ بداية اليوم (الساعة 3 صباحاً)
  const getTodayStartDate = () => {
    const today = new Date();
    today.setHours(3, 0, 0, 0);
    
    if (new Date().getHours() < 3) {
      today.setDate(today.getDate() - 1);
    }
    return today.toISOString();
  };

  // جلب عدد الزيارات الحقيقي من قاعدة البيانات
  const fetchTodayVisits = async () => {
    if (!storeOwnerId) return;

    const { count, error } = await supabase
      .from('visitor_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('store_owner_id', storeOwnerId)
      .gte('created_at', getTodayStartDate());

    if (!error && count !== null) {
      setVisitCount(count);
      setIsLive(true);
    }
  };

  useEffect(() => {
    if (!storeOwnerId) return;

    // جلب العدد فوراً
    fetchTodayVisits();

    // تحديث تلقائي كل 5 ثواني للتأكد من دقة العدد
    const interval = setInterval(fetchTodayVisits, 5000);

    // الاستماع للتحديثات الحية أيضاً
    const channel = supabase
      .channel(`live-visit-counter-${storeOwnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visitor_analytics',
          filter: `store_owner_id=eq.${storeOwnerId}`
        },
        () => {
          // جلب العدد الحقيقي بدلاً من الزيادة اليدوية
          fetchTodayVisits();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [storeOwnerId]);

  // Animated counter using spring - تحديث سريع
  const springValue = useSpring(0, { stiffness: 150, damping: 20 });
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
            {isLive && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[10px] text-green-600 dark:text-green-400">مباشر</span>
              </motion.div>
            )}
          </div>
          
          <motion.div 
            className="text-4xl font-bold text-primary flex items-center gap-2"
            key={displayCount}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            {displayCount}
            {visitCount > 0 && (
              <TrendingUp className="h-5 w-5 text-green-500" />
            )}
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
