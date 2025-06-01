
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Palette, RefreshCcw, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface DirectColorPickerProps {
  colorTheme: string;
  setColorTheme: (value: string) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const DirectColorPicker = ({
  colorTheme,
  setColorTheme,
  handleSubmit,
  isLoading
}: DirectColorPickerProps) => {
  const [selectedColor, setSelectedColor] = useState<string>("#ff9178");
  const [hexInput, setHexInput] = useState<string>("ff9178");
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const { toast } = useToast();

  // تحديث اللون عند تغيير colorTheme
  useEffect(() => {
    if (colorTheme && colorTheme !== "default" && colorTheme.startsWith("#")) {
      setSelectedColor(colorTheme);
      setHexInput(colorTheme.replace("#", ""));
    }
  }, [colorTheme]);

  // دالة التحقق من صحة كود اللون
  const isValidHex = (hex: string): boolean => {
    const hexRegex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  };

  // تطبيق اللون مباشرة على المعاينة
  const applyColorInstantly = (color: string) => {
    if (color && color !== colorTheme) {
      setColorTheme(color);
      console.log("تطبيق اللون فوري:", color);
    }
  };

  // معالج تغيير اللون من منتقي الألوان
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    setHexInput(newColor.replace("#", ""));
    
    // تطبيق فوري إذا كان في وضع المعاينة
    if (isPreviewMode) {
      applyColorInstantly(newColor);
    }
  };

  // معالج تغيير كود HEX
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace("#", "");
    setHexInput(value);
    
    if (isValidHex(value)) {
      const fullHex = `#${value}`;
      setSelectedColor(fullHex);
      
      // تطبيق فوري إذا كان في وضع المعاينة
      if (isPreviewMode) {
        applyColorInstantly(fullHex);
      }
    }
  };

  // تطبيق اللون على المعاينة
  const handlePreview = () => {
    if (!isValidHex(hexInput)) {
      toast({
        title: "كود لون غير صحيح",
        description: "يرجى إدخال كود لون صحيح",
        variant: "destructive",
      });
      return;
    }
    
    const colorToApply = `#${hexInput}`;
    applyColorInstantly(colorToApply);
    setIsPreviewMode(true);
    
    toast({
      title: "تم تطبيق اللون",
      description: "يمكنك رؤية التغيير في المعاينة",
    });
  };

  // حفظ اللون نهائياً
  const handleSaveColor = async () => {
    if (!isValidHex(hexInput)) {
      toast({
        title: "كود لون غير صحيح",
        description: "يرجى إدخال كود لون صحيح قبل الحفظ",
        variant: "destructive",
      });
      return;
    }

    const colorToSave = `#${hexInput}`;
    setColorTheme(colorToSave);
    
    try {
      await handleSubmit();
      setIsPreviewMode(false);
      toast({
        title: "تم حفظ اللون",
        description: "تم حفظ اللون بنجاح في إعدادات المتجر",
      });
    } catch (error) {
      console.error("خطأ في حفظ اللون:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ اللون، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // إعادة تعيين اللون
  const handleReset = () => {
    setSelectedColor("#ff9178");
    setHexInput("ff9178");
    setColorTheme("#ff9178");
    setIsPreviewMode(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">اختيار لون المتجر</h3>
      </div>

      {/* منتقي الألوان الرئيسي */}
      <div className="space-y-4">
        <Label htmlFor="color-picker" className="text-sm font-medium">
          اختر اللون المفضل لمتجرك
        </Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              id="color-picker"
              type="color"
              value={selectedColor}
              onChange={handleColorChange}
              className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-primary transition-colors"
              style={{ padding: '4px' }}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              اللون المختار حالياً
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <div className="font-medium">{selectedColor}</div>
                <div className="text-sm text-gray-500">RGB: {hexToRgb(selectedColor)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* إدخال كود HEX */}
      <div className="space-y-3">
        <Label htmlFor="hex-input" className="text-sm font-medium">
          أو أدخل كود اللون يدوياً
        </Label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">#</span>
            <Input
              id="hex-input"
              value={hexInput}
              onChange={handleHexChange}
              className="pr-8 text-center font-mono"
              placeholder="ff9178"
              maxLength={6}
            />
          </div>
          <div 
            className="w-12 h-10 rounded border-2 border-gray-200"
            style={{ 
              backgroundColor: isValidHex(hexInput) ? `#${hexInput}` : '#f3f4f6',
              transition: 'background-color 0.3s ease'
            }}
          />
        </div>
        {hexInput && !isValidHex(hexInput) && (
          <div className="text-sm text-red-500">
            كود اللون غير صحيح. استخدم 6 أرقام/حروف (مثال: ff9178)
          </div>
        )}
      </div>

      {/* أزرار التحكم */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handlePreview}
          variant="outline"
          disabled={!isValidHex(hexInput) || isLoading}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          معاينة
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          إعادة تعيين
        </Button>
      </div>

      {/* زر الحفظ */}
      <Button
        onClick={handleSaveColor}
        disabled={!isValidHex(hexInput) || isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-white"
        size="lg"
      >
        {isLoading ? (
          <>
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            حفظ اللون نهائياً
          </>
        )}
      </Button>

      {isPreviewMode && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="text-sm text-blue-700 dark:text-blue-300">
            💡 وضع المعاينة مفعل. اضغط "حفظ اللون نهائياً" لتأكيد التغييرات.
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// دالة مساعدة لتحويل HEX إلى RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  }
  return "غير محدد";
};

export default DirectColorPicker;
