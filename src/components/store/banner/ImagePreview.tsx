
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { optimizeImageUrl } from "@/utils/imageOptimizer";
import { Skeleton } from "@/components/ui/skeleton";

interface ImagePreviewProps {
  previewUrl: string;
  onClear: () => void;
  onError: () => void;
}

const ImagePreview = ({ previewUrl, onClear, onError }: ImagePreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // تحسين رابط الصورة باستخدام أداة التحسين
  const optimizedUrl = optimizeImageUrl(previewUrl, {
    format: 'webp',
    quality: 90, // جودة أعلى لصور الغلاف
    bustCache: true,
    isImportant: true
  });

  return (
    <div className="w-full aspect-[21/9] bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden mb-4">
      {!imageLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <img
        src={optimizedUrl || previewUrl}
        alt="معاينة الصورة"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={onError}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 shadow-md"
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ImagePreview;
