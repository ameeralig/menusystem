
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
      // تأكد من أن الرابط يحتوي على بروتوكول HTTP/HTTPS
      if (!storeUrl.startsWith('http')) {
        setQrValue(`https://${storeUrl}`);
      } else {
        setQrValue(storeUrl);
      }
    }
  }, [storeUrl]);

  const handleDownload = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      // Download PNG
      const downloadLink = document.createElement("a");
      downloadLink.download = "store-qr-code.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">رمز QR لمتجرك</DialogTitle>
          <DialogDescription className="text-center">
            امسح هذا الرمز للوصول إلى متجرك
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg">
            {qrValue && (
              <QRCode
                id="qr-code"
                value={qrValue}
                size={200}
                level="H"
              />
            )}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            يمكنك طباعة هذا الرمز أو مشاركته مع عملائك للوصول السريع إلى متجرك
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground font-mono break-all">
            {qrValue}
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
