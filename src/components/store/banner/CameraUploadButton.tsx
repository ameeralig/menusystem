
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useCallback } from "react";

interface CameraUploadButtonProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CameraUploadButton = ({ onFileSelect }: CameraUploadButtonProps) => {
  const fileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.setAttribute("accept", "image/*");
      node.setAttribute("capture", "environment");
    }
  }, []);

  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileSelect}
        ref={fileInputRef}
        id="cameraInput"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => document.getElementById('cameraInput')?.click()}
      >
        <Camera className="ml-2 h-4 w-4" />
        التقاط صورة أو اختيار من المعرض
      </Button>
    </div>
  );
};

export default CameraUploadButton;
