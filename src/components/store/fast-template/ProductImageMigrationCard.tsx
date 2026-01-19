import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Server, ArrowRight, Loader2, CheckCircle, XCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { detectImageSource, ImageSource } from "@/utils/imageSourceDetector";

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
      coral: '#ff9178', purple: '#8b5cf6', blue: '#3b82f6',
      green: '#10b981', pink: '#ec4899', teal: '#14b8a6',
    };
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

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

  const themeColor = getThemeColor();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-4 text-white flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}
          >
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              <h3 className="font-bold">إدارة صور المنتجات</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
                    <Cloud className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.r2}</p>
                    <p className="text-xs text-muted-foreground">Cloudflare R2</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                    <Server className="h-6 w-6 mx-auto text-green-500 mb-1" />
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.supabase}</p>
                    <p className="text-xs text-muted-foreground">Supabase</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <div className="h-6 w-6 mx-auto mb-1 flex items-center justify-center">
                      <span className="text-blue-500 font-bold text-xs">CDN</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.cloudinary}</p>
                    <p className="text-xs text-muted-foreground">Cloudinary</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                    <div className="h-6 w-6 mx-auto mb-1 flex items-center justify-center">
                      <span className="text-purple-500 font-bold text-xs">EXT</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.external}</p>
                    <p className="text-xs text-muted-foreground">روابط خارجية</p>
                  </div>
                </div>

                {/* Migration Progress */}
                {migrationProgress && (
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-sm">{migrationProgress}</p>
                  </div>
                )}

                {/* Migration Button */}
                {stats.supabase > 0 && (
                  <Button
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="w-full gap-2"
                    style={{ background: themeColor }}
                  >
                    {isMigrating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري النقل...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        نقل {stats.supabase} صورة إلى R2
                      </>
                    )}
                  </Button>
                )}

                {stats.supabase === 0 && stats.r2 > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center gap-2 justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 dark:text-green-300 text-sm">جميع الصور على R2</span>
                  </div>
                )}

                {/* Refresh Button */}
                <Button
                  onClick={fetchStats}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  تحديث الإحصائيات
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductImageMigrationCard;
