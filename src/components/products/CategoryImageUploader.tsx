
import { useState } from "react";
import ImageUploadPreview, { FitMode, PositionConfig } from "../shared/ImageUploadPreview";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { imageProcessingService } from "@/utils/imageProcessingService";

interface CategoryImageUploaderProps {
  category: string;
  initialImageUrl?: string;
  onImageSelect: (file: File, category: string) => Promise<void>;
  isUploading?: boolean;
}

export const CategoryImageUploader = ({
  category,
  initialImageUrl = "",
  onImageSelect,
  isUploading = false
}: CategoryImageUploaderProps) => {
  const [error, setError] = useState<string | null>(null);

  // معالج حدث اختيار الصورة من المعاينة
  const handleImageSelected = async (selectedFile: File, config: PositionConfig, fitMode: FitMode) => {
    setError(null);
    try {
      // حفظ إعدادات الصورة
      const categoryImageKey = `category_image_${category}`;
      imageProcessingService.saveImageSettings(categoryImageKey, config, fitMode);
      
      // تمرير الملف والتصنيف إلى المكون الأب
      await onImageSelect(selectedFile, category);
    } catch (error: any) {
      console.error("خطأ في معالجة الصورة:", error);
      setError(error.message || "حدث خطأ أثناء معالجة الصورة");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <Label className="text-base font-medium">{category}</Label>

        <ImageUploadPreview
          onImageSelect={handleImageSelected}
          aspectRatio={1} // نسبة 1:1 مناسبة للتصنيفات عادةً
          initialImageUrl={initialImageUrl}
          description="قم برفع صورة للتصنيف وضبط كيفية ظهورها"
          allowedFormats={["image/jpeg", "image/png", "image/webp", "image/gif"]}
          containerClassName={isUploading ? "opacity-50 pointer-events-none" : ""}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryImageUploader;
