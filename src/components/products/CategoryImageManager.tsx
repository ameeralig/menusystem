
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { CategoryImage } from "@/types/categoryImage";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { deleteImage } from "@/utils/storageHelpers";
import CategoryImageUploader from "./CategoryImageUploader";

interface CategoryImageManagerProps {
  categories: string[];
  categoryImages: CategoryImage[];
  onUpdateImages: (images: CategoryImage[]) => void;
}

export const CategoryImageManager = ({
  categories,
  categoryImages,
  onUpdateImages,
}: CategoryImageManagerProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);

  const handleImageUpload = async (file: File, category: string) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "خطأ في رفع الصورة",
        description: "الرجاء اختيار ملف صورة صالح",
      });
      return;
    }

    try {
      setUploading(category);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const fileExt = file.name.split(".").pop();
      const sanitizedCategory = category.replace(/\s+/g, '_').replace(/[^\w.-]/g, '_');
      const fileName = `${user.id}_${sanitizedCategory}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("File path for upload:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);

      // إضافة أو تحديث صورة التصنيف في قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .upsert({
          user_id: user.id,
          category,
          image_url: publicUrl,
        });

      if (dbError) throw dbError;

      const updatedImages = [...categoryImages.filter(img => img.category !== category), 
        { category, image_url: publicUrl }
      ];
      onUpdateImages(updatedImages);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: `تم تحديث صورة تصنيف ${category}`,
      });
    } catch (error: any) {
      console.error("خطأ في رفع الصورة:", error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع الصورة",
        description: error.message,
      });
    } finally {
      setUploading(null);
    }
  };

  const removeImage = async (category: string) => {
    const imageToDelete = categoryImages.find(img => img.category === category);
    if (!imageToDelete) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      // حذف السجل من قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .delete()
        .match({ user_id: user.id, category });

      if (dbError) throw dbError;

      // حذف الملف من التخزين إذا كان موجوداً
      const fileName = imageToDelete.image_url.split("/").pop();
      if (fileName) {
        await deleteImage("category-images", fileName);
      }

      const updatedImages = categoryImages.filter(img => img.category !== category);
      onUpdateImages(updatedImages);

      toast({
        title: "تم حذف الصورة",
        description: `تم حذف صورة تصنيف ${category}`,
      });
    } catch (error: any) {
      console.error("خطأ في حذف الصورة:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف الصورة",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">إدارة صور التصنيفات</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const categoryImage = categoryImages.find(img => img.category === category);
          
          return (
            <div key={category} className="relative">
              {categoryImage && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeImage(category)}
                  className="h-8 w-8 absolute top-2 right-2 z-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              <CategoryImageUploader
                category={category}
                initialImageUrl={categoryImage?.image_url}
                onImageSelect={handleImageUpload}
                isUploading={uploading === category}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryImageManager;
