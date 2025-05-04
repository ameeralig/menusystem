
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Maximize,
  Minimize,
  Move,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ImageFitType = "cover" | "contain" | "fill" | "scale-down";

interface ImageFitEditorProps {
  imageUrl: string | null;
  aspectRatio?: "1/1" | "4/3" | "16/9";
  onComplete?: (adjustedData: {
    url: string;
    fitStyle: ImageFitType;
    zoom: number;
    position: { x: number; y: number };
  }) => void;
}

const ImageFitEditor = ({
  imageUrl,
  aspectRatio = "1/1",
  onComplete,
}: ImageFitEditorProps) => {
  const [fitType, setFitType] = useState<ImageFitType>("cover");
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // حساب نسب الأبعاد
  let aspectRatioValue = 1;
  if (aspectRatio === "4/3") aspectRatioValue = 4/3;
  if (aspectRatio === "16/9") aspectRatioValue = 16/9;

  // التعامل مع السحب والإفلات لتحريك الصورة
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      if (fitType !== "cover") return;
      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || fitType !== "cover") return;
      
      const rect = container.getBoundingClientRect();
      
      // حساب النسبة المئوية للموضع
      let newX = ((e.clientX - rect.left) / rect.width) * 100;
      let newY = ((e.clientY - rect.top) / rect.height) * 100;
      
      // تحديد الحدود
      newX = Math.max(0, Math.min(newX, 100));
      newY = Math.max(0, Math.min(newY, 100));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // للأجهزة اللمسية
    container.addEventListener("touchstart", (e) => {
      if (fitType !== "cover") return;
      setIsDragging(true);
    });
    
    window.addEventListener("touchmove", (e) => {
      if (!isDragging || fitType !== "cover" || e.touches.length === 0) return;
      
      const rect = container.getBoundingClientRect();
      
      // حساب النسبة المئوية للموضع
      let newX = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      let newY = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
      
      // تحديد الحدود
      newX = Math.max(0, Math.min(newX, 100));
      newY = Math.max(0, Math.min(newY, 100));
      
      setPosition({ x: newX, y: newY });
      e.preventDefault();
    }, { passive: false });
    
    window.addEventListener("touchend", () => {
      setIsDragging(false);
    });

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", () => {});
      window.removeEventListener("touchmove", () => {});
      window.removeEventListener("touchend", () => {});
    };
  }, [isDragging, fitType]);

  // إعادة تعيين الإعدادات
  const resetAdjustments = () => {
    setFitType("cover");
    setZoom(100);
    setPosition({ x: 50, y: 50 });
  };

  // تأكيد الاختيار
  const handleComplete = () => {
    if (imageUrl && onComplete) {
      onComplete({
        url: imageUrl,
        fitStyle: fitType,
        zoom,
        position,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-2">
        <div
          ref={containerRef}
          className={cn(
            "relative w-full overflow-hidden bg-muted cursor-move",
            isDragging ? "cursor-grabbing" : (fitType === "cover" ? "cursor-grab" : "cursor-default"),
          )}
          style={{
            aspectRatio: aspectRatio.replace("/", ":"),
            maxHeight: "350px",
          }}
        >
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="معاينة الصورة"
              className="absolute inset-0 w-full h-full transition-all duration-200"
              style={{
                objectFit: fitType,
                objectPosition: fitType === "cover" ? `${position.x}% ${position.y}%` : "center",
                transform: fitType === "cover" ? `scale(${zoom / 100})` : "none",
                transformOrigin: "center",
              }}
            />
          )}
          {!imageUrl && (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              <p>لم يتم اختيار صورة</p>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">نوع ملاءمة الصورة</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            <Button
              type="button"
              variant={fitType === "cover" ? "default" : "outline"}
              onClick={() => setFitType("cover")}
              className="flex flex-col items-center gap-1 h-auto py-2"
              size="sm"
            >
              <Maximize className="h-4 w-4" />
              <span className="text-xs">ملء</span>
            </Button>
            <Button
              type="button"
              variant={fitType === "contain" ? "default" : "outline"}
              onClick={() => setFitType("contain")}
              className="flex flex-col items-center gap-1 h-auto py-2"
              size="sm"
            >
              <Minimize className="h-4 w-4" />
              <span className="text-xs">احتواء</span>
            </Button>
            <Button
              type="button"
              variant={fitType === "fill" ? "default" : "outline"}
              onClick={() => setFitType("fill")}
              className="flex flex-col items-center gap-1 h-auto py-2"
              size="sm"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs">تمدد</span>
            </Button>
            <Button
              type="button"
              variant={fitType === "scale-down" ? "default" : "outline"}
              onClick={() => setFitType("scale-down")}
              className="flex flex-col items-center gap-1 h-auto py-2"
              size="sm"
            >
              <Move className="h-4 w-4" />
              <span className="text-xs">تصغير</span>
            </Button>
          </div>
        </div>

        {fitType === "cover" && (
          <>
            <div>
              <div className="flex justify-between">
                <Label className="text-base font-medium">تكبير</Label>
                <span className="text-xs text-muted-foreground">{zoom}%</span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={(values) => setZoom(values[0])}
                min={100}
                max={200}
                step={5}
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {isDragging ? (
                <p className="animate-pulse">جاري ضبط موضع الصورة...</p>
              ) : (
                <p>اضغط واسحب لضبط موضع الصورة</p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetAdjustments}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>إعادة ضبط</span>
          </Button>
          
          <Button
            type="button"
            onClick={handleComplete}
            size="sm"
            className="flex items-center gap-1"
          >
            تأكيد
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageFitEditor;
