
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface SmartImagePreviewProps {
  imageUrl: string | null;
  aspectRatio: "1/1" | "4/3" | "16/9";
  onComplete: (data: {
    url: string;
    fitStyle: "cover" | "contain" | "fill" | "scale-down";
    zoom: number;
    position: { x: number; y: number };
  }) => void;
  onCancel: () => void;
}

interface ImageAdjustFormValues {
  fitStyle: "cover" | "contain" | "fill" | "scale-down";
}

const SmartImagePreview = ({
  imageUrl,
  aspectRatio,
  onComplete,
  onCancel
}: SmartImagePreviewProps) => {
  const form = useForm<ImageAdjustFormValues>({
    defaultValues: {
      fitStyle: "cover"
    }
  });

  const fitStyle = form.watch("fitStyle");
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // للتعامل مع تحريك الصورة
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  // إعادة تعيين الموضع عند تغيير أسلوب العرض
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [fitStyle]);

  // وظيفة تغيير الزووم
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  // وظائف تحريك الصورة
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (fitStyle !== "cover") return;
    
    setIsDragging(true);
    
    // تحديد نقطة البداية بناءً على نوع الحدث
    if ('clientX' in e) { // للماوس
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    } else if (e.touches && e.touches[0]) { // للمس
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || fitStyle !== "cover") return;

    // حساب الموضع الجديد
    const calculateNewPosition = (clientX: number, clientY: number) => {
      const containerRect = previewRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      // حدود السحب (50% من حجم الصورة المكبرة)
      const maxOffset = Math.max(0, ((zoom - 1) * containerRect.width) / 2);
      
      // حساب الموضع الجديد مع مراعاة الحدود
      const newX = Math.max(-maxOffset, Math.min(maxOffset, clientX - dragStart.x));
      const newY = Math.max(-maxOffset, Math.min(maxOffset, clientY - dragStart.y));
      
      setPosition({ x: newX, y: newY });
    };

    // تحديد الموضع بناءً على نوع الحدث
    if ('clientX' in e) { // للماوس
      calculateNewPosition(e.clientX, e.clientY);
    } else if (e.touches && e.touches[0]) { // للمس
      calculateNewPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
    
    e.preventDefault();
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  // إضافة مستمعات الأحداث للسحب
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('touchmove', onDrag);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
    }
    
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [isDragging, dragStart]);

  // وظائف الحركة باستخدام الأسهم
  const moveImage = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (fitStyle !== "cover") return;
    
    const step = 10; // عدد البكسلات للتحرك في كل ضغطة
    
    switch (direction) {
      case 'up':
        setPosition(prev => ({ ...prev, y: prev.y - step }));
        break;
      case 'down':
        setPosition(prev => ({ ...prev, y: prev.y + step }));
        break;
      case 'left':
        setPosition(prev => ({ ...prev, x: prev.x - step }));
        break;
      case 'right':
        setPosition(prev => ({ ...prev, x: prev.x + step }));
        break;
    }
  };

  const handleComplete = () => {
    if (!imageUrl) return;
    
    onComplete({
      url: imageUrl,
      fitStyle,
      zoom,
      position
    });
  };

  // تعيين نسبة العرض إلى الارتفاع
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "1/1": return "aspect-square";
      case "4/3": return "aspect-[4/3]";
      case "16/9": return "aspect-video";
      default: return "aspect-square";
    }
  };

  // تعيين أسلوب العرض للصورة
  const getImageStyle = () => {
    return {
      objectFit: fitStyle as any,
      transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
      transition: isDragging ? 'none' : 'transform 0.1s ease'
    };
  };

  if (!imageUrl) return null;

  return (
    <Form {...form}>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            {/* حاوية المعاينة */}
            <div className="relative overflow-hidden rounded-md mb-4 border-2 border-dashed border-primary/40">
              <div 
                ref={previewRef}
                className={cn(
                  getAspectRatioClass(),
                  "relative overflow-hidden bg-neutral-100 dark:bg-neutral-900"
                )}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
              >
                <img 
                  src={imageUrl} 
                  alt="معاينة الصورة" 
                  className={cn(
                    "w-full h-full",
                    fitStyle === "cover" ? "cursor-grab" : ""
                  )}
                  style={getImageStyle()}
                  draggable="false"
                />
                <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] pointer-events-none" />
              </div>
            </div>

            {/* التحكم في الصورة */}
            <div className="space-y-4">
              {/* أسلوب العرض */}
              <FormField
                control={form.control}
                name="fitStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>طريقة عرض الصورة</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={field.value === "cover" ? "default" : "outline"}
                        onClick={() => field.onChange("cover")}
                        className="justify-start"
                      >
                        تغطية كاملة
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "contain" ? "default" : "outline"}
                        onClick={() => field.onChange("contain")}
                        className="justify-start"
                      >
                        احتواء كامل
                      </Button>
                    </div>
                  </FormItem>
                )}
              />

              {/* التحكم في الزووم - فقط إذا كان أسلوب العرض "cover" */}
              {fitStyle === "cover" && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <FormLabel>التكبير ({zoom.toFixed(1)}x)</FormLabel>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setZoom(prev => Math.max(1, prev - 0.1))}
                        disabled={zoom <= 1}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                        disabled={zoom >= 2}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={2}
                    step={0.1}
                    onValueChange={handleZoomChange}
                  />
                </div>
              )}

              {/* التحكم في الموضع - فقط إذا كان أسلوب العرض "cover" والزووم > 1 */}
              {fitStyle === "cover" && zoom > 1 && (
                <div className="space-y-2">
                  <FormLabel>تحريك الصورة</FormLabel>
                  <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
                    <div></div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => moveImage('up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <div></div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => moveImage('left')}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div></div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => moveImage('right')}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div></div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => moveImage('down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <div></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    يمكنك أيضاً سحب الصورة مباشرة بالماوس أو باللمس
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* أزرار التأكيد والإلغاء */}
        <div className="flex gap-3 items-center justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <X className="ml-2 h-4 w-4" />
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleComplete}
          >
            <Check className="ml-2 h-4 w-4" />
            استخدم هذه الصورة
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default SmartImagePreview;

