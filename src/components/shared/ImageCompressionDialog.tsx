import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { optimizeImage } from "@/utils/storageHelpers";

interface ImageCompressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onConfirm: (file: File) => Promise<void>;
  title?: string;
  description?: string;
}

const ImageCompressionDialog = ({
  open,
  onOpenChange,
  file,
  onConfirm,
  title = "ضغط الصورة",
  description = "يمكنك اختيار ضغط الصورة لتقليل حجمها قبل الرفع",
}: ImageCompressionDialogProps) => {
  const [enableCompression, setEnableCompression] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && open) {
      // إنشاء معاينة للصورة
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // ضغط الصورة تلقائياً إذا كان الخيار مفعل
      if (enableCompression) {
        compressImage();
      }
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, open]);

  useEffect(() => {
    if (file && enableCompression && open) {
      compressImage();
    } else if (file && !enableCompression) {
      setCompressedFile(null);
    }
  }, [enableCompression]);

  const compressImage = async () => {
    if (!file) return;
    
    setIsCompressing(true);
    try {
      const compressed = await optimizeImage(file);
      setCompressedFile(compressed);
    } catch (error) {
      console.error("خطأ في ضغط الصورة:", error);
      setCompressedFile(null);
    } finally {
      setIsCompressing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getCompressionRate = (): number => {
    if (!file || !compressedFile || !enableCompression) return 0;
    return Math.round(((file.size - compressedFile.size) / file.size) * 100);
  };

  const handleConfirm = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileToUpload = enableCompression && compressedFile ? compressedFile : file;
      await onConfirm(fileToUpload);
      onOpenChange(false);
      // إعادة تعيين الحالة
      setCompressedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCompressedFile(null);
    setPreviewUrl(null);
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
          <DialogDescription className="text-right">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* معاينة الصورة */}
          {previewUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={previewUrl} 
                alt="معاينة" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* خيار الضغط */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <Switch
                id="compression"
                checked={enableCompression}
                onCheckedChange={setEnableCompression}
                disabled={isCompressing || isUploading}
              />
              <Label htmlFor="compression" className="cursor-pointer">
                تفعيل ضغط الصورة
              </Label>
            </div>
          </div>

          {/* معلومات الحجم */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">الحجم الأصلي:</span>
              <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span>
            </div>

            {enableCompression && (
              <>
                {isCompressing ? (
                  <div className="flex justify-center items-center p-3 rounded-lg bg-muted/50">
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    <span className="text-sm">جاري ضغط الصورة...</span>
                  </div>
                ) : compressedFile ? (
                  <>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">الحجم بعد الضغط:</span>
                      <span className="text-sm text-muted-foreground">{formatFileSize(compressedFile.size)}</span>
                    </div>
                    
                    {getCompressionRate() > 0 && (
                      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          تم توفير {getCompressionRate()}% من الحجم
                        </span>
                      </div>
                    )}
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCompressing || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الرفع...
              </>
            ) : (
              "رفع الصورة"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCompressionDialog;
