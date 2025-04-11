
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImageUploadButtonProps {
  hasImage: boolean;
  isDisabled: boolean;
  isUploading: boolean;
  onClick: () => void;
}

const ImageUploadButton = ({ 
  hasImage, 
  isDisabled, 
  isUploading, 
  onClick 
}: ImageUploadButtonProps) => {
  return (
    <Button
      type="button"
      variant={hasImage ? "outline" : "default"}
      className={hasImage ? "" : "bg-purple-600 hover:bg-purple-700"}
      disabled={isDisabled || isUploading}
      onClick={onClick}
    >
      {isUploading ? (
        <span>جاري الرفع...</span>
      ) : hasImage ? (
        <span>تغيير الصورة</span>
      ) : (
        <>
          <Upload className="h-4 w-4 ml-2" />
          <span>رفع صورة</span>
        </>
      )}
    </Button>
  );
};

export default ImageUploadButton;
