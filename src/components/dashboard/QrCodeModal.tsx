
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl: string;
}

const QrCodeModal = ({ isOpen, onClose, storeUrl }: QrCodeModalProps) => {
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (storeUrl) {
      try {
        // استخدم الرابط كما هو دون تغيير لأننا متأكدين أنه رابط كامل
        console.log("إنشاء رمز QR للرابط:", storeUrl);
        setQrValue(storeUrl);
      } catch (error) {
        console.error("حدث خطأ أثناء معالجة رابط المتجر:", error);
        setQrValue("https://qrmenuc.com");
      }
    }
  }, [storeUrl]);

  const handleDownload = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) {
      console.error("تعذر العثور على عنصر رمز QR");
      return;
    }
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        
        const downloadLink = document.createElement("a");
        downloadLink.download = "qrmenu-store.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">رمز QR لمتجرك</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg">
            {qrValue && (
              <QRCode
                id="qr-code"
                value={qrValue}
                size={200}
                level="H"
                className="mx-auto"
              />
            )}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground break-all">
            رابط المتجر: {qrValue}
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            يمكنك طباعة هذا الرمز أو مشاركته مع عملائك للوصول السريع إلى متجرك
          </p>
        </div>
        <DialogFooter className="flex justify-center gap-2 sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
          <Button onClick={handleDownload}>
            تحميل الرمز
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeModal;
