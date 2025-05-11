
import React, { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{category}</Label>
          {categoryImage?.image_url && !imageError && (
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

        {categoryImage?.image_url && !imageError ? (
          <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <img
              src={categoryImage.image_url}
              alt={category}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
              style={{ display: isLoading ? 'none' : 'block' }}
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
