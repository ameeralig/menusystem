
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  UploadCloud,
  ZoomIn,
  ZoomOut,
  Move,
  Check,
  RotateCw,
  X,
  Image
} from "lucide-react";

export type FitMode = "cover" | "contain" | "fill" | "center";
export type PositionConfig = { x: number; y: number; scale: number; rotation: number };

interface ImageUploadPreviewProps {
  onImageSelect: (file: File, config: PositionConfig, fitMode: FitMode) => void;
  aspectRatio?: number; // 1 لمربع، 4/3 لنسبة 4:3، الخ
  containerClassName?: string;
  defaultFitMode?: FitMode;
  maxFileSize?: number; // بالبايت، الافتراضي هو 10MB
  initialImageUrl?: string; // URL للصورة الموجودة (للتحرير)
  onCancel?: () => void; // وظيفة تُستدعى عند إلغاء عملية الرفع
  description?: string; // وصف إضافي لعرضه للمستخدم
  allowedFormats?: string[]; // صيغ الملفات المسموح بها، مثل: ['image/jpeg', 'image/png']
  altText?: string; // نص بديل للصورة
}

export const ImageUploadPreview = ({
  onImageSelect,
  aspectRatio = 1, // مربع افتراضياً
  containerClassName = "",
  defaultFitMode = "cover",
  maxFileSize = 10 * 1024 * 1024, // 10MB
  initialImageUrl = "",
  onCancel,
  description = "قم برفع صورة وضبط موضعها",
  allowedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  altText = "معاينة الصورة"
}: ImageUploadPreviewProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [fitMode, setFitMode] = useState<FitMode>(defaultFitMode);
  const [position, setPosition] = useState<PositionConfig>({ x: 50, y: 50, scale: 1, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);
  
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // استدعاء دالة rAF لتحسين الأداء عند التحريك
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // إذا كان هناك صورة أولية، قم بتحميلها لمعرفة أبعادها
    if (initialImageUrl) {
      const img = document.createElement('img');
      img.onload = () => {
        setOriginalDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.src = initialImageUrl;
    }

    // حساب أبعاد الحاوية
    updateContainerDimensions();

    // إعادة حساب الأبعاد عند تغيير حجم النافذة
    window.addEventListener('resize', updateContainerDimensions);
    return () => {
      window.removeEventListener('resize', updateContainerDimensions);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [initialImageUrl]);

  const updateContainerDimensions = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerDimensions({ width, height });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من حجم الملف
    if (file.size > maxFileSize) {
      setError(`حجم الملف كبير جدًا. الحد الأقصى هو ${Math.round(maxFileSize / (1024 * 1024))}MB`);
      return;
    }

    // التحقق من تنسيق الملف
    if (allowedFormats.length && !allowedFormats.includes(file.type)) {
      setError(`تنسيق الملف غير مدعوم. الصيغ المدعومة هي: ${allowedFormats.map(f => f.replace('image/', '')).join(', ')}`);
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowControls(true);
    
    // الحصول على أبعاد الصورة الأصلية
    const img = document.createElement('img');
    img.onload = () => {
      setOriginalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      
      // إعادة تعيين موقف الصورة عند تحديد صورة جديدة
      setPosition({ x: 50, y: 50, scale: 1, rotation: 0 });
    };
    img.src = objectUrl;
  };

  const startDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!showControls) return;
    
    setIsDragging(true);
    
    if ('touches' in e) {
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else {
      e.preventDefault();
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const onDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !showControls) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    // استخدام animationFrame لتحسين الأداء
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const sensitivity = 0.5; // يمكن تعديل حساسية التحريك
      let newX = position.x + (deltaX * sensitivity);
      let newY = position.y + (deltaY * sensitivity);
      
      // تقييد القيم بين 0 و 100
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      
      setPosition(prev => ({ ...prev, x: newX, y: newY }));
      setDragStart({ x: clientX, y: clientY });
    });
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  const handleZoom = (newScale: number) => {
    setPosition(prev => ({ 
      ...prev, 
      scale: Math.max(0.5, Math.min(3, newScale))
    }));
  };

  const handleRotation = (increment: number) => {
    setPosition(prev => ({
      ...prev,
      rotation: (prev.rotation + increment) % 360
    }));
  };

  const getImageStyle = () => {
    let style: React.CSSProperties = {
      transform: `translate(-${position.x}%, -${position.y}%) scale(${position.scale}) rotate(${position.rotation}deg)`,
      transformOrigin: `${position.x}% ${position.y}%`,
      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    };
    
    switch (fitMode) {
      case "cover":
        style.width = '100%';
        style.height = '100%';
        style.objectFit = 'cover';
        break;
      case "contain":
        style.maxWidth = '100%';
        style.maxHeight = '100%';
        style.objectFit = 'contain';
        break;
      case "fill":
        style.width = '100%';
        style.height = '100%';
        style.objectFit = 'fill';
        break;
      case "center":
        style.maxWidth = '100%';
        style.maxHeight = '100%';
        style.objectPosition = 'center';
        break;
    }
    
    return style;
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onImageSelect(selectedFile, position, fitMode);
      
      // إخفاء أدوات التحكم بعد التأكيد
      setShowControls(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    // إعادة تعيين الحالة
    setSelectedFile(null);
    setPreviewUrl(initialImageUrl);
    setShowControls(false);
    setPosition({ x: 50, y: 50, scale: 1, rotation: 0 });
    setError(null);
    
    // إعادة تعيين حقل إدخال الملف
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // حساب نسبة العرض إلى الارتفاع كنص لعرضه للمستخدم
  const getAspectRatioText = () => {
    if (aspectRatio === 1) return "مربع (1:1)";
    if (aspectRatio === 4/3) return "أفقي (4:3)";
    if (aspectRatio === 3/4) return "عمودي (3:4)";
    if (aspectRatio === 16/9) return "عريض (16:9)";
    
    // تقريب النسبة إلى أقرب رقمين
    const gcd = (a: number, b: number): number => {
      return b ? gcd(b, a % b) : a;
    };
    
    const precision = 100;
    const ratioGcd = gcd(Math.round(aspectRatio * precision), precision);
    const numerator = Math.round(aspectRatio * precision) / ratioGcd;
    const denominator = precision / ratioGcd;
    
    if (numerator <= 20 && denominator <= 20) {
      return `${Math.round(numerator)}:${Math.round(denominator)}`;
    }
    
    return aspectRatio.toFixed(2);
  };

  const getResolutionText = () => {
    if (!containerDimensions) return "";
    
    // حساب الطول والعرض الفعليين استنادًا إلى نسبة العرض إلى الارتفاع
    let width: number, height: number;
    
    if (containerDimensions.width / containerDimensions.height > aspectRatio) {
      // الحاوية أوسع من نسبة العرض إلى الارتفاع المستهدفة
      height = Math.round(containerDimensions.height);
      width = Math.round(height * aspectRatio);
    } else {
      // الحاوية أطول من نسبة العرض إلى الارتفاع المستهدفة
      width = Math.round(containerDimensions.width);
      height = Math.round(width / aspectRatio);
    }
    
    return `${width}×${height} بكسل`;
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingTop: `${(1 / aspectRatio) * 100}%`, // إنشاء الحاوية بناءً على نسبة العرض إلى الارتفاع
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    cursor: showControls && previewUrl ? (isDragging ? 'grabbing' : 'grab') : 'default',
  };

  const previewContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className={`image-upload-preview ${containerClassName}`}>
      {/* معلومات نسبة العرض إلى الارتفاع والقياسات */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">نسبة العرض للارتفاع: {getAspectRatioText()}</span>
          {containerDimensions && (
            <span className="text-xs text-muted-foreground">({getResolutionText()})</span>
          )}
        </div>
        
        {originalDimensions && (
          <span className="text-xs text-muted-foreground">
            حجم الصورة الأصلي: {originalDimensions.width}×{originalDimensions.height}
          </span>
        )}
      </div>

      {/* حاوية معاينة الصورة */}
      <div
        ref={containerRef}
        style={containerStyle}
        className={`border-2 border-dashed rounded-lg ${
          showControls ? "border-primary" : "border-muted-foreground/20"
        } ${isDragging ? "border-primary/50" : ""}`}
      >
        {/* محتوى معاينة الصورة - ظاهر فقط عند وجود صورة */}
        {previewUrl && (
          <div
            ref={imageRef}
            style={previewContainerStyle}
            onMouseDown={startDrag}
            onMouseMove={onDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchStart={startDrag}
            onTouchMove={onDrag}
            onTouchEnd={stopDrag}
          >
            <img
              src={previewUrl}
              alt={altText}
              style={getImageStyle()}
              className="pointer-events-none"
            />
          </div>
        )}

        {/* حالة عدم وجود صورة - إظهار زر الرفع */}
        {!previewUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <UploadCloud className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground text-center mb-4">{description}</p>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              اختر صورة
            </Button>
          </div>
        )}

        {/* عناصر التحكم - تظهر فقط عند وجود صورة وتفعيل عناصر التحكم */}
        {previewUrl && !showControls && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button 
              onClick={() => setShowControls(true)}
              variant="outline"
              className="gap-2"
            >
              <ZoomIn className="h-4 w-4" />
              تعديل الصورة
            </Button>
          </div>
        )}
      </div>

      {/* زر رفع الصورة - دائماً مرئي */}
      <div className="mt-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept={allowedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <UploadCloud className="h-4 w-4" />
            {previewUrl ? "تغيير الصورة" : "رفع صورة"}
          </Button>
          
          {previewUrl && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              إزالة
            </Button>
          )}
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}

      {/* أدوات التحكم في الصورة - تظهر فقط عند نشاط وضع التحكم */}
      {showControls && previewUrl && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">طريقة ملاءمة الصورة</Label>
            <Select 
              value={fitMode}
              onValueChange={(value: string) => setFitMode(value as FitMode)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">ملء (قد يتم قص جزء من الصورة)</SelectItem>
                <SelectItem value="contain">احتواء (إظهار الصورة كاملةً)</SelectItem>
                <SelectItem value="fill">تمدد (قد تتشوه النسب)</SelectItem>
                <SelectItem value="center">توسيط</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">تكبير/تصغير</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleZoom(position.scale - 0.1)}
                  disabled={position.scale <= 0.5}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleZoom(position.scale + 0.1)}
                  disabled={position.scale >= 3}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[position.scale]}
              min={0.5}
              max={3}
              step={0.01}
              onValueChange={(values) => handleZoom(values[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">تدوير</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRotation(-90)}
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRotation(90)}
                >
                  <RotateCw className="h-3 w-3 transform rotate-180" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              <Move className="h-3 w-3 inline mr-1" /> اسحب الصورة لتحريكها
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 gap-2"
            >
              <Check className="h-4 w-4" />
              تأكيد
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadPreview;
