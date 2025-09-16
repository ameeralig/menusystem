import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { QRSettings } from "@/pages/QRGenerator";

import QRCodeStyling from "qr-code-styling";
import { toast } from "sonner";

interface QRPreviewProps {
  settings: QRSettings;
}

const QRPreview = ({ settings }: QRPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const prevUrlRef = useRef<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const generateQR = async () => {
    if (!settings.text.trim()) return;

    setIsGenerating(true);

    try {
      // إنشاء أو تحديث نسخة واحدة فقط من QRCodeStyling وإرفاقها بحاوية div
      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling({
          width: settings.size,
          height: settings.size,
          data: settings.text,
          type: 'canvas',
          margin: 10,
          qrOptions: {
            typeNumber: 0,
            mode: 'Byte',
            errorCorrectionLevel: settings.errorLevel,
          },
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: settings.logoSize / 100, // نسبة مئوية (1% -> 0.01)
            margin: 2,
            crossOrigin: 'anonymous',
          },
          dotsOptions: {
            type: (settings.dotsType as any) || 'square',
            color: settings.dotsColor || settings.foregroundColor,
          },
          backgroundOptions: {
            color: settings.backgroundColor,
          },
          cornersSquareOptions: {
            type: (settings.cornerSquareType as any) || 'square',
            color: settings.cornerSquareColor || settings.foregroundColor,
          },
          cornersDotOptions: {
            type: (settings.cornerDotType as any) || 'square',
            color: settings.cornerDotColor || settings.foregroundColor,
          },
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          await qrRef.current.append(containerRef.current);
        }
      }

      const logoUrl = settings.logoFile ? URL.createObjectURL(settings.logoFile) : undefined;

      await qrRef.current.update({
        width: settings.size,
        height: settings.size,
        data: settings.text,
        image: logoUrl,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: settings.errorLevel,
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: settings.logoSize / 100,
          margin: 2,
          crossOrigin: 'anonymous',
        },
        dotsOptions: {
          type: (settings.dotsType as any) || 'square',
          color: settings.dotsColor || settings.foregroundColor,
        },
        backgroundOptions: {
          color: settings.backgroundColor,
        },
        cornersSquareOptions: {
          type: (settings.cornerSquareType as any) || 'square',
          color: settings.cornerSquareColor || settings.foregroundColor,
        },
        cornersDotOptions: {
          type: (settings.cornerDotType as any) || 'square',
          color: settings.cornerDotColor || settings.foregroundColor,
        },
      });

      // توليد رابط تحميل آمن من Blob
      if (qrRef.current && (qrRef.current as any).getRawData) {
        const blob = await (qrRef.current as any).getRawData('png');
        if (blob) {
          const url = URL.createObjectURL(blob as Blob);
          if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
          prevUrlRef.current = url;
          setQrDataUrl(url);
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('حدث خطأ في توليد رمز QR');
    } finally {
      setIsGenerating(false);
    }
  };


  const downloadQR = async () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('تم تحميل رمز QR بنجاح');
      return;
    }

    if (qrRef.current && (qrRef.current as any).download) {
      await (qrRef.current as any).download({ name: `qr-code-${Date.now()}`, extension: 'png' });
      toast.success('تم تحميل رمز QR بنجاح');
      return;
    }

    toast.error('لا يوجد رمز QR للتحميل');
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
        <div className="relative flex justify-center p-6 bg-muted/30 rounded-lg">
          <div
            ref={containerRef}
            className="max-w-full h-auto rounded-lg shadow-sm"
            style={{ imageRendering: 'pixelated' }}
          />

          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">جاري إنشاء رمز QR...</p>
              </div>
            </div>
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