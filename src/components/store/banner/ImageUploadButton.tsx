
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useCallback } from "react";

interface ImageUploadButtonProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadButton = ({ onFileSelect }: ImageUploadButtonProps) => {
  const fileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.setAttribute("accept", "image/*");
    }
  }, []);

  return (
    <div className="flex mb-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
        ref={fileInputRef}
        id="imageUploadInput"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => document.getElementById('imageUploadInput')?.click()}
      >
        <Upload className="ml-2 h-4 w-4" />
        اختيار صورة من الجهاز
      </Button>
    </div>
  );
};

export default ImageUploadButton;
