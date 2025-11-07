
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { formatImageUrl } from "@/utils/storageHelpers";
import ImageCropDialog from "@/components/shared/ImageCropDialog";

interface ImageUploadSectionProps {
  currentImageUrl: string | null;
  uploadMethod: "url" | "file";
  setUploadMethod: (method: "url" | "file") => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}

const ImageUploadSection = ({
  currentImageUrl,
  uploadMethod,
  setUploadMethod,
  imageUrl,
  setImageUrl,
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
}: ImageUploadSectionProps) => {
  const [imageError, setImageError] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setTempImageSrc(objectUrl);
      setCropDialogOpen(true);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], "product-image.jpg", { type: "image/jpeg" });
    setSelectedFile(croppedFile);
    const objectUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(objectUrl);
    setImageError(false);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
    setSelectedFile(null);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const clearImage = () => {
    setImageUrl("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageError(false);
  };

  const displayUrl = previewUrl || (uploadMethod === "url" ? imageUrl : null) || currentImageUrl;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-right block mb-2">صورة المنتج</Label>
        <div className="flex gap-3">
          <Button
            type="button"
            size="sm"
            variant={uploadMethod === "file" ? "default" : "outline"}
            onClick={() => setUploadMethod("file")}
          >
            <Upload className="h-4 w-4 ml-2" />
            رفع صورة
          </Button>
          <Button
            type="button"
            size="sm"
            variant={uploadMethod === "url" ? "default" : "outline"}
            onClick={() => setUploadMethod("url")}
          >
            <LinkIcon className="h-4 w-4 ml-2" />
            رابط صورة
          </Button>
        </div>
      </div>

      {uploadMethod === "url" ? (
        <div className="space-y-2">
          <Label htmlFor="image_url" className="text-right block">
            رابط الصورة
          </Label>
          <Input
            id="image_url"
            type="url"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="أدخل رابط صورة المنتج"
            className="text-right"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            id="product-file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('product-file-upload')?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 ml-2" />
            اختيار صورة من الجهاز
          </Button>
        </div>
      )}

      {displayUrl && (
        <div className="relative border rounded-lg overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={clearImage}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {!imageError ? (
            <img
              src={formatImageUrl(displayUrl)}
              alt="معاينة المنتج"
              className="w-full h-48 object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                فشل في تحميل الصورة
              </p>
            </div>
          )}
        </div>
      )}

      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
        aspect={4 / 3}
        title="قص صورة المنتج"
      />
    </div>
  );
};

export default ImageUploadSection;
