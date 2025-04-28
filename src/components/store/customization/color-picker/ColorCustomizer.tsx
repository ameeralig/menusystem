
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ColorCustomizerProps {
  customColor: string;
  hexColor: string;
  onCustomColorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHexChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyCustomColor: () => void;
}

const ColorCustomizer = ({
  customColor,
  hexColor,
  onCustomColorChange,
  onHexChange,
  onApplyCustomColor
}: ColorCustomizerProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="color-picker">اختر لون مخصص</Label>
        <div className="flex items-center gap-4">
          <Input
            id="color-picker"
            type="color"
            value={customColor}
            onChange={onCustomColorChange}
            className="w-full h-12 cursor-pointer"
          />
          <Button 
            onClick={onApplyCustomColor}
            disabled={!customColor}
            className="h-12"
          >
            تطبيق
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="hex-color">أدخل كود اللون (HEX)</Label>
        <div className="flex items-center gap-4">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">#</span>
            <Input
              id="hex-color"
              value={hexColor.replace('#', '')}
              onChange={onHexChange}
              className="pl-8"
              placeholder="ff9178"
            />
          </div>
          <div
            className="w-12 h-10 rounded border"
            style={{ backgroundColor: hexColor }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorCustomizer;
