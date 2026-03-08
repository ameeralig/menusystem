import React, { useState, useEffect } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Eye, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LiveVisitCounterProps {
  storeOwnerId?: string;
  colorTheme?: string | null;
  variant?: "default" | "editorial";
}

const LiveVisitCounter: React.FC<LiveVisitCounterProps> = ({
  storeOwnerId,
  colorTheme,
  variant = "default",
}) => {
  const [totalViews, setTotalViews] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!storeOwnerId) return;
    const fetchViews = async () => {
      const { data } = await supabase
        .from("page_views")
        .select("view_count")
        .eq("user_id", storeOwnerId)
        .maybeSingle();
      setTotalViews(data?.view_count || 0);
      setIsLoaded(true);
    };
    fetchViews();
  }, [storeOwnerId]);

  // Animated spring counter
  const springValue = useSpring(0, { stiffness: 40, damping: 18 });
  const displayValue = useTransform(springValue, (v) => Math.floor(v));
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (isLoaded) {
      springValue.set(totalViews);
    }
  }, [totalViews, isLoaded, springValue]);

  useEffect(() => {
    const unsub = displayValue.on("change", (v) => setDisplayCount(v));
    return () => unsub();
  }, [displayValue]);

  if (!storeOwnerId || totalViews === 0) return null;

  const formattedCount = displayCount.toLocaleString("ar-EG");

  // ═══════ القالب التحريري (Editorial) ═══════
  if (variant === "editorial") {
    const themeColor = colorTheme?.startsWith("#") ? colorTheme : "#2980b9";
    return (
      <div className="mt-6 mb-32 mx-4" style={{ direction: "rtl" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(160deg, ${themeColor}10 0%, ${themeColor}05 100%)`,
            border: `1px solid ${themeColor}20`,
          }}
        >
          <div className="px-5 py-4 flex items-center gap-4">
            {/* أيقونة متحركة */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${themeColor}15` }}
            >
              <Eye className="w-5 h-5" style={{ color: themeColor }} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 mb-0.5">إجمالي المشاهدات</p>
              <div className="flex items-baseline gap-2">
                <motion.span
                  className="text-2xl font-black tabular-nums"
                  style={{ color: themeColor }}
                >
                  {formattedCount}
                </motion.span>
                <span className="text-xs text-gray-400">مشاهدة</span>
              </div>
            </div>

            {/* شارة */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: `${themeColor}12`, color: themeColor }}
            >
              <TrendingUp className="w-3 h-3" />
              نشط
            </motion.div>
          </div>

          {/* شريط تقدم متحرك */}
          <div className="h-1 w-full" style={{ background: `${themeColor}08` }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${themeColor}60, ${themeColor})`,
              }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════ القالب الافتراضي (Default / Fast) ═══════
  return (
    <div className="mt-6 mb-32 mx-4" style={{ direction: "rtl" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* توهج خلفي */}
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* نقاط مضيئة */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            className="absolute w-1 h-1 rounded-full bg-primary/50"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
            }}
          />
        ))}

        <div className="relative z-10 p-5">
          {/* العنوان + الأيقونة */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center"
              >
                <Eye className="w-4.5 h-4.5 text-primary" />
              </motion.div>
              <span className="text-[13px] font-medium text-white/60">إجمالي المشاهدات</span>
            </div>

            {/* نبض حي */}
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <span className="text-[10px] text-emerald-400/80 font-medium">مباشر</span>
            </div>
          </div>

          {/* العداد الرئيسي */}
          <div className="flex items-end justify-center gap-2 mb-4">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={displayCount}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[42px] font-black text-white leading-none tabular-nums tracking-tight"
                style={{
                  textShadow: "0 0 30px hsl(var(--primary) / 0.3), 0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {formattedCount}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-white/40 mb-1.5 font-medium">مشاهدة</span>
          </div>

          {/* شريط تقدم متوهج */}
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
              className="h-full rounded-full relative"
              style={{
                background: "linear-gradient(90deg, hsl(var(--primary) / 0.5), hsl(var(--primary)), hsl(var(--primary) / 0.8))",
              }}
            >
              {/* وميض يتحرك */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, delay: 3, ease: "easeInOut" }}
                className="absolute inset-0 w-1/3"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                }}
              />
            </motion.div>
          </div>

          {/* نص تسويقي */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-[11px] text-white/30 mt-3 flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            يثق بنا أكثر من 130 شريك لتقديم تجربة مميزة
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveVisitCounter;
