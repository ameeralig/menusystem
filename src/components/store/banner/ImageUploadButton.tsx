
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useCallback } from "react";

interface ImageUploadButtonProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

const ImageUploadButton = ({ onFileSelect, isLoading = false }: ImageUploadButtonProps) => {
  const fileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.setAttribute("accept", "image/png, image/jpeg, image/webp, image/gif");
    }
  }, []);

  return (
    <div className="flex mb-4">
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
        onChange={onFileSelect}
        ref={fileInputRef}
        id="imageUploadInput"
        disabled={isLoading}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => document.getElementById('imageUploadInput')?.click()}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري معالجة الصورة...
          </>
        ) : (
          <>
            <Upload className="ml-2 h-4 w-4" />
            اختيار صورة من الجهاز
          </>
        )}
      </Button>
    </div>
  );
};

export default ImageUploadButton;
