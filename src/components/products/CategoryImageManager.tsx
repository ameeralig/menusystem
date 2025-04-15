
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, X } from "lucide-react";
import { CategoryImage } from "@/types/categoryImage";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { deleteImage } from "@/utils/storageHelpers";

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

  const handleFileUpload = async (category: string, file: File) => {
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
      const fileName = `${user.id}-${category}-${Date.now()}.${fileExt}`;
      const filePath = `category-images/${fileName}`;

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
        await deleteImage("category-images", `category-images/${fileName}`);
      }

      const updatedImages = categoryImages.filter(img => img.category !== category);
      onUpdateImages(updatedImages);

      toast({
        title: "تم حذف الصورة",
        description: `تم حذف صورة تصنيف ${category}`,
      });
    } catch (error: any) {
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
            <Card key={category} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{category}</Label>
                  {categoryImage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(category)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {categoryImage ? (
                  <div className="relative aspect-video rounded-md overflow-hidden">
                    <img
                      src={categoryImage.image_url}
                      alt={category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(category, e.target.files[0])}
                    className="text-xs"
                  />
                  {uploading === category && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
