import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // التحقق من التثبيت السابق
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white/10 backdrop-blur-lg border-white/20">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#3baaff] to-[#0EA5E9] rounded-2xl flex items-center justify-center shadow-2xl">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ثبّت تطبيق QRM
            </h1>
            <p className="text-white/80 text-lg">
              احصل على تجربة أفضل وأسرع مع التطبيق!
            </p>
          </div>

          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg">تم التثبيت بنجاح! 🎉</span>
              </div>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-[#3baaff] to-[#0EA5E9] hover:opacity-90"
                size="lg"
              >
                انتقل للصفحة الرئيسية
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 text-right">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[#3baaff] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">سرعة فائقة</h3>
                    <p className="text-white/70 text-sm">يفتح فوراً بدون تحميل</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[#3baaff] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">يعمل بدون إنترنت</h3>
                    <p className="text-white/70 text-sm">استخدمه في أي مكان وزمان</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[#3baaff] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">سهولة الوصول</h3>
                    <p className="text-white/70 text-sm">أيقونة على شاشة هاتفك</p>
                  </div>
                </div>
              </div>

              {deferredPrompt ? (
                <Button
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-[#3baaff] to-[#0EA5E9] hover:opacity-90"
                  size="lg"
                >
                  <Download className="ml-2 h-5 w-5" />
                  ثبّت الآن
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/90 text-sm text-center mb-2">
                      لتثبيت التطبيق على جهازك:
                    </p>
                    <div className="text-white/70 text-sm space-y-2 text-right">
                      <p>• <strong>iPhone/iPad:</strong> اضغط على أيقونة المشاركة <span className="inline-block">⬆️</span> ثم "إضافة إلى الشاشة الرئيسية"</p>
                      <p>• <strong>Android:</strong> افتح قائمة المتصفح واختر "إضافة إلى الشاشة الرئيسية"</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    متابعة بدون تثبيت
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InstallPWA;
