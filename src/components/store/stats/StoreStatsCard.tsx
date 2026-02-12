import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Eye, Package, CheckCircle, Star, Sparkles, 
  Calendar, TrendingUp, RotateCcw, BarChart3 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreStats } from "@/hooks/store/useStoreStats";

interface StoreStatsCardProps {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string | null;
  storeOwnerId?: string;
}

const StoreStatsCard: React.FC<StoreStatsCardProps> = ({
  isOpen,
  onClose,
  colorTheme,
  storeOwnerId,
}) => {
  const { stats, loading } = useStoreStats(storeOwnerId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    },
    {
      title: "مشاهدات اليوم",
      value: stats.todayViews,
      icon: Calendar,
    },
    {
      title: "مشاهدات الأسبوع",
      value: stats.weeklyViews,
      icon: TrendingUp,
    },
    {
      title: "إجمالي المنتجات",
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: "المنتجات النشطة",
      value: stats.activeProducts,
      icon: CheckCircle,
    },
    {
      title: "المنتجات الشائعة",
      value: stats.popularProducts,
      icon: Star,
    },
    {
      title: "المنتجات الجديدة",
      value: stats.newProducts,
      icon: Sparkles,
    },
    {
      title: "عجلة الحظ",
      value: stats.wheelSpins,
      icon: RotateCcw,
    },
    {
      title: "رسائل الذكاء",
      value: stats.aiMessages,
      icon: Sparkles,
    },
  ];

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية الضبابية - نفس بطاقة المشاركة تماماً */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
            style={{ WebkitBackdropFilter: "blur(12px)", backdropFilter: "blur(12px)" }}
          />

          {/* البطاقة العائمة - نفس بطاقة المشاركة تماماً */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm relative">
              {/* زر الإغلاق - نفس بطاقة المشاركة */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* البطاقة الزجاجية - نفس بطاقة المشاركة */}
              <div
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* تأثير الإضاءة العلوي */}
                <div
                  className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
                  }}
                />

                {/* محتوى البطاقة */}
                <div className="relative p-6 text-center text-white">
                  {/* الأيقونة */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center overflow-hidden shadow-lg"
                  >
                    <BarChart3 className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* العنوان */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold mb-1 drop-shadow-lg"
                  >
                    إحصائيات المتجر
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 text-sm mb-4"
                  >
                    متابعة أداء متجرك
                  </motion.p>

                  {/* شبكة الإحصاءات في إطار أبيض مثل QR */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25, type: "spring" }}
                    className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl"
                  >
                    <div className="grid grid-cols-3 gap-3">
                      {statsItems.map((item, index) => (
                        <div key={index} className="text-center py-2">
                          {loading ? (
                            <div className="space-y-1">
                              <Skeleton className="h-5 w-5 mx-auto rounded-md" />
                              <Skeleton className="h-2 w-full" />
                              <Skeleton className="h-4 w-1/2 mx-auto" />
                            </div>
                          ) : (
                            <>
                              <item.icon
                                className="h-5 w-5 mx-auto mb-1"
                                style={{ color: themeColor }}
                              />
                              <p className="text-[9px] text-gray-500 leading-tight">
                                {item.title}
                              </p>
                              <p
                                className="text-base font-bold"
                                style={{ color: themeColor }}
                              >
                                {item.value.toLocaleString("ar-SA")}
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* رسالة */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-white/70 text-xs mt-3"
                  >
                    📊 تحديث تلقائي كل 30 ثانية
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default StoreStatsCard;
