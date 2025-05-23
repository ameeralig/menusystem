import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Upload, Link as LinkIcon, Image, X } from "lucide-react";
import { createUniqueFilePath, optimizeImage } from "@/utils/storageHelpers";

interface ImageUploaderProps {
  initialImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  bucketName: string;
  folder?: string;
  className?: string;
  aspectRatio?: "square" | "landscape" | "portrait";
  maxSizeInMB?: number;
  buttonText?: string;
  placeholder?: string;
}

const ImageUploader = ({
  initialImageUrl,
  onImageUploaded,
  bucketName,
  folder = "",
  className = "",
  aspectRatio = "landscape",
  maxSizeInMB = 5,
  buttonText = "تحميل صورة",
  placeholder = "أدخل رابط الصورة"
}: ImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [urlInput, setUrlInput] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // تحويل حجم الملف من بايت إلى ميجابايت
  const bytesToMB = (bytes: number) => {
    return bytes / (1024 * 1024);
  };

  // معالجة تحميل الملف
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // التحقق من حجم الملف
      if (bytesToMB(file.size) > maxSizeInMB) {
        toast({
          title: "الملف كبير جداً",
          description: `الحد الأقصى للحجم هو ${maxSizeInMB} ميجابايت`,
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      setUploadProgress(10);
      
      // الحصول على معرف المستخدم
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");
      
      setUploadProgress(30);
      
      // تحسين الصورة قبل الرفع (ضغط وتحويل الصيغة)
      const optimizedFile = await optimizeImage(file);
      
      setUploadProgress(50);
      
      // إنشاء مسار فريد للملف
      const filePath = createUniqueFilePath(user.id, folder, optimizedFile);
      
      // رفع الصورة إلى Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, optimizedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: optimizedFile.type
        });
      
      setUploadProgress(80);
      
      if (error) throw error;
      
      // الحصول على الرابط العام
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      // إضافة معلمات لكسر التخزين المؤقت والتحسين
      const timestamp = Date.now();
      const optimizedUrl = `${publicUrl.split('?')[0]}?format=webp&quality=80&width=600&t=${timestamp}`;
      
      setImageUrl(optimizedUrl);
      onImageUploaded(optimizedUrl);
      
      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم حفظ الصورة وتحسينها"
      });
    } catch (error: any) {
      console.error("خطأ في رفع الصورة:", error);
      toast({
        title: "فشل في رفع الصورة",
        description: error.message || "حدث خطأ أثناء رفع الصورة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }, [bucketName, folder, maxSizeInMB, onImageUploaded]);
  
  // معالجة إضافة رابط الصورة
  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) {
      toast({
        title: "الرابط فارغ",
        description: "يرجى إدخال رابط صورة صالح",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // التحقق من صحة الرابط
      const url = new URL(urlInput);
      
      // للتأكد من أن الرابط هو رابط صورة يمكن تحميله
      const testImage = document.createElement('img');
      
      testImage.onerror = () => {
        toast({
          title: "رابط غير صالح",
          description: "الرابط المدخل ليس رابط صورة صالح",
          variant: "destructive"
        });
      };
      
      setIsLoading(true);
      
      // إضافة معلمات لكسر التخزين المؤقت
      const timestamp = Date.now();
      const finalUrl = `${urlInput}${urlInput.includes('?') ? '&' : '?'}t=${timestamp}`;
      
      setImageUrl(finalUrl);
      onImageUploaded(finalUrl);
      setUrlInput("");
      
      toast({
        title: "تم إضافة الصورة بنجاح",
      });
    } catch (error) {
      toast({
        title: "رابط غير صالح",
        description: "يرجى إدخال رابط صورة صحيح",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [urlInput, onImageUploaded]);
  
  // إزالة الصورة
  const handleRemoveImage = () => {
    setImageUrl(null);
    onImageUploaded("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* أزرار اختيار طريقة التحميل */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={uploadMethod === "file" ? "default" : "outline"}
          onClick={() => setUploadMethod("file")}
        >
          <Upload className="h-4 w-4 ml-2" />
          رفع صورة
        </Button>
        <Button
          type="button"
          size="sm"
          variant={uploadMethod === "url" ? "default" : "outline"}
          onClick={() => setUploadMethod("url")}
        >
          <LinkIcon className="h-4 w-4 ml-2" />
          رابط صورة
        </Button>
      </div>
      
      {/* عناصر التحكم حسب طريقة التحميل المختارة */}
      {uploadMethod === "file" ? (
        <div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            {isLoading ? (
              <Spinner className="ml-2" />
            ) : (
              <Image className="ml-2 h-4 w-4" />
            )}
            {buttonText}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder={placeholder}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            onClick={handleUrlSubmit}
            disabled={isLoading || !urlInput.trim()}
          >
            {isLoading ? <Spinner /> : "إضافة"}
          </Button>
        </div>
      )}
      
      {/* عرض شريط التقدم إذا كان هناك تحميل جاري */}
      {isLoading && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-xs text-muted-foreground mt-1">جاري التحميل... {uploadProgress}%</p>
        </div>
      )}
      
      {/* عرض الصورة المحملة (إذا وجدت) */}
      {imageUrl && (
        <div className="relative border rounded-md overflow-hidden">
          <div className={`relative ${
            aspectRatio === "square" ? "aspect-square" :
            aspectRatio === "portrait" ? "aspect-[3/4]" : 
            "aspect-video"
          }`}>
            <img
              src={imageUrl}
              alt="الصورة المحملة"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/600x400?text=صورة+غير+متاحة";
              }}
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 left-2 w-8 h-8 bg-red-500/80 hover:bg-red-600"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
