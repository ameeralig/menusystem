
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CoverImageDisplayProps {
  imageUrl: string;
  onRemove: () => void;
  isDisabled: boolean;
}

const CoverImageDisplay = ({ imageUrl, onRemove, isDisabled }: CoverImageDisplayProps) => {
  return (
    <div className="relative">
      <img 
        src={imageUrl} 
        alt="صورة الغلاف" 
        className="w-full h-48 object-cover rounded-md border border-gray-200"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 rounded-full opacity-90 hover:opacity-100"
        onClick={onRemove}
        disabled={isDisabled}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CoverImageDisplay;
