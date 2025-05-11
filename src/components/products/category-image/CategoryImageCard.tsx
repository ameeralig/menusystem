
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, X, Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueId] = useState<string>(`${category}-${Math.random().toString(36).substring(2, 9)}`);

  // تحديث رابط الصورة مع معرّف فريد في كل مرة يتغير فيها categoryImage
  useEffect(() => {
    if (categoryImage?.image_url) {
      setIsLoading(true);
      setImageError(false); // إعادة ضبط حالة الخطأ

      // تأكد من تجديد رابط الصورة دائماً
      const timestamp = Date.now();
      const baseUrl = categoryImage.image_url.split('?')[0];
      const url = `${baseUrl}?t=${timestamp}&uid=${uniqueId}&nocache=true`;
      
      setImageUrl(url);
      console.log(`[CategoryImageCard] تم تحديث URL الصورة للتصنيف ${category}: ${url}`);
    } else {
      setImageUrl(null);
      setIsLoading(false);
    }
  }, [categoryImage, category, uniqueId]);

  // معالجة تحميل الصورة بنجاح
  const handleImageLoad = () => {
    console.log(`✅ [CategoryImageCard] تم تحميل صورة التصنيف ${category} بنجاح`);
    setImageError(false);
    setIsLoading(false);
  };

  // معالجة فشل تحميل الصورة
  const handleImageError = () => {
    console.error(`❌ [CategoryImageCard] خطأ في تحميل صورة التصنيف ${category}`);
    setImageError(true);
    setIsLoading(false);
  };

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
          <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={category}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
              style={{ 
                display: isLoading ? 'none' : 'block',
                maxWidth: '100%' 
              }}
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
            disabled={uploading}
          />
          {uploading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
