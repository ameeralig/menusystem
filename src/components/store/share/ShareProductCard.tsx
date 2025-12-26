import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Download, Copy, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Product, getDiscountedPrice, hasDiscount } from "@/types/product";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface ShareProductCardProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  storeName?: string;
  slug?: string;
  colorTheme?: string | null;
}

// تنسيق السعر
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price);
};

const ShareProductCard: React.FC<ShareProductCardProps> = ({
  isOpen,
  onClose,
  product,
  storeName = "المنيو الرقمي",
  slug,
  colorTheme,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // رابط المنتج
  const productUrl = slug && product
    ? `https://qrmenuc.com/${slug}?product=${product.id}`
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
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success("تم نسخ رابط المنتج!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("فشل نسخ الرابط");
    }
  }, [productUrl]);

  // تحميل البطاقة كصورة
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      // انتظار تحميل الصورة
      const imgElement = cardRef.current.querySelector('img');
      if (imgElement && !imgElement.complete) {
        await new Promise((resolve) => {
          imgElement.onload = resolve;
          imgElement.onerror = resolve;
        });
      }
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: getThemeColor(),
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.querySelector('[data-card]');
          if (clonedCard) {
            (clonedCard as HTMLElement).style.backdropFilter = 'none';
          }
        }
      });
      
      const link = document.createElement('a');
      link.download = `${product?.name || 'product'}-share.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success("تم تحميل البطاقة!");
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error("فشل تحميل البطاقة");
    } finally {
      setIsDownloading(false);
    }
  }, [product?.name, getThemeColor]);

  // مشاركة مباشرة
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "منتج",
          url: productUrl,
        });
      } catch (error) {
        // المستخدم ألغى المشاركة
      }
    } else {
      handleCopyLink();
    }
  }, [product?.name, productUrl, handleCopyLink]);

  if (!isOpen || !product) return null;

  const displayPrice = hasDiscount(product.discount_percentage) 
    ? getDiscountedPrice(product.price, product.discount_percentage)
    : product.price;

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
                data-card
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                }}
              >
                {/* تأثير الإضاءة العلوي */}
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-30"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                  }}
                />

                {/* صورة المنتج */}
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={optimizeImageUrl(product.image_url, 'medium')}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image";
                    }}
                  />
                  {/* تدرج علوي */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 50%, ${themeColor}dd 100%)`,
                    }}
                  />
                  
                  {/* شارات */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.is_new && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        جديد
                      </span>
                    )}
                    {product.is_popular && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        مميز
                      </span>
                    )}
                    {hasDiscount(product.discount_percentage) && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        خصم {product.discount_percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* محتوى البطاقة */}
                <div className="relative p-5 text-center text-white">
                  {/* اسم المنتج */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold mb-1 drop-shadow-lg"
                  >
                    {product.name}
                  </motion.h2>
                  
                  {/* اسم المتجر */}
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 text-sm mb-3"
                  >
                    من {storeName}
                  </motion.p>

                  {/* السعر */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25, type: "spring" }}
                    className="bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-xl mx-auto inline-block"
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <span 
                        className="text-2xl font-bold"
                        style={{ color: themeColor }}
                      >
                        {formatPrice(displayPrice)} د.ع
                      </span>
                      {hasDiscount(product.discount_percentage) && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
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
                      {productUrl}
                    </p>
                  </motion.div>

                  {/* رسالة */}
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-white/70 text-xs mt-3"
                  >
                    شارك هذا المنتج مع أصدقائك 🛍️
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

export default ShareProductCard;
