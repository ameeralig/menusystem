
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image, Link, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBannerUpload } from "./useBannerUpload";
import ImageUploadPreview, { FitMode, PositionConfig } from "@/components/shared/ImageUploadPreview";
import { imageProcessingService } from "@/utils/imageProcessingService";

interface BannerImageUploaderProps {
  bannerUrl: string | null;
  setBannerUrl: (url: string | null) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const BannerImageUploader = ({
  bannerUrl,
  setBannerUrl,
  handleSubmit,
  isLoading
}: BannerImageUploaderProps) => {
  const {
    error,
    setError,
    imageUrl,
    handleImageUpload,
    handleUrlChange,
    clearImage
  } = useBannerUpload({ setBannerUrl });
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");

  useEffect(() => {
    if (bannerUrl) {
      handleUrlChange(bannerUrl);
    }
  }, [bannerUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      if (imageUrl && !isValidUrl(imageUrl)) {
        setError("الرجاء إدخال رابط صحيح للصورة");
        return;
      }
      
      setBannerUrl(imageUrl || null);
      await handleSubmit();
      
    } catch (error: any) {
      console.error("Error saving banner image:", error);
      setError(error.message || "حدث خطأ أثناء حفظ صورة الغلاف");
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // معالج حدث اختيار الصورة من المعاينة
  const handleImageSelected = async (selectedFile: File, config: PositionConfig, fitMode: FitMode) => {
    setError(null);
    try {
      // حفظ إعدادات الصورة
      const bannerImageKey = `banner_image`;
      imageProcessingService.saveImageSettings(bannerImageKey, config, fitMode);
      
      // رفع الصورة
      await handleImageUpload(selectedFile);
    } catch (error: any) {
      console.error("خطأ في معالجة الصورة:", error);
      setError(error.message || "حدث خطأ أثناء معالجة الصورة");
    }
  };

  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Image className="h-5 w-5 text-[#ff9178]" />
          <span>صورة الغلاف</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={uploadMethod === "file" ? "default" : "outline"}
              onClick={() => setUploadMethod("file")}
              className="flex-1 gap-2"
            >
              <Image className="w-4 h-4 ml-2" />
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
              aspectRatio={16/5} // نسبة مناسبة لصور الغلاف
              initialImageUrl={imageUrl}
              description="قم برفع صورة غلاف وضبط كيفية ظهورها"
              allowedFormats={["image/jpeg", "image/png", "image/webp"]}
            />
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="أدخل رابط صورة الغلاف"
                value={imageUrl || ""}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="text-right"
                dir="rtl"
              />
              
              {imageUrl && (
                <div className="aspect-[16/5] overflow-hidden rounded-md border">
                  <img 
                    src={imageUrl} 
                    alt="معاينة صورة الغلاف"
                    className="w-full h-full object-cover"
                    onError={() => setError("لم نتمكن من تحميل هذه الصورة، الرجاء التأكد من الرابط")}
                  />
                </div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-[#ff9178] hover:bg-[#ff7d61] text-white"
            disabled={isLoading}
          >
            <Save className="ml-2 h-4 w-4" />
            {isLoading ? "جاري الحفظ..." : "حفظ صورة الغلاف"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BannerImageUploader;
