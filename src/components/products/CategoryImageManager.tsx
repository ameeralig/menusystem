
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

  // تنظيف اسم التصنيف ليكون صالحاً للاستخدام في مسارات الملفات
  const sanitizeFileName = (fileName: string): string => {
    // استبدال الأحرف الخاصة والمسافات بشرطة سفلية
    return fileName
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, '_');
  };

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
      // استخدام الدالة لتنظيف اسم التصنيف
      const sanitizedCategory = sanitizeFileName(category);
      // إضافة طابع زمني وقيمة عشوائية لمنع التخزين المؤقت
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `${user.id}_${sanitizedCategory}_${uniqueId}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("File path for upload:", filePath);

      // تعيين رؤوس التحكم في التخزين المؤقت
      const options = {
        cacheControl: "no-cache, no-store, must-revalidate",
        upsert: false
      };

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(filePath, file, options);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);

      // إضافة معلمة إصدار فريدة للرابط العام
      const versionedUrl = `${publicUrl}?v=${uniqueId}`;

      // إذا كانت هناك صورة سابقة، قم بحذفها
      const existingImage = categoryImages.find(img => img.category === category);
      if (existingImage && existingImage.image_url) {
        const oldFileName = existingImage.image_url.split('/').pop()?.split('?')[0];
        if (oldFileName) {
          try {
            // حذف الصورة القديمة من التخزين
            await deleteImage("category-images", oldFileName);
          } catch (error) {
            console.error("خطأ في حذف الصورة القديمة:", error);
            // نستمر بالرغم من خطأ الحذف
          }
        }
      }

      // إضافة أو تحديث صورة التصنيف في قاعدة البيانات
      const { error: dbError } = await supabase
        .from("category_images")
        .upsert({
          user_id: user.id,
          category,
          image_url: versionedUrl,
        });

      if (dbError) throw dbError;

      const updatedImages = [...categoryImages.filter(img => img.category !== category), 
        { category, image_url: versionedUrl }
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
      const oldFileName = imageToDelete.image_url.split('/').pop()?.split('?')[0];
      if (oldFileName) {
        await deleteImage("category-images", oldFileName);
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
          // إضافة معلمة عشوائية لمنع التخزين المؤقت عند العرض
          const displayImageUrl = categoryImage?.image_url 
            ? `${categoryImage.image_url}&nocache=${Math.random().toString(36).substring(2)}`
            : undefined;
          
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
                      src={displayImageUrl}
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
