
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, X } from "lucide-react";
import { CategoryImage } from "@/types/categoryImage";

interface CategoryImageCardProps {
  category: string;
  categoryImage: CategoryImage | undefined;
  onFileUpload: (category: string, file: File) => Promise<void>;
  onRemoveImage: (category: string) => Promise<void>;
  uploading: boolean;
}

export const CategoryImageCard = ({
  category,
  categoryImage,
  onFileUpload,
  onRemoveImage,
  uploading
}: CategoryImageCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // تحديث عنوان URL للصورة مع طابع زمني لكسر التخزين المؤقت
  useEffect(() => {
    if (categoryImage?.image_url) {
      const timestamp = Date.now();
      const baseUrl = categoryImage.image_url.split('?')[0];
      const url = `${baseUrl}?t=${timestamp}`;
      setImageUrl(url);
      console.log(`تم تحديث URL الصورة للتصنيف ${category}: ${url}`);
      
      // إعادة تعيين حالة الخطأ عند تغير رابط الصورة
      setImageError(false);
    } else {
      setImageUrl(null);
    }
  }, [categoryImage, category]);

  // معالجة تحميل الصورة بنجاح
  const handleImageLoad = () => {
    console.log(`تم تحميل صورة التصنيف ${category} بنجاح`);
    setImageError(false);
  };

  // معالجة فشل تحميل الصورة
  const handleImageError = () => {
    console.error(`خطأ في تحميل صورة التصنيف ${category}`);
    setImageError(true);
  };

  // تحميل مسبق للصورة
  useEffect(() => {
    if (imageUrl) {
      const imgElement = document.createElement('img');
      imgElement.src = imageUrl;
      imgElement.onload = handleImageLoad;
      imgElement.onerror = handleImageError;
    }
  }, [imageUrl]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{category}</Label>
          {imageUrl && !imageError && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveImage(category)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {imageUrl && !imageError ? (
          <div className="relative aspect-video rounded-md overflow-hidden">
            <img
              src={imageUrl}
              alt={category}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onFileUpload(category, e.target.files[0])}
            className="text-xs"
          />
          {uploading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
