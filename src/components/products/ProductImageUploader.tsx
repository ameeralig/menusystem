
import { useState } from "react";
import ImageUploadPreview, { FitMode, PositionConfig } from "../shared/ImageUploadPreview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link, UploadCloud } from "lucide-react";
import { imageProcessingService } from "@/utils/imageProcessingService";

interface ProductImageUploaderProps {
  onImageSelect: (file: File | null, url: string) => void;
  initialImageUrl?: string;
  onUrlChange?: (url: string) => void;
}

export const ProductImageUploader = ({
  onImageSelect,
  initialImageUrl = "",
  onUrlChange
}: ProductImageUploaderProps) => {
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [file, setFile] = useState<File | null>(null);

  // معالج حدث اختيار الصورة من المعاينة
  const handleImageSelected = (selectedFile: File, config: PositionConfig, fitMode: FitMode) => {
    setFile(selectedFile);
    
    // إنشاء URL مؤقت للمعاينة
    const objectUrl = URL.createObjectURL(selectedFile);
    
    // حفظ إعدادات الصورة
    const productImageKey = `product_image_${Date.now()}`;
    imageProcessingService.saveImageSettings(productImageKey, config, fitMode);
    
    // تعيين URL المعاينة
    setImageUrl(objectUrl);
    
    // إعادة URL المعاينة وملف الصورة للمكون الأب
    onImageSelect(selectedFile, objectUrl);
  };

  // معالج تغيير URL الصورة
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (onUrlChange) {
      onUrlChange(url);
    }
    // إعادة URL الصورة للمكون الأب مع قيمة null للملف
    onImageSelect(null, url);
  };

  return (
    <div className="space-y-4">
      <Label>صورة المنتج</Label>
      <div className="flex gap-4 mb-4">
        <Button
          type="button"
          variant={uploadMethod === "file" ? "default" : "outline"}
          onClick={() => setUploadMethod("file")}
          className="flex-1 gap-2"
        >
          <UploadCloud className="w-4 h-4 ml-2" />
          رفع صورة
        </Button>
        <Button
          type="button"
          variant={uploadMethod === "url" ? "default" : "outline"}
          onClick={() => setUploadMethod("url")}
          className="flex-1 gap-2"
        >
          <Link className="w-4 h-4 ml-2" />
          رابط صورة
        </Button>
      </div>

      {uploadMethod === "file" ? (
        <ImageUploadPreview
          onImageSelect={handleImageSelected}
          aspectRatio={4/3} // نسبة عرض إلى ارتفاع مناسبة للمنتجات
          initialImageUrl={initialImageUrl}
          description="قم برفع صورة للمنتج وضبط كيفية ظهورها"
          allowedFormats={["image/jpeg", "image/png", "image/webp"]}
        />
      ) : (
        <div className="space-y-2">
          <Input
            type="url"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="أدخل رابط صورة المنتج"
            className="w-full"
          />
          {imageUrl && (
            <div className="mt-4 rounded-md overflow-hidden border">
              <img 
                src={imageUrl} 
                alt="معاينة صورة المنتج"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  // تعيين صورة بديلة في حالة وجود خطأ في الرابط
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
