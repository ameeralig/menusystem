
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Image, X } from "lucide-react";
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
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{category}</Label>
          {categoryImage && (
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
