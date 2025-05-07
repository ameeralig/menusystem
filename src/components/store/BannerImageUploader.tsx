
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUploadButton from "./banner/ImageUploadButton";
import ImagePreview from "./banner/ImagePreview";
import { useBannerUpload } from "./banner/useBannerUpload";

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
    previewUrl,
    handleImageUpload,
    handleUrlChange,
    clearImage
  } = useBannerUpload({ setBannerUrl });
  
  // محلي لتتبع حالة النموذج
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bannerUrl) {
      handleUrlChange(bannerUrl);
    }
  }, [bannerUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setIsSubmitting(true);
      
      if (imageUrl && !isValidUrl(imageUrl)) {
        setError("الرجاء إدخال رابط صحيح للصورة");
        return;
      }
      
      setBannerUrl(imageUrl || null);
      await handleSubmit();
      
    } catch (error: any) {
      console.error("Error saving banner image:", error);
      setError(error.message || "حدث خطأ أثناء حفظ صورة الغلاف");
    } finally {
      setIsSubmitting(false);
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
          
          {previewUrl && (
            <ImagePreview 
              previewUrl={previewUrl}
              onClear={clearImage}
              onError={() => {
                setError("لم نتمكن من تحميل هذه الصورة، الرجاء التأكد من الرابط");
                clearImage();
              }}
            />
          )}
          
          <div className="space-y-4">
            <div>
              <ImageUploadButton onFileSelect={handleFileSelect} />
              
              <div className="my-2 flex items-center">
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="px-2 text-sm text-gray-500 dark:text-gray-400">أو</span>
                <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>
              
              <label className="text-sm font-medium block mb-1 text-right">
                أدخل رابط الصورة مباشرة
              </label>
              <Input
                type="text"
                placeholder="أدخل رابط الصورة"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#ff9178] hover:bg-[#ff7d61] text-white"
            disabled={isLoading || isSubmitting}
          >
            <Save className="ml-2 h-4 w-4" />
            {isLoading || isSubmitting ? "جاري الحفظ..." : "حفظ صورة الغلاف"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BannerImageUploader;
