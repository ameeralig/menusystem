
import { useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImagePreviewProps {
  previewUrl: string;
  onClear: () => void;
  onError: () => void;
}

const ImagePreview = ({ previewUrl, onClear, onError }: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>(previewUrl);
  
  // تحديث URL الصورة مع معرف زمني عند تغيير previewUrl
  useEffect(() => {
    try {
      const url = new URL(previewUrl);
      url.searchParams.set('t', Date.now().toString());
      setImageUrl(url.toString());
      
      // إعادة تعيين حالة التحميل
      setIsLoading(true);
    } catch (e) {
      // إذا كان URL غير صالح، استخدم previewUrl كما هو
      setImageUrl(previewUrl);
    }
  }, [previewUrl]);

  return (
    <div className="relative overflow-hidden rounded-md border border-gray-200">
      <AspectRatio ratio={16 / 5}>
        {isLoading && (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
        <img 
          src={imageUrl} 
          alt="معاينة صورة الغلاف" 
          className="w-full h-full object-cover"
          onError={onError}
          onLoad={() => setIsLoading(false)}
          loading="eager"
          fetchPriority="high"
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
