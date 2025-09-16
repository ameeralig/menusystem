import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { QRSettings } from "@/pages/QRGenerator";
import { toast } from "sonner";

interface QRLogoUploaderProps {
  settings: QRSettings;
  onSettingsChange: (key: keyof QRSettings, value: any) => void;
}

const QRLogoUploader = ({ settings, onSettingsChange }: QRLogoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("يرجى اختيار صورة بصيغة PNG أو JPG أو SVG");
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onSettingsChange('logoFile', file);
    toast.success("تم رفع اللوجو بنجاح");
  };

  const removeLogo = () => {
    onSettingsChange('logoFile', null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success("تم حذف اللوجو");
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          إضافة لوجو
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* منطقة رفع الملف */}
        <div 
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={triggerFileUpload}
        >
          {logoPreview ? (
            <div className="space-y-3">
              <img 
                src={logoPreview} 
                alt="Logo preview" 
                className="mx-auto max-w-[100px] max-h-[100px] object-contain rounded"
              />
              <p className="text-sm text-muted-foreground">انقر لتغيير اللوجو</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="mx-auto w-12 h-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">انقر لرفع اللوجو</p>
                <p className="text-xs text-muted-foreground">PNG, JPG أو SVG (أقل من 5MB)</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* إعدادات اللوجو */}
        {settings.logoFile && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="logo-size">حجم اللوجو (% من حجم QR)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  id="logo-size"
                  type="range"
                  min="10"
                  max="40"
                  value={settings.logoSize}
                  onChange={(e) => onSettingsChange('logoSize', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-center">{settings.logoSize}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                يُنصح بحجم بين 15-25% للحصول على أفضل نتيجة
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={removeLogo}
              className="w-full text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4 me-2" />
              حذف اللوجو
            </Button>
          </div>
        )}

        {/* نصائح */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">نصائح لأفضل نتيجة:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• استخدم لوجو بخلفية شفافة (PNG)</li>
            <li>• اجعل اللوجو بسيط وواضح</li>
            <li>• احرص على التباين مع لون QR</li>
            <li>• اختبر قابلية قراءة الرمز بعد إضافة اللوجو</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRLogoUploader;