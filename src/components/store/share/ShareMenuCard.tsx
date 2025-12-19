import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, Copy, Check, X, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface ShareMenuCardProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  slug?: string;
  colorTheme?: string | null;
  logoUrl?: string | null;
  productsCount?: number;
}

const ShareMenuCard: React.FC<ShareMenuCardProps> = ({
  isOpen,
  onClose,
  storeName = "المنيو الرقمي",
  slug,
  colorTheme,
  logoUrl,
  productsCount = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // رابط المتجر
  const storeUrl = slug 
    ? `${window.location.origin}/store/${slug}` 
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
      // استخدام html2canvas لالتقاط البطاقة
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
      text: `تصفح منيو ${storeName} الرقمي!`,
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            شارك المنيو
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-0 space-y-4">
          {/* البطاقة الرقمية */}
          <div 
            ref={cardRef}
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
            }}
          >
            {/* رأس البطاقة */}
            <div className="p-6 text-center text-white">
              {/* الشعار أو أيقونة */}
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={storeName || "Logo"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <QrCode className="w-10 h-10 text-white" />
                )}
              </div>

              {/* اسم المتجر */}
              <h2 className="text-2xl font-bold mb-2">{storeName}</h2>
              <p className="text-white/80 text-sm">
                {productsCount > 0 
                  ? `${productsCount} منتج متاح` 
                  : "المنيو الرقمي"}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 mx-4 mb-4 rounded-xl">
              <div className="flex justify-center">
                <QRCode
                  value={storeUrl}
                  size={140}
                  level="H"
                  fgColor={themeColor}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                امسح الكود لتصفح المنيو
              </p>
            </div>

            {/* الرابط */}
            <div className="bg-white/10 backdrop-blur px-4 py-3 text-center">
              <p className="text-white/90 text-xs truncate" dir="ltr">
                {storeUrl}
              </p>
            </div>
          </div>

          {/* أزرار المشاركة */}
          <div className="grid grid-cols-3 gap-2">
            {/* نسخ الرابط */}
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              <span className="text-xs">نسخ الرابط</span>
            </Button>

            {/* تحميل */}
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs">تحميل</span>
            </Button>

            {/* مشاركة */}
            <Button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 h-auto py-3"
              style={{ backgroundColor: themeColor }}
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs">مشاركة</span>
            </Button>
          </div>

          {/* رسالة تحفيزية */}
          <p className="text-center text-xs text-muted-foreground">
            شارك البطاقة مع أصدقائك ليتعرفوا على منيوك! 🚀
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareMenuCard;
