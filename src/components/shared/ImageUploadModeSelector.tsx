import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Zap, FileImage, ArrowRight, Loader2 } from 'lucide-react';
import { formatBytes, getOriginalImageInfo, uploadToCloudinary, type CloudinaryUploadResult } from '@/utils/cloudinaryUpload';

interface ImageUploadModeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onUploadComplete: (result: { url: string; isOptimized: boolean; originalInfo: any; optimizedInfo?: any }) => void;
  onCancel: () => void;
  folder?: string;
}

export const ImageUploadModeSelector = ({
  open,
  onOpenChange,
  file,
  onUploadComplete,
  onCancel,
  folder = 'uploads'
}: ImageUploadModeSelectorProps) => {
  const [optimizeMode, setOptimizeMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<CloudinaryUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const originalInfo = file ? getOriginalImageInfo(file) : null;

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      if (optimizeMode) {
        // رفع محسّن عبر Cloudinary
        const result = await uploadToCloudinary(file, {
          convertToWebp: true,
          folder
        });
        
        setUploadResult(result);
        onUploadComplete({
          url: result.url,
          isOptimized: true,
          originalInfo: result.original,
          optimizedInfo: result.optimized
        });
      } else {
        // رفع عادي - سيتم معالجته خارجياً
        onUploadComplete({
          url: '', // سيتم استخدام الملف الأصلي
          isOptimized: false,
          originalInfo: originalInfo
        });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'حدث خطأ أثناء الرفع');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setUploadResult(null);
    setError(null);
    setOptimizeMode(true);
    onOpenChange(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-primary" />
            خيارات رفع الصورة
          </DialogTitle>
          <DialogDescription>
            اختر طريقة رفع الصورة
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {file && originalInfo && (
          <div className="space-y-4">
            {/* معلومات الصورة الأصلية */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الملف الأصلي</span>
                <Badge variant="outline">{originalInfo.format}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-sm font-bold">{originalInfo.sizeFormatted}</span>
              </div>
            </div>

            {/* خيار التحسين */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className={`h-5 w-5 ${optimizeMode ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                <div>
                  <Label htmlFor="optimize-mode" className="font-medium">
                    تحسين الصورة (WebP)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    تحويل إلى WebP لتقليل الحجم وتحسين الأداء
                  </p>
                </div>
              </div>
              <Switch
                id="optimize-mode"
                checked={optimizeMode}
                onCheckedChange={setOptimizeMode}
              />
            </div>

            {/* معاينة النتيجة المتوقعة */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الصيغة بعد الرفع:</span>
              <Badge variant={optimizeMode ? "default" : "secondary"}>
                {optimizeMode ? 'WebP (محسّن)' : originalInfo.format + ' (أصلي)'}
              </Badge>
            </div>

            {/* نتيجة الرفع */}
            {uploadResult && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">تم التحسين بنجاح!</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>{uploadResult.original.sizeFormatted}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-green-600">{uploadResult.optimized.sizeFormatted}</span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  تم توفير {uploadResult.savings.formatted} ({uploadResult.savings.percentage}%)
                </div>
              </div>
            )}

            {/* أزرار الإجراءات */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isUploading}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUpload}
                className="flex-1"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 ml-2" />
                    رفع الصورة
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
