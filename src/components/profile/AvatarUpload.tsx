import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/storageHelpers";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userId: string;
  userName: string;
  onAvatarUpdate: (newUrl: string) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userId, userName, onAvatarUpdate }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطأ",
        description: "يجب اختيار صورة فقط",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // إنشاء معاينة مؤقتة
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // رفع الصورة إلى Supabase Storage
      const avatarUrl = await uploadImage("avatars", file, userId, "");

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // تنظيف المعاينة المؤقتة
      URL.revokeObjectURL(objectUrl);
      
      // تحديث الحالة
      setPreviewUrl(avatarUrl);
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
      setPreviewUrl(currentAvatarUrl);
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
          accept="image/*"
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
