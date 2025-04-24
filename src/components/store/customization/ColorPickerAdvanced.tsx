
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Palette, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export const colorThemes = [
  { id: "default", name: "الافتراضي", value: "default", hex: "#6E7681" },
  { id: "coral", name: "مرجاني", value: "coral", hex: "#ff9178" },
  { id: "purple", name: "بنفسجي", value: "purple", hex: "#8B5CF6" },
  { id: "blue", name: "أزرق", value: "blue", hex: "#3B82F6" },
  { id: "green", name: "أخضر", value: "green", hex: "#10B981" },
  { id: "pink", name: "وردي", value: "pink", hex: "#EC4899" },
  { id: "teal", name: "فيروزي", value: "teal", hex: "#14B8A6" },
  { id: "amber", name: "كهرماني", value: "amber", hex: "#F59E0B" },
  { id: "indigo", name: "نيلي", value: "indigo", hex: "#6366F1" },
  { id: "rose", name: "وردي فاتح", value: "rose", hex: "#F43F5E" }
];

// ألوان إضافية مخصصة
const additionalColors = [
  "#ff6b6b", "#74c0fc", "#a9e34b", "#ffec99", "#ffa94d", 
  "#da77f2", "#9775fa", "#4c6ef5", "#339af0", "#3bc9db",
  "#38d9a9", "#94d82d", "#ffd43b", "#ff922b", "#ff5d5d",
  "#c2255c", "#5f3dc4", "#1864ab", "#087f5b", "#2b8a3e",
  "#e67700", "#bf5600", "#984c0c", "#76520e", "#513621"
];

