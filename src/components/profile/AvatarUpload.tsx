import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, getUrlWithTimestamp } from "@/utils/storageHelpers";
import ImageCompressionDialog from "@/components/shared/ImageCompressionDialog";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userId: string;
  userName: string;
  onAvatarUpdate: (newUrl: string) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userId, userName, onAvatarUpdate }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFile(file);
    setShowCompressionDialog(true);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // رفع الصورة إلى Supabase Storage
      const avatarUrl = await uploadImage("avatars", file, userId, "");

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

      toast({
        title: "تم بنجاح",
        description: "تم تحديث صورة الملف الشخصي",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message,
        variant: "destructive",
      });
      const fallbackUrl = currentAvatarUrl ? getUrlWithTimestamp(currentAvatarUrl) : null;
      setPreviewUrl(fallbackUrl);
      throw error;
    } finally {
      setIsUploading(false);
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

      <p className="text-sm text-muted-foreground text-center">
        انقر على أيقونة الكاميرا لتحديث صورة الملف الشخصي
      </p>
      
      <ImageCompressionDialog
        open={showCompressionDialog}
        onOpenChange={setShowCompressionDialog}
        file={selectedFile}
        onConfirm={handleFileUpload}
        title="ضغط صورة الملف الشخصي"
        description="يمكنك اختيار ضغط الصورة لتقليل حجمها قبل الرفع"
      />
    </div>
  );
};

export default AvatarUpload;
