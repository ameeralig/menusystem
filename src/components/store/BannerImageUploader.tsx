
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera, Image, Save, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { createUniqueFilePath } from "@/utils/storageHelpers";
import { supabase } from "@/integrations/supabase/client";

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

  // تعريف مرجع لعنصر الإدخال المخفي لتحميل الصور
  const fileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.setAttribute("accept", "image/*");
      node.setAttribute("capture", "environment");
    }
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        setError("الرجاء اختيار ملف صورة صالح");
        return;
      }

      // التحقق من حجم الملف (10 ميجابايت كحد أقصى)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        setError("حجم الصورة كبير جداً. الحد الأقصى هو 10 ميجابايت");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // إنشاء مسار فريد للملف
      const filePath = createUniqueFilePath(user.id, 'banners', file);
      
      // تحميل الملف إلى Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // الحصول على رابط الصورة العام
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      setPreviewUrl(publicUrl);
      setBannerUrl(publicUrl);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "يمكنك الآن حفظ التغييرات",
        duration: 3000,
      });

    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message || "حدث خطأ أثناء رفع الصورة");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

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
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  id="cameraInput"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('cameraInput')?.click()}
                >
                  <Camera className="ml-2 h-4 w-4" />
                  التقاط صورة أو اختيار من المعرض
                </Button>
              </div>
              
              <label className="text-sm font-medium block mb-1 text-right">أو قم بإدخال رابط الصورة</label>
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
