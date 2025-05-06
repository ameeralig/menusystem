
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useCallback } from "react";

interface CameraUploadButtonProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CameraUploadButton = ({ onFileSelect }: CameraUploadButtonProps) => {
  const fileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.setAttribute("accept", "image/*");
    }
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
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
      
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileSelect}
        id="cameraInput"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => document.getElementById('cameraInput')?.click()}
      >
        <Camera className="ml-2 h-4 w-4" />
        التقاط صورة من الكاميرا
      </Button>
    </div>
  );
};

export default CameraUploadButton;
