
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Palette, SwatchBook } from "lucide-react";

const defaultPresets = [
  "#ff9178", "#9b87f5", "#0EA5E9", "#22c55e", "#FDE047", "#D946EF",
  "#f43f5e", "#f59e42", "#14b8a6", "#6366f1"
];

interface ColorPickerSelectorProps {
  color: string;
  setColor: (color: string) => void;
  disabled?: boolean;
}

const ColorPickerSelector = ({ color, setColor, disabled }: ColorPickerSelectorProps) => {
  const [inputValue, setInputValue] = useState(color);

  // دالة تحقق سريعة من صحة كود اللون
  const isValidHex = (val: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val);

  // التغيير عند الكتابة في مربع كود اللون
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (isValidHex(e.target.value)) {
      setColor(e.target.value);
    }
  };

  // عجلة الألوان الأصلية من html5
  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setColor(e.target.value);
  };

  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40 mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#ff9178]" />
            <span>ألوان المتجر</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* إدخال كود اللون */}
          <div className="flex items-center gap-2">
            <label className="block min-w-fit text-sm text-gray-700 dark:text-gray-300">
              كود اللون
            </label>
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              disabled={disabled}
              maxLength={7}
              className="w-32 rtl:text-right"
              placeholder="#ff9178"
              style={{ direction: "ltr" }}
            />
          </div>

          {/* عجلة الألوان */}
          <div className="flex items-center gap-4">
            <label className="block text-sm text-gray-700 dark:text-gray-300">
              اختر من العجلة
            </label>
            <input
              type="color"
              value={color}
              onChange={handleNativeColorChange}
              className="h-10 w-10 rounded-full border cursor-pointer border-[#eee]"
              disabled={disabled}
              style={{ background: color }}
            />
            <span className="rounded-full border px-3 py-2" style={{ background: color }}></span>
          </div>

          {/* مربعات ألوان جاهزة */}
          <div>
            <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
              ألوان مقترحة
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  disabled={disabled}
                  className={`w-8 h-8 rounded-md border-2 transition-all
                    ${color === preset ? "border-[#ff9178] scale-110 shadow-lg" : "border-gray-200 dark:border-gray-600"}
                  `}
                  onClick={() => {
                    setInputValue(preset);
                    setColor(preset);
                  }}
                  style={{ background: preset }}
                  aria-label={`اختر اللون ${preset}`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorPickerSelector;
