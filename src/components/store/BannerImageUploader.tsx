
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image, UploadCloud, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage, createUniqueFilePath } from "@/utils/storageHelpers";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(bannerUrl);
  const { toast } = useToast();

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setPreviewUrl(e.target.value);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return null;
    
    setUploadLoading(true);
    try {
      // Get the currently authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");
      
      // Create a unique file path
      const filePath = createUniqueFilePath(user.id, 'banners', imageFile);
      
      // Upload the file using our helper function
      const uploadedUrl = await uploadImage(imageFile, 'store-assets', filePath);
      
      if (!uploadedUrl) {
        throw new Error("فشل في تحميل الصورة");
      }
      
      // Update state with the new URL
      setBannerUrl(uploadedUrl);
      setImageUrl(uploadedUrl);
      
      toast({
        title: "تم رفع الصورة بنجاح",
        description: "يمكنك الآن حفظ التغييرات",
        duration: 3000,
      });
      
      return uploadedUrl;
    } catch (error: any) {
      console.error("خطأ في رفع الصورة:", error);
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveWithUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's a file to upload, upload it first
    if (imageFile) {
      const uploadedUrl = await handleUploadImage();
      if (uploadedUrl) {
        // Set the URL and then save
        await handleSubmit(e);
      }
    } else {
      // If only URL is provided, use that
      setBannerUrl(imageUrl || null);
      await handleSubmit(e);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImageUrl("");
    setPreviewUrl(null);
    setBannerUrl(null);
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
        <form onSubmit={handleSaveWithUpload} className="space-y-4">
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
            
            <div className="text-center">
              <span className="text-gray-500">أو</span>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1 text-right">تحميل صورة</label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <Input
                  type="file"
                  id="banner-upload"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">اضغط لتحميل صورة من جهازك</span>
                </label>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading || uploadLoading}
          >
            <Save className="ml-2 h-4 w-4" />
            {isLoading || uploadLoading ? "جاري الحفظ..." : "حفظ صورة الغلاف"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BannerImageUploader;
