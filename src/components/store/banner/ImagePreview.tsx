
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  previewUrl: string;
  onClear: () => void;
  onError: () => void;
}

const ImagePreview = ({ previewUrl, onClear, onError }: ImagePreviewProps) => {
  return (
    <div className="relative overflow-hidden rounded-md border border-gray-200">
      <AspectRatio ratio={16 / 5}>
        <img 
          src={previewUrl} 
          alt="معاينة صورة الغلاف" 
          className="w-full h-full object-cover"
          onError={onError}
        />
        <Button 
          type="button" 
          variant="destructive" 
          size="sm" 
          className="absolute top-2 right-2"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </AspectRatio>
    </div>
  );
};

export default ImagePreview;
