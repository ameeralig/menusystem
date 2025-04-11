
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image, Save, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BannerImageUploaderProps {
  bannerUrl: string | null;
  setBannerUrl: (url: string | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const BannerImageUploader = ({
  bannerUrl,
  setBannerUrl,
  handleSubmit,
  isLoading
}: BannerImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState<string>(bannerUrl || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(bannerUrl);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setPreviewUrl(e.target.value);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Set the URL directly
    setBannerUrl(imageUrl || null);
    await handleSubmit(e);
  };

  const clearImage = () => {
    setImageUrl("");
    setPreviewUrl(null);
    setBannerUrl(null);
    setError(null);
  };

  return (
    <Card className="border-2 border-purple-100 dark:border-purple-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>صورة الغلاف</span>
          <Image className="h-5 w-5 text-purple-500" />
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
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="معاينة صورة الغلاف" 
                className="w-full h-40 object-cover rounded-md border border-gray-200"
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
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1 text-right">رابط الصورة</label>
              <Input
                type="url"
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
            className="w-full bg-purple-600 hover:bg-purple-700"
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
