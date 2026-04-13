import { usePWAInstall } from '@/hooks/store/usePWAInstall';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PWAInstallBannerProps {
  storeName?: string;
}

const PWAInstallBanner = ({ storeName }: PWAInstallBannerProps) => {
  const { canInstall, isIOS, isInstalled, showBanner, installApp, dismissBanner } = usePWAInstall();

  // لا تظهر البانر إذا التطبيق مثبت أو البانر مخفي
  if (isInstalled || !showBanner) return null;

  // لا تظهر إذا ليس Android ولا iOS
  if (!canInstall && !isIOS) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-5 pb-3">
          <button 
            onClick={dismissBanner}
            className="absolute top-3 left-3 p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex flex-col items-center text-center gap-3">
            {/* أيقونة التطبيق */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Download className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-foreground">
                تثبيت {storeName || 'المتجر'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                ثبّت التطبيق للوصول السريع في أي وقت
              </p>
            </div>
          </div>
        </div>

        {/* المحتوى */}
        <div className="px-5 pb-5">
          {isIOS ? (
            // تعليمات iOS
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-3">
                اتبع الخطوات التالية لتثبيت التطبيق:
              </p>
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">اضغط على زر</span>
                    <Share className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">المشاركة</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">اختر</span>
                    <PlusSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">إضافة للشاشة الرئيسية</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <span className="text-sm text-foreground">اضغط "إضافة" للتأكيد</span>
                </div>
              </div>
              
              <Button
                onClick={dismissBanner}
                variant="outline"
                className="w-full mt-3"
              >
                فهمت، شكراً
              </Button>
            </div>
          ) : (
            // زر تثبيت Android
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                <span>✓ وصول سريع من الشاشة الرئيسية</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                <span>✓ تجربة تطبيق كاملة</span>
              </div>
              
              <Button
                onClick={installApp}
                className="w-full mt-2 gap-2"
                size="lg"
              >
                <Download className="w-5 h-5" />
                تثبيت التطبيق
              </Button>
              
              <button
                onClick={dismissBanner}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                ليس الآن
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