interface ColorPickerAdvancedProps {
  colorTheme: string;
  setColorTheme: (value: string) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const ColorPickerAdvanced = ({
  colorTheme,
  setColorTheme,
  handleSubmit,
  isLoading
}: ColorPickerAdvancedProps) => {
  const [customColor, setCustomColor] = useState<string>("");
  const [hexColor, setHexColor] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("predefined");
  const { toast } = useToast();

  useEffect(() => {
    // عند تغيير اللون المختار، تحديث قيمة اللون المخصص
    const selectedTheme = colorThemes.find(theme => theme.value === colorTheme);
    if (selectedTheme) {
      setHexColor(selectedTheme.hex);
    }
  }, [colorTheme]);

  const handleColorChange = (value: string) => {
    setColorTheme(value);
    const selectedTheme = colorThemes.find(theme => theme.value === value);
    if (selectedTheme) {
      setHexColor(selectedTheme.hex);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexColor(value);
    
    // تحديد اللون المناسب من القائمة إذا كان الكود يطابق أحد الألوان المعرفة
    const foundColor = colorThemes.find(theme => theme.hex.toLowerCase() === value.toLowerCase());
    if (foundColor) {
      setColorTheme(foundColor.value);
    } else {
      // إذا كان لون مخصص، يمكن إضافة منطق هنا للتعامل معه
      // يمكن إضافة منطق تخزين الألوان المخصصة
    }
  };

  const handleApplyCustomColor = () => {
    if (!customColor) {
      toast({
        title: "الرجاء اختيار لون",
        description: "يرجى تحديد لون مخصص أولاً",
        variant: "destructive",
      });
      return;
    }
    
    setHexColor(customColor);
    // هنا يمكن إضافة منطق لتخزين اللون المخصص
    toast({
      title: "تم تطبيق اللون المخصص",
      description: "تم تحديث اللون بنجاح",
    });
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex space-x-reverse space-x-2 mb-4">
        <Button
          variant={activeTab === "predefined" ? "default" : "outline"}
          onClick={() => setActiveTab("predefined")}
          size="sm"
          className="flex items-center gap-2"
        >
          <Palette className="h-4 w-4" />
          <span>ألوان جاهزة</span>
        </Button>
        <Button
          variant={activeTab === "picker" ? "default" : "outline"}
          onClick={() => setActiveTab("picker")}
          size="sm"
          className="flex items-center gap-2"
        >
          <Palette className="h-4 w-4" />
          <span>عجلة الألوان</span>
        </Button>
        <Button
          variant={activeTab === "hex" ? "default" : "outline"}
          onClick={() => setActiveTab("hex")}
          size="sm"
          className="flex items-center gap-2"
        >
          <span>#</span>
          <span>كود اللون</span>
        </Button>
      </div>

      {activeTab === "predefined" && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">الألوان الأساسية</h4>
          <div className="grid grid-cols-5 gap-2">
            {colorThemes.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full h-12 rounded-md cursor-pointer border-2 flex items-center justify-center ${
                  colorTheme === theme.value ? 'border-[#ff9178]' : 'border-transparent'
                }`}
                style={{
                  background: theme.hex,
                  color: theme.id === "default" ? "#fff" : getContrastColor(theme.hex)
                }}
                onClick={() => handleColorChange(theme.value)}
                title={theme.name}
              >
                {colorTheme === theme.value && (
                  <div className="text-xs font-bold">{theme.name}</div>
                )}
              </motion.button>
            ))}
          </div>
          
          <h4 className="text-sm font-medium mt-4">ألوان إضافية</h4>
          <div className="grid grid-cols-5 gap-2">
            {additionalColors.map((color, index) => (
              <motion.button
                key={`additional-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full h-12 rounded-md cursor-pointer border-2 border-transparent"
                style={{
                  background: color
                }}
                onClick={() => setHexColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "picker" && (
        <div className="space-y-4">
          <Label htmlFor="color-picker">اختر لون مخصص</Label>
          <div className="flex items-center gap-4">
            <Input
              id="color-picker"
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="w-full h-12 cursor-pointer"
            />
            <Button 
              onClick={handleApplyCustomColor}
              disabled={!customColor}
              className="h-12"
            >
              تطبيق
            </Button>
          </div>
          {customColor && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: customColor }}
              ></div>
              <span className="text-sm">{customColor}</span>
            </div>
          )}
        </div>
      )}

      {activeTab === "hex" && (
        <div className="space-y-4">
          <Label htmlFor="hex-color">أدخل كود اللون (HEX)</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">#</span>
              <Input
                id="hex-color"
                value={hexColor.replace('#', '')}
                onChange={(e) => setHexColor('#' + e.target.value)}
                className="pl-8"
                placeholder="ff9178"
              />
            </div>
            <div
              className="w-12 h-10 rounded border"
              style={{ backgroundColor: hexColor }}
            ></div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t mt-4">
        <h4 className="text-sm font-medium mb-2">معاينة اللون المختار</h4>
        <div className="flex items-center space-x-reverse space-x-2">
          <div
            className="w-10 h-10 rounded-full border"
            style={{ backgroundColor: hexColor }}
          ></div>
          <div className="text-sm">
            <div>{getColorName(hexColor, colorTheme)}</div>
            <div className="text-muted-foreground">{hexColor}</div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            حفظ التغييرات
          </>
        )}
      </Button>
    </div>
  );
};

// دالة مساعدة للحصول على اللون المناسب للنص بناءً على لون الخلفية
const getContrastColor = (hexColor: string): string => {
  // تحويل اللون السداسي إلى RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // حساب السطوع باستخدام صيغة YIQ
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // إذا كان لون الخلفية فاتحاً، استخدم نص داكن والعكس صحيح
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

// دالة للحصول على اسم اللون المختار
const getColorName = (hexColor: string, selectedTheme: string): string => {
  const theme = colorThemes.find(theme => theme.value === selectedTheme);
  if (theme) {
    return theme.name;
  }
  
  const themeByHex = colorThemes.find(theme => theme.hex.toLowerCase() === hexColor.toLowerCase());
  if (themeByHex) {
    return themeByHex.name;
  }
  
  return "لون مخصص";
};

export default ColorPickerAdvanced;
