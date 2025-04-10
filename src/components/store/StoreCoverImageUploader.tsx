
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { compressAndUploadImage, deleteImage } from "@/utils/imageUpload";
import CoverImageDisplay from "./CoverImageDisplay";
import CoverImagePlaceholder from "./CoverImagePlaceholder";
import ImageUploadButton from "./ImageUploadButton";

interface StoreCoverImageUploaderProps {
  coverImageUrl: string | null;
  setCoverImageUrl: (url: string | null) => void;
  userId: string;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const StoreCoverImageUploader = ({
  coverImageUrl,
  setCoverImageUrl,
  userId,
  handleSubmit,
  isLoading,
}: StoreCoverImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      setUploading(true);
      
      console.log("Starting image upload for user:", userId);
      const { url, error } = await compressAndUploadImage(file, userId);
      
      if (error) {
        throw error;
      }

      console.log("Image uploaded successfully, URL:", url);
      
      // Update state with the new URL
      setCoverImageUrl(url);

      // Important: Save the changes to database immediately
      console.log("Saving image URL to database...");
      try {
        const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
        await handleSubmit(formEvent);
        
        toast({
          title: "تم رفع الصورة",
          description: "تم رفع صورة الغلاف وحفظها بنجاح",
          duration: 3000,
        });
      } catch (submitError) {
        console.error("Error saving to database:", submitError);
        toast({
          title: "تم رفع الصورة ولكن حدث خطأ في الحفظ",
          description: "تم رفع الصورة ولكن لم يتم حفظها في قاعدة البيانات",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message || "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeCoverImage = async () => {
    try {
      setUploading(true);
      
      if (coverImageUrl) {
        console.log("Removing image:", coverImageUrl);
        const { error } = await deleteImage(coverImageUrl);
        
        if (error) {
          console.error("Error removing image:", error);
          // Continue even if storage delete fails
        }
      }

      // Set coverImageUrl to null
      setCoverImageUrl(null);
      
      // Important: Save the changes to database immediately
      console.log("Updating database to remove image reference...");
      try {
        const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
        await handleSubmit(formEvent);
        
        toast({
          title: "تم إزالة الصورة",
          description: "تم إزالة صورة الغلاف بنجاح",
          duration: 3000,
        });
      } catch (submitError) {
        console.error("Error saving to database after image removal:", submitError);
        toast({
          title: "خطأ في حفظ التغييرات",
          description: "تم إزالة الصورة ولكن لم يتم حفظ التغييرات في قاعدة البيانات",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("Error removing image:", error);
      toast({
        title: "خطأ في إزالة الصورة",
        description: error.message || "حدث خطأ أثناء إزالة الصورة",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-2 border-purple-100 dark:border-purple-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Image className="h-5 w-5 text-purple-500" />
          <span>صورة غلاف المتجر</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {coverImageUrl ? (
            <CoverImageDisplay 
              imageUrl={coverImageUrl} 
              onRemove={removeCoverImage} 
              isDisabled={isLoading || uploading}
            />
          ) : (
            <CoverImagePlaceholder />
          )}
          
          <div className="flex justify-center">
            <ImageUploadButton 
              hasImage={!!coverImageUrl}
              isDisabled={isLoading}
              isUploading={uploading}
              onClick={triggerFileInput}
            />
            <input
              ref={fileInputRef}
              id="cover-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isLoading || uploading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreCoverImageUploader;
