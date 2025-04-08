
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StoreCoverImageUploaderProps {
  coverImage: string;
  setCoverImage: (url: string) => void;
  isEditing: boolean;
  isLoading: boolean;
}

const StoreCoverImageUploader = ({
  coverImage,
  setCoverImage,
  isEditing,
  isLoading
}: StoreCoverImageUploaderProps) => {
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `store-covers/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase
        .storage
        .from('public')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl.publicUrl);

      toast({
        title: "تم رفع الصورة بنجاح",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "حدث خطأ أثناء رفع الصورة",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-3">
      {isEditing && (
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-purple-500" />
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-right"
            disabled={isLoading}
          />
        </div>
      )}
      
      {coverImage && (
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-2 text-right">صورة الغلاف:</p>
          <img 
            src={coverImage} 
            alt="صورة الغلاف" 
            className="w-full h-32 object-cover rounded-md" 
          />
        </div>
      )}
    </div>
  );
};

export default StoreCoverImageUploader;
