
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

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
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Compress image before uploading
      setUploading(true);
      
      const options = {
        maxSizeMB: 1, // Max file size of 1 MB
        maxWidthOrHeight: 1024, // Resize to maximum width/height of 1024px
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-cover-image-${Date.now()}.${fileExt}`;
      const filePath = `store_covers/${fileName}`;

      // Upload the compressed file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('store_assets')
        .upload(filePath, compressedFile);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      // Get the public URL
      const { data } = supabase.storage
        .from('store_assets')
        .getPublicUrl(filePath);

      console.log("Public URL generated:", data.publicUrl);

      // Update state with the new URL
      setCoverImageUrl(data.publicUrl);

      // Save the changes to database immediately
      const formEvent = new Event('submit') as unknown as React.FormEvent;
      await handleSubmit(formEvent);

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة الغلاف وحفظها بنجاح",
        duration: 3000,
      });
      
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
    }
  };

  const removeCoverImage = async () => {
    try {
      // Extract filename from the URL if there is one
      if (coverImageUrl) {
        const urlParts = coverImageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `store_covers/${fileName}`;
        
        // Try to delete the file from storage
        const { error: deleteError } = await supabase.storage
          .from('store_assets')
          .remove([filePath]);
          
        if (deleteError) {
          console.error("Error removing image from storage:", deleteError);
          // Continue even if storage delete fails
        }
      }

      // Set coverImageUrl to null
      setCoverImageUrl(null);
      
      // Save the changes to database immediately
      const formEvent = new Event('submit') as unknown as React.FormEvent;
      await handleSubmit(formEvent);
      
      toast({
        title: "تم إزالة الصورة",
        description: "تم إزالة صورة الغلاف بنجاح",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error removing image:", error);
      toast({
        title: "خطأ في إزالة الصورة",
        description: error.message || "حدث خطأ أثناء إزالة الصورة",
        variant: "destructive",
        duration: 3000,
      });
    }
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
            <div className="relative">
              <img 
                src={coverImageUrl} 
                alt="صورة الغلاف" 
                className="w-full h-48 object-cover rounded-md border border-gray-200"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full opacity-90 hover:opacity-100"
                onClick={removeCoverImage}
                disabled={isLoading || uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
              <Image className="h-10 w-10 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                قم بإضافة صورة غلاف للمتجر
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button
              type="button"
              variant={coverImageUrl ? "outline" : "default"}
              className={coverImageUrl ? "" : "bg-purple-600 hover:bg-purple-700"}
              disabled={isLoading || uploading}
              onClick={() => document.getElementById('cover-image-upload')?.click()}
            >
              {uploading ? (
                <span>جاري الرفع...</span>
              ) : coverImageUrl ? (
                <span>تغيير الصورة</span>
              ) : (
                <>
                  <Upload className="h-4 w-4 ml-2" />
                  <span>رفع صورة</span>
                </>
              )}
            </Button>
            <input
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
