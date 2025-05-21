
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { useBannerUpload } from "@/components/store/banner/useBannerUpload";

interface ProfileImageUploaderProps {
  profileImageUrl: string | null;
  setProfileImageUrl: (url: string | null) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const ProfileImageUploader = ({
  profileImageUrl,
  setProfileImageUrl,
  handleSubmit,
  isLoading
}: ProfileImageUploaderProps) => {
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  
  const {
    error,
    previewUrl,
    handleImageUpload,
    handleUrlChange,
    clearImage
  } = useBannerUpload({
    setBannerUrl: setProfileImageUrl,
    initialUrl: profileImageUrl
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleClear = () => {
    clearImage();
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">صورة الملف الشخصي</h3>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            type="button"
            variant={uploadMethod === "file" ? "default" : "outline"}
            size="sm"
            onClick={() => setUploadMethod("file")}
          >
            رفع ملف
          </Button>
          <Button
            type="button" 
            variant={uploadMethod === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => setUploadMethod("url")}
          >
            رابط URL
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {uploadMethod === "url" ? (
        <div className="space-y-2">
          <Label htmlFor="banner-url">رابط صورة الملف الشخصي</Label>
          <Input
            id="banner-url"
            placeholder="أدخل رابط الصورة"
            onChange={(e) => handleUrlChange(e.target.value)}
            value={profileImageUrl || ""}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="profile-image-upload">اختر صورة</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="cursor-pointer"
            >
              <label htmlFor="profile-image-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 me-2" />
                اختر صورة
              </label>
            </Button>
            <Input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              يفضل صورة مربعة بأبعاد 200×200 بكسل
            </p>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={previewUrl} alt="صورة الملف الشخصي" />
              <AvatarFallback>
                {profileImageUrl ? "..." : "بلا صورة"}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            size="sm"
          >
            حفظ الصورة
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUploader;
