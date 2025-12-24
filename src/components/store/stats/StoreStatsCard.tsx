import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Eye, Package, CheckCircle, Star, Sparkles, 
  Calendar, TrendingUp, RotateCcw, BarChart3 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";

interface StoreStatsCardProps {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string | null;
}

const StoreStatsCard: React.FC<StoreStatsCardProps> = ({
  isOpen,
  onClose,
  colorTheme,
}) => {
  const { stats, loading } = useDashboardStats();

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) {
      return colorTheme;
    }
    
    const themeColors: { [key: string]: string } = {
      coral: '#fb923c',
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#22c55e',
      red: '#ef4444',
      pink: '#ec4899',
      teal: '#14b8a6',
      amber: '#f59e0b',
      indigo: '#6366f1',
      rose: '#f43f5e',
    };
    
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  const statsItems = [
    {
      title: "إجمالي المشاهدات",
      value: stats.totalViews,
      icon: Eye,
      gradient: "from-blue-500/20 to-blue-600/10",
    },
    {
      title: "مشاهدات اليوم",
      value: stats.todayViews,
      icon: Calendar,
      gradient: "from-green-500/20 to-green-600/10",
    },
    {
      title: "مشاهدات الأسبوع",
      value: stats.weeklyViews,
      icon: TrendingUp,
      gradient: "from-emerald-500/20 to-emerald-600/10",
    },
    {
      title: "إجمالي المنتجات",
      value: stats.totalProducts,
      icon: Package,
      gradient: "from-purple-500/20 to-purple-600/10",
    },
    {
      title: "المنتجات النشطة",
      value: stats.activeProducts,
      icon: CheckCircle,
      gradient: "from-amber-500/20 to-amber-600/10",
    },
    {
      title: "المنتجات الشائعة",
      value: stats.popularProducts,
      icon: Star,
      gradient: "from-yellow-500/20 to-yellow-600/10",
    },
    {
      title: "المنتجات الجديدة",
      value: stats.newProducts,
      icon: Sparkles,
      gradient: "from-pink-500/20 to-pink-600/10",
    },
    {
      title: "عجلة الحظ",
      value: stats.wheelSpins,
      icon: RotateCcw,
      gradient: "from-orange-500/20 to-orange-600/10",
    },
    {
      title: "رسائل الذكاء",
      value: stats.aiMessages,
      icon: Sparkles,
      gradient: "from-violet-500/20 to-violet-600/10",
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* الخلفية الضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-xl bg-black/50"
          />

          {/* البطاقة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-[90vw] max-w-md mx-auto"
          >
            {/* زر الإغلاق */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute -top-3 -right-3 z-20 w-10 h-10 rounded-full bg-white/30 backdrop-blur-lg border border-white/40 flex items-center justify-center text-white shadow-xl"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* البطاقة الزجاجية */}
            <div 
              className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
              style={{
                background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* تأثير الإضاءة العلوي */}
              <div 
                className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                }}
              />

              {/* محتوى البطاقة */}
              <div className="relative p-4 sm:p-5 text-white">
                {/* العنوان */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="flex items-center justify-center gap-3 mb-4"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold drop-shadow-lg">
                    إحصائيات المتجر
                  </h2>
                </motion.div>

                {/* شبكة الإحصاءات */}
                <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
                  {statsItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.03 }}
                      className="bg-white/10 backdrop-blur-lg rounded-xl p-2 sm:p-3 border border-white/20 hover:bg-white/20 transition-all"
                    >
                      {loading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-white/20" />
                          <Skeleton className="h-2 sm:h-3 w-full bg-white/20" />
                          <Skeleton className="h-4 sm:h-5 w-1/2 bg-white/20" />
                        </div>
                      ) : (
                        <>
                          <div className={`inline-flex rounded-lg p-1.5 sm:p-2 mb-1.5 sm:mb-2 bg-gradient-to-br ${item.gradient}`}>
                            <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-white/70 leading-tight mb-0.5 sm:mb-1">
                            {item.title}
                          </p>
                          <p className="text-sm sm:text-lg font-bold text-white">
                            {item.value.toLocaleString('ar-SA')}
                          </p>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* رسالة أسفل البطاقة */}
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 text-[10px] sm:text-xs mt-3 sm:mt-4 text-center"
                >
                  📊 تحديث تلقائي كل 30 ثانية
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StoreStatsCard;
