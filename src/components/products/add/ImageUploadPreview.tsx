
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadPreviewProps {
  previewUrl: string | null;
  onSelect: () => void;
}

const ImageUploadPreview = ({ previewUrl, onSelect }: ImageUploadPreviewProps) => {
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
        previewUrl ? "border-primary" : "border-muted hover:border-primary/50"
      )}
    >
      {previewUrl ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full h-64 mb-4">
            <img 
              src={previewUrl} 
              alt="معاينة" 
              className="mx-auto rounded-lg object-contain w-full h-full"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            انقر لتغيير الصورة
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ImagePlus className="h-8 w-8 text-primary" />
          </div>
          <p className="font-medium">اضغط هنا لاختيار صورة</p>
          <p className="text-sm text-muted-foreground">
            يمكنك رفع صورة بصيغة JPG أو PNG أو GIF
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadPreview;
