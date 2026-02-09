import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getUrlWithTimestamp } from "@/utils/storageHelpers";
import { useSmartUpload } from "@/hooks/useSmartUpload";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userId: string;
  userName: string;
  onAvatarUpdate: (newUrl: string) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userId, userName, onAvatarUpdate }: AvatarUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { upload, isUploading } = useSmartUpload();

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

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.heic', '.heif'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidType = file.type.startsWith("image/");
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      toast({ title: "خطأ", description: "يرجى اختيار ملف صورة صالح", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة يجب أن يكون أقل من 10 ميجابايت", variant: "destructive" });
      return;
    }

    try {
      const result = await upload(file, {
        bucket: 'avatars',
        folder: '',
        userId,
        oldImageUrl: currentAvatarUrl,
        showToast: false,
      });

      if (!result || !result.url) throw new Error("فشل في رفع الصورة");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: result.url })
        .eq("id", userId);

      if (updateError) throw updateError;
      
      const urlWithTimestamp = getUrlWithTimestamp(result.url);
      setPreviewUrl(urlWithTimestamp);
      onAvatarUpdate(result.url);

      toast({ title: "تم بنجاح", description: "تم تحديث صورة الملف الشخصي" });

    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({ title: "خطأ في رفع الصورة", description: error.message, variant: "destructive" });
      const fallbackUrl = currentAvatarUrl ? getUrlWithTimestamp(currentAvatarUrl) : null;
      setPreviewUrl(fallbackUrl);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
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
    </div>
  );
};

export default AvatarUpload;
