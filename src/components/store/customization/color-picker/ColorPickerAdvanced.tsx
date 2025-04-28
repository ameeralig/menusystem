
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Palette, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { colorThemes } from "./colorThemes";
import ColorPalette from "./ColorPalette";
import ColorCustomizer from "./ColorCustomizer";
import ColorPreview from "./ColorPreview";
import { getColorName } from "../utils/colorUtils";

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
    const foundColor = colorThemes.find(theme => 
      theme.hex.toLowerCase() === value.toLowerCase()
    );
    if (foundColor) {
      setColorTheme(foundColor.value);
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
      </div>

      {activeTab === "predefined" && (
        <ColorPalette 
          colorTheme={colorTheme}
          onColorChange={handleColorChange}
        />
      )}

      {activeTab === "picker" && (
        <ColorCustomizer
          customColor={customColor}
          hexColor={hexColor}
          onCustomColorChange={handleCustomColorChange}
          onHexChange={handleHexChange}
          onApplyCustomColor={handleApplyCustomColor}
        />
      )}

      <ColorPreview 
        hexColor={hexColor}
        colorName={getColorName(hexColor, colorTheme)}
      />

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

export default ColorPickerAdvanced;
