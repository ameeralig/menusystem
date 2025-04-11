
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image, Save, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize the state with the bannerUrl when component mounts or bannerUrl changes
  useEffect(() => {
    if (bannerUrl) {
      setImageUrl(bannerUrl);
      setPreviewUrl(bannerUrl);
    }
  }, [bannerUrl]);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    if (url) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Validate URL format if entered
      if (imageUrl && !isValidUrl(imageUrl)) {
        setError("الرجاء إدخال رابط صحيح للصورة");
        return;
      }
      
      // Set the URL to parent component
      setBannerUrl(imageUrl || null);
      
      // Submit the form immediately
      await handleSubmit();
      
      toast({
        title: "تم حفظ صورة الغلاف",
        description: "تم تحديث صورة الغلاف بنجاح",
        duration: 3000,
      });
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

  const clearImage = () => {
    setImageUrl("");
    setPreviewUrl(null);
    setBannerUrl(null);
    setError(null);
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
            <div className="relative overflow-hidden rounded-md border border-gray-200">
              <AspectRatio ratio={16 / 5}>
                <img 
                  src={previewUrl} 
                  alt="معاينة صورة الغلاف" 
                  className="w-full h-full object-cover"
                  onError={() => {
                    setError("لم نتمكن من تحميل هذه الصورة، الرجاء التأكد من الرابط");
                    setPreviewUrl(null);
                  }}
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AspectRatio>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1 text-right">رابط الصورة</label>
              <Input
                type="text"
                placeholder="أدخل رابط الصورة"
                value={imageUrl}
                onChange={handleImageUrlChange}
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          
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
