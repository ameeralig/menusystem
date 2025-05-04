
import { useState, useEffect } from "react";
import { ImagePlus, Upload, Link, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SmartImagePreview from "@/components/products/SmartImagePreview";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageSelect: (imageData: {
    url: string;
    fitStyle: "cover" | "contain" | "fill" | "scale-down";
    zoom: number;
    position: { x: number; y: number };
  }) => void;
  label?: string;
  aspectRatio?: "1/1" | "4/3" | "16/9";
  maxSizeInMB?: number;
  initialUrl?: string | null;
}

const ImageUploader = ({
  onImageSelect,
  label = "صورة",
  aspectRatio = "1/1",
  maxSizeInMB = 5,
  initialUrl = null,
}: ImageUploaderProps) => {
  const { toast } = useToast();
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // إعدادات ضبط الصورة
  const [fitStyle, setFitStyle] = useState<"cover" | "contain" | "fill" | "scale-down">("cover");
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (initialUrl) {
      setImageUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // فحص حجم الملف
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "حجم الملف كبير جداً",
        description: `الحد الأقصى لحجم الملف هو ${maxSizeInMB} ميجابايت`
      });
      return;
    }

    // فحص نوع الملف
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "نوع ملف غير صالح",
        description: "الرجاء اختيار صورة فقط"
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsPreviewMode(true);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url) {
      setPreviewUrl(url);
      setIsPreviewMode(true);
    }
  };

  const handleImageComplete = (previewData: {
    url: string;
    fitStyle: "cover" | "contain" | "fill" | "scale-down";
    zoom: number;
    position: { x: number; y: number };
  }) => {
    setFitStyle(previewData.fitStyle);
    setZoom(previewData.zoom);
    setPosition(previewData.position);
    onImageSelect(previewData);
    setIsPreviewMode(false);
  };

  const handleCancel = () => {
    setIsPreviewMode(false);
    if (selectedFile) {
      setSelectedFile(null);
      if (previewUrl && !imageUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
    if (!initialUrl) {
      setImageUrl(null);
    } else {
      setImageUrl(initialUrl);
    }
  };

  return (
    <div className="space-y-4">
      {!isPreviewMode ? (
        <>
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={uploadMethod === "file" ? "default" : "outline"}
              onClick={() => setUploadMethod("file")}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              رفع ملف
            </Button>
            <Button
              type="button"
              variant={uploadMethod === "url" ? "default" : "outline"}
              onClick={() => setUploadMethod("url")}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Link className="w-4 h-4" />
              رابط صورة
            </Button>
          </div>

          {uploadMethod === "url" ? (
            <div className="space-y-2">
              <input
                type="url"
                value={imageUrl || ""}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="أدخل رابط الصورة"
                className="w-full px-3 py-2 border rounded-md"
              />
              {imageUrl && (
                <Button 
                  type="button" 
                  onClick={() => setIsPreviewMode(true)}
                  className="w-full"
                >
                  معاينة الصورة وضبطها
                </Button>
              )}
            </div>
          ) : (
            <div>
              <div 
                onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors",
                  imageUrl ? "border-primary/40" : "border-muted-foreground/25"
                )}
              >
                {imageUrl ? (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt={label} 
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <span className="text-white font-medium">تغيير الصورة</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6">
                    <ImagePlus className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">اضغط هنا لاختيار {label}</p>
                  </div>
                )}
              </div>
              <input
                id={`file-upload-${label}`}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">معاينة وضبط الصورة</h3>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <SmartImagePreview 
            imageUrl={previewUrl}
            aspectRatio={aspectRatio}
            onComplete={handleImageComplete}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
