
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { CategoryImage } from "@/types/categoryImage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | undefined>(categoryImage?.image_url);

  // عند تغيير صورة التصنيف أو إعادة التحميل، نستخدم القيمة الجديدة
  useEffect(() => {
    if (categoryImage?.image_url) {
      console.log(`تم تحديث صورة التصنيف ${category}:`, categoryImage.image_url);
      
      // إعادة تعيين حالات الخطأ والتحميل
      setIsLoading(true);
      setImageError(false);
      
      // تحديث رابط الصورة مع طابع زمني جديد لتجنب التخزين المؤقت
      const timestamp = Date.now();
      let newSrc = categoryImage.image_url;
      
      // إضافة طابع زمني جديد
      if (newSrc.includes('?')) {
        newSrc = `${newSrc.split('?')[0]}?t=${timestamp}`;
      } else {
        newSrc = `${newSrc}?t=${timestamp}`;
      }
      
      setImageSrc(newSrc);
    } else {
      console.log(`لا توجد صورة للتصنيف ${category}`);
      setImageSrc(undefined);
    }
  }, [category, categoryImage?.image_url]);

  const handleImageLoad = () => {
    console.log(`تم تحميل صورة التصنيف ${category} بنجاح`);
    setImageError(false);
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.error(`خطأ في تحميل صورة التصنيف ${category}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(category, e.target.files[0]);
      
      // إعادة تعيين حقل الملف بعد الرفع
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{category}</Label>
          {imageSrc && !imageError && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveImage(category)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>إزالة الصورة</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {imageSrc && !imageError ? (
          <div className="relative aspect-video rounded-md overflow-hidden bg-muted cursor-pointer" onClick={triggerFileInput}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <img
              src={imageSrc}
              alt={category}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </div>
        ) : (
          <div 
            className="aspect-video rounded-md bg-muted flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={triggerFileInput}
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground">انقر لاختيار صورة</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={triggerFileInput}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري الرفع...
                </>
              ) : (
                <>اختيار صورة</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
