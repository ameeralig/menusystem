import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, getUrlWithTimestamp, deleteOldImageIfExists } from "@/utils/storageHelpers";
import { uploadToCloudinary, getOriginalImageInfo, formatBytes } from "@/utils/cloudinaryUpload";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userId: string;
  userName: string;
  onAvatarUpdate: (newUrl: string) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userId, userName, onAvatarUpdate }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useCloudinary, setUseCloudinary] = useState(false);
  const [savingsInfo, setSavingsInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // تحديث معاينة الصورة عند تغيير currentAvatarUrl
  useEffect(() => {
    if (currentAvatarUrl) {
      const urlWithTimestamp = getUrlWithTimestamp(currentAvatarUrl);
      setPreviewUrl(urlWithTimestamp);
    } else {
      setPreviewUrl(null);
    }
  }, [currentAvatarUrl]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // قائمة بصيغ الصور المقبولة
    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/heic',
      'image/heif'
    ];

    // قائمة بالامتدادات المقبولة كنسخة احتياطية
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.heic', '.heif'];
    
    // التحقق من نوع الملف أو الامتداد
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidType = file.type.startsWith("image/") || allowedImageTypes.includes(file.type.toLowerCase());
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صالح (JPG, PNG, GIF, WEBP, SVG, BMP, TIFF, HEIC)",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setSavingsInfo(null);

    try {
      // حذف الصورة القديمة إذا وجدت
      if (currentAvatarUrl) {
        await deleteOldImageIfExists(currentAvatarUrl, 'avatars');
      }

      let avatarUrl: string;
      const originalInfo = getOriginalImageInfo(file);

      if (useCloudinary) {
        // رفع محسّن عبر Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file, {
          convertToWebp: true,
          folder: `${userId}/avatars`
        });

        avatarUrl = cloudinaryResult.url;
        setSavingsInfo(`تم توفير ${cloudinaryResult.savings.formatted} (${cloudinaryResult.savings.percentage}%)`);

        toast({
          title: "تم بنجاح",
          description: `تم تحديث الصورة وتوفير ${cloudinaryResult.savings.formatted}`,
        });
      } else {
        // رفع عادي إلى Supabase Storage
        avatarUrl = await uploadImage("avatars", file, userId, "");

        toast({
          title: "تم بنجاح",
          description: "تم تحديث صورة الملف الشخصي",
        });
      }

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      if (updateError) throw updateError;
      
      // تحديث الحالة بـ URL مع timestamp لتجنب الـ cache
      const urlWithTimestamp = getUrlWithTimestamp(avatarUrl);
      setPreviewUrl(urlWithTimestamp);
      onAvatarUpdate(avatarUrl);

    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message,
        variant: "destructive",
      });
      const fallbackUrl = currentAvatarUrl ? getUrlWithTimestamp(currentAvatarUrl) : null;
      setPreviewUrl(fallbackUrl);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-border">
          <AvatarImage src={previewUrl || undefined} alt={userName} />
          <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff,.heic,.heif"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* خيار تحسين Cloudinary */}
      <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
        <Switch
          id="cloudinary-avatar"
          checked={useCloudinary}
          onCheckedChange={setUseCloudinary}
        />
        <Label htmlFor="cloudinary-avatar" className="text-sm flex items-center gap-1 cursor-pointer">
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          تحسين WebP
        </Label>
      </div>

      {savingsInfo && (
        <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {savingsInfo}
        </p>
      )}

      <p className="text-sm text-muted-foreground text-center">
        انقر على أيقونة الكاميرا لتحديث صورة الملف الشخصي
      </p>
    </div>
  );
};

export default AvatarUpload;
