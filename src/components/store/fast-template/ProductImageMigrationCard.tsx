import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Server, ArrowRight, Loader2, CheckCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { detectImageSource } from "@/utils/imageSourceDetector";

interface ProductImageMigrationCardProps {
  isOpen: boolean;
  onClose: () => void;
  storeOwnerId: string;
  colorTheme?: string | null;
  onMigrationComplete?: () => void;
}

interface ImageStats {
  total: number;
  r2: number;
  supabase: number;
  cloudinary: number;
  external: number;
}

const ProductImageMigrationCard = ({
  isOpen,
  onClose,
  storeOwnerId,
  colorTheme,
  onMigrationComplete
}: ProductImageMigrationCardProps) => {
  const [stats, setStats] = useState<ImageStats>({ total: 0, r2: 0, supabase: 0, cloudinary: 0, external: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState("");

  const getThemeColor = () => {
    if (colorTheme?.startsWith('#')) return colorTheme;
    const themeColors: { [key: string]: string } = {
      coral: '#fb923c', purple: '#a855f7', blue: '#3b82f6',
      green: '#22c55e', pink: '#ec4899', teal: '#14b8a6',
      red: '#ef4444',
    };
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data: products } = await supabase
        .from("products")
        .select("image_url")
        .eq("user_id", storeOwnerId);

      if (products) {
        const newStats: ImageStats = { total: products.length, r2: 0, supabase: 0, cloudinary: 0, external: 0 };
        products.forEach(p => {
          const source = detectImageSource(p.image_url);
          if (source === 'r2') newStats.r2++;
          else if (source === 'supabase') newStats.supabase++;
          else if (source === 'cloudinary') newStats.cloudinary++;
          else if (source === 'external') newStats.external++;
        });
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && storeOwnerId) {
      fetchStats();
    }
  }, [isOpen, storeOwnerId]);

  const handleMigration = async () => {
    if (stats.supabase === 0) {
      toast.info("لا توجد صور للنقل من Supabase");
      return;
    }
    setIsMigrating(true);
    setMigrationProgress("جاري بدء عملية النقل...");
    try {
      const { data, error } = await supabase.functions.invoke("migrate-product-images-to-r2", {
        body: { userId: storeOwnerId }
      });
      if (error) throw error;
      if (data.success) {
        toast.success(data.message);
        setMigrationProgress(`تم نقل ${data.results.migrated} صورة بنجاح`);
        fetchStats();
        onMigrationComplete?.();
      } else {
        throw new Error(data.error || "فشل النقل");
      }
    } catch (error: any) {
      console.error("Migration error:", error);
      toast.error(`خطأ: ${error.message}`);
      setMigrationProgress("فشلت عملية النقل");
    } finally {
      setIsMigrating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية الضبابية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 backdrop-blur-md bg-black/40"
          />

          {/* البطاقة العائمة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm">
              {/* زر الإغلاق */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white shadow-lg"
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
                  className="absolute top-0 left-0 right-0 h-32 opacity-30"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                  }}
                />

                {/* محتوى البطاقة */}
                <div className="relative p-6 text-center text-white">
                  {/* أيقونة */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg"
                  >
                    <Cloud className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* العنوان */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold mb-1 drop-shadow-lg"
                  >
                    إدارة صور المنتجات
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 text-sm mb-5"
                  >
                    {stats.total} صورة إجمالية
                  </motion.p>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-white/70" />
                    </div>
                  ) : (
                    <>
                      {/* الإحصائيات */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25, type: "spring" }}
                        className="grid grid-cols-2 gap-2 mb-4"
                      >
                        <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center border border-white/10">
                          <Cloud className="h-5 w-5 mx-auto text-white/90 mb-1" />
                          <p className="text-2xl font-bold">{stats.r2}</p>
                          <p className="text-[10px] text-white/70">Cloudflare R2</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center border border-white/10">
                          <Server className="h-5 w-5 mx-auto text-white/90 mb-1" />
                          <p className="text-2xl font-bold">{stats.supabase}</p>
                          <p className="text-[10px] text-white/70">Supabase</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center border border-white/10">
                          <span className="text-[10px] font-bold text-white/90">CDN</span>
                          <p className="text-2xl font-bold">{stats.cloudinary}</p>
                          <p className="text-[10px] text-white/70">Cloudinary</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center border border-white/10">
                          <span className="text-[10px] font-bold text-white/90">EXT</span>
                          <p className="text-2xl font-bold">{stats.external}</p>
                          <p className="text-[10px] text-white/70">روابط خارجية</p>
                        </div>
                      </motion.div>

                      {/* حالة النقل */}
                      {migrationProgress && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 border border-white/20 mb-3"
                        >
                          <p className="text-sm text-white/90">{migrationProgress}</p>
                        </motion.div>
                      )}

                      {/* رسالة النجاح */}
                      {stats.supabase === 0 && stats.r2 > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 border border-white/20 mb-3 flex items-center gap-2 justify-center"
                        >
                          <CheckCircle className="h-4 w-4 text-green-300" />
                          <span className="text-sm text-white/90">جميع الصور على R2 ✨</span>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* أزرار الإجراءات - خارج البطاقة */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-2 mt-4"
              >
                {/* تحديث */}
                <Button
                  variant="outline"
                  onClick={fetchStats}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-2xl bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="text-sm">تحديث</span>
                </Button>

                {/* نقل إلى R2 */}
                {stats.supabase > 0 && (
                  <Button
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="flex-1 h-12 rounded-2xl shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    {isMigrating ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5 mr-2" />
                    )}
                    <span className="text-sm">
                      {isMigrating ? 'جاري النقل...' : `نقل ${stats.supabase} صورة`}
                    </span>
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductImageMigrationCard;
