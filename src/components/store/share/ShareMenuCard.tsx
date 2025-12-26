import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, Copy, Check, X, QrCode, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { logVisitorActivity } from "@/hooks/analytics/useActivityLogger";

interface ShareMenuCardProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  slug?: string;
  colorTheme?: string | null;
  logoUrl?: string | null;
  productsCount?: number;
  storeOwnerId?: string;
}

const ShareMenuCard: React.FC<ShareMenuCardProps> = ({
  isOpen,
  onClose,
  storeName = "المنيو الرقمي",
  slug,
  colorTheme,
  logoUrl,
  productsCount = 0,
  storeOwnerId,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // رابط المتجر - استخدام الدومين المخصص
  const storeUrl = slug 
    ? `https://qrmenuc.com/${slug}` 
    : window.location.href;

  // الحصول على لون الثيم
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
    };
    
    return themeColors[colorTheme || ''] || '#3b82f6';
  };

  const themeColor = getThemeColor();

  // تسجيل نشاط المشاركة
  useEffect(() => {
    if (isOpen && storeOwnerId) {
      logVisitorActivity(storeOwnerId, 'share_menu', { store_name: storeName });
    }
  }, [isOpen, storeOwnerId, storeName]);

  // نسخ الرابط
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("تم نسخ الرابط!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("فشل نسخ الرابط");
    }
  }, [storeUrl]);

  // تحميل البطاقة كصورة
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement('a');
      link.download = `${storeName || 'menu'}-share-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("تم تحميل البطاقة!");
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error("فشل تحميل البطاقة");
    } finally {
      setIsDownloading(false);
    }
  }, [storeName]);

  // مشاركة مباشرة
  const handleShare = useCallback(async () => {
    const shareData = {
      title: storeName || "المنيو الرقمي",
      text: `تصفح منيو ${storeName} الرقمي! 🍽️`,
      url: storeUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // المستخدم ألغى المشاركة
      }
    } else {
      handleCopyLink();
    }
  }, [storeName, storeUrl, handleCopyLink]);

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
                ref={cardRef}
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
                  {/* الشعار */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center overflow-hidden shadow-lg"
                  >
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={storeName || "Logo"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <QrCode className="w-10 h-10 text-white" />
                    )}
                  </motion.div>

                  {/* اسم المتجر */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold mb-1 drop-shadow-lg"
                  >
                    {storeName}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 text-sm mb-4"
                  >
                    {productsCount > 0 
                      ? `${productsCount} منتج متاح` 
                      : "المنيو الرقمي"}
                  </motion.p>

                  {/* QR Code في إطار زجاجي */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25, type: "spring" }}
                    className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl mx-auto max-w-[180px]"
                  >
                    <QRCode
                      value={storeUrl}
                      size={140}
                      level="H"
                      fgColor={themeColor}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </motion.div>

                  {/* الرابط */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20"
                  >
                    <p className="text-white/90 text-xs truncate flex items-center justify-center gap-1" dir="ltr">
                      <ExternalLink className="w-3 h-3" />
                      {storeUrl}
                    </p>
                  </motion.div>

                  {/* رسالة */}
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-white/70 text-xs mt-3"
                  >
                    امسح الكود لتصفح المنيو 📱
                  </motion.p>
                </div>
              </div>

              {/* أزرار الإجراءات - خارج البطاقة */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-2 mt-4"
              >
                {/* نسخ الرابط */}
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-1 h-12 rounded-2xl bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
                >
                  {copied ? (
                    <Check className="w-5 h-5 mr-2 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-sm">نسخ</span>
                </Button>

                {/* تحميل */}
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1 h-12 rounded-2xl bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="w-5 h-5 mr-2" />
                  <span className="text-sm">تحميل</span>
                </Button>

                {/* مشاركة */}
                <Button
                  onClick={handleShare}
                  className="flex-1 h-12 rounded-2xl shadow-lg"
                  style={{ backgroundColor: themeColor }}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  <span className="text-sm">مشاركة</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareMenuCard;
