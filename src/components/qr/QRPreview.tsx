import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { QRSettings } from "@/pages/QRGenerator";
import QRCode from "qrcode";
import QRCodeStyling from "qr-code-styling";
import { toast } from "sonner";

interface QRPreviewProps {
  settings: QRSettings;
}

const QRPreview = ({ settings }: QRPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const generateQR = async () => {
    if (!canvasRef.current || !settings.text.trim()) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;

    try {
      // استخدام QRCodeStyling للميزات المتقدمة
      const qrCode = new QRCodeStyling({
        width: settings.size,
        height: settings.size,
        data: settings.text,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: settings.errorLevel
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: (settings.logoSize / 100) * settings.size,
          margin: 2,
          crossOrigin: "anonymous"
        },
        dotsOptions: {
          type: (settings.dotsType as any) || "square",
          color: settings.dotsColor || settings.foregroundColor
        },
        backgroundOptions: {
          color: settings.backgroundColor
        },
        cornersSquareOptions: {
          type: (settings.cornerSquareType as any) || "square",
          color: settings.cornerSquareColor || settings.foregroundColor
        },
        cornersDotOptions: {
          type: (settings.cornerDotType as any) || "square",
          color: settings.cornerDotColor || settings.foregroundColor
        }
      });

      // إضافة اللوجو إذا كان موجوداً
      if (settings.logoFile) {
        const logoUrl = URL.createObjectURL(settings.logoFile);
        qrCode.update({
          image: logoUrl
        });
      }

      // رسم مباشرة على Canvas
      canvas.width = settings.size;
      canvas.height = settings.size;
      await qrCode.append(canvas);
      setQrDataUrl(canvas.toDataURL('image/png'));

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error("حدث خطأ في توليد رمز QR");
    } finally {
      setIsGenerating(false);
    }
  };

  const addLogoToCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!settings.logoFile) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const logoSizeRatio = settings.logoSize / 100;
          const logoSize = canvas.width * logoSizeRatio;
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;

          // إضافة خلفية بيضاء خلف اللوجو
          ctx.fillStyle = settings.backgroundColor;
          ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);

          // رسم اللوجو
          ctx.drawImage(img, x, y, logoSize, logoSize);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(settings.logoFile);
    });
  };

  const downloadQR = () => {
    if (!qrDataUrl) {
      toast.error("لا يوجد رمز QR للتحميل");
      return;
    }

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تحميل رمز QR بنجاح");
  };

  // إعادة توليد QR عند تغيير الإعدادات
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateQR();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [settings]);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          معاينة رمز QR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* منطقة المعاينة */}
        <div className="flex justify-center p-6 bg-muted/30 rounded-lg">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">جاري إنشاء رمز QR...</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-lg shadow-sm"
              style={{ imageRendering: 'pixelated' }}
            />
          )}
        </div>

        {/* معلومات الرمز */}
        {settings.text && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">تفاصيل الرمز:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">المحتوى:</span> {settings.text.slice(0, 50)}{settings.text.length > 50 ? '...' : ''}</p>
              <p><span className="font-medium">الحجم:</span> {settings.size}x{settings.size} بكسل</p>
              <p><span className="font-medium">مستوى تصحيح الأخطاء:</span> {settings.errorLevel}</p>
              {settings.logoFile && (
                <p><span className="font-medium">اللوجو:</span> {settings.logoFile.name} ({settings.logoSize}%)</p>
              )}
            </div>
          </div>
        )}

        {/* أزرار العمل */}
        <div className="flex gap-2">
          <Button 
            onClick={downloadQR}
            disabled={!qrDataUrl || isGenerating}
            className="flex-1"
          >
            <Download className="w-4 h-4 me-2" />
            تحميل PNG
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => generateQR()}
            disabled={isGenerating}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* تحذيرات */}
        {settings.logoFile && settings.logoSize > 30 && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ حجم اللوجو كبير جداً قد يؤثر على قابلية قراءة الرمز
            </p>
          </div>
        )}

        {settings.foregroundColor === settings.backgroundColor && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-xs text-red-800">
              ❌ لون المقدمة والخلفية متطابقان، الرمز غير قابل للقراءة
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRPreview;