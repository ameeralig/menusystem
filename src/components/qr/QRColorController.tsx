import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw } from "lucide-react";
import { QRSettings } from "@/pages/QRGenerator";

interface QRColorControllerProps {
  settings: QRSettings;
  onSettingsChange: (key: keyof QRSettings, value: any) => void;
}

const predefinedColors = [
  { name: "أسود", value: "#000000" },
  { name: "أزرق", value: "#3B82F6" },
  { name: "أخضر", value: "#10B981" },
  { name: "أحمر", value: "#EF4444" },
  { name: "بنفسجي", value: "#8B5CF6" },
  { name: "برتقالي", value: "#F97316" },
  { name: "وردي", value: "#EC4899" },
  { name: "بني", value: "#A3A3A3" },
];

const QRColorController = ({ settings, onSettingsChange }: QRColorControllerProps) => {
  const handlePresetColor = (color: string, type: 'foreground' | 'background') => {
    if (type === 'foreground') {
      onSettingsChange('foregroundColor', color);
    } else {
      onSettingsChange('backgroundColor', color);
    }
  };

  const resetColors = () => {
    onSettingsChange('foregroundColor', '#000000');
    onSettingsChange('backgroundColor', '#ffffff');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          تحكم في الألوان
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* لون المقدمة */}
        <div className="space-y-3">
          <Label>لون الرمز (المقدمة)</Label>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={settings.foregroundColor}
              onChange={(e) => onSettingsChange('foregroundColor', e.target.value)}
              className="w-16 h-12 cursor-pointer"
            />
            <Input
              type="text"
              value={settings.foregroundColor}
              onChange={(e) => onSettingsChange('foregroundColor', e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          
          {/* ألوان محددة مسبقاً للمقدمة */}
          <div className="grid grid-cols-4 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={`fg-${color.value}`}
                onClick={() => handlePresetColor(color.value, 'foreground')}
                className="w-full h-8 rounded border-2 hover:scale-105 transition-transform"
                style={{ 
                  backgroundColor: color.value,
                  borderColor: settings.foregroundColor === color.value ? '#ff9178' : 'transparent'
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* لون الخلفية */}
        <div className="space-y-3">
          <Label>لون الخلفية</Label>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onSettingsChange('backgroundColor', e.target.value)}
              className="w-16 h-12 cursor-pointer"
            />
            <Input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) => onSettingsChange('backgroundColor', e.target.value)}
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
          
          {/* ألوان محددة مسبقاً للخلفية */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "أبيض", value: "#ffffff" },
              { name: "رمادي فاتح", value: "#f3f4f6" },
              { name: "أزرق فاتح", value: "#dbeafe" },
              { name: "أخضر فاتح", value: "#d1fae5" },
              { name: "أحمر فاتح", value: "#fee2e2" },
              { name: "بنفسجي فاتح", value: "#ede9fe" },
              { name: "برتقالي فاتح", value: "#fed7aa" },
              { name: "وردي فاتح", value: "#fce7f3" },
            ].map((color) => (
              <button
                key={`bg-${color.value}`}
                onClick={() => handlePresetColor(color.value, 'background')}
                className="w-full h-8 rounded border-2 hover:scale-105 transition-transform"
                style={{ 
                  backgroundColor: color.value,
                  borderColor: settings.backgroundColor === color.value ? '#ff9178' : '#e5e7eb'
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* زر إعادة تعيين */}
        <Button 
          variant="outline" 
          onClick={resetColors}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 me-2" />
          إعادة تعيين الألوان
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRColorController;