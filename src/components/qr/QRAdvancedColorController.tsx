import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, RotateCcw } from "lucide-react";
import { QRSettings } from "@/pages/QRGenerator";

interface QRAdvancedColorControllerProps {
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

const lightColors = [
  { name: "أبيض", value: "#ffffff" },
  { name: "رمادي فاتح", value: "#f3f4f6" },
  { name: "أزرق فاتح", value: "#dbeafe" },
  { name: "أخضر فاتح", value: "#d1fae5" },
  { name: "أحمر فاتح", value: "#fee2e2" },
  { name: "بنفسجي فاتح", value: "#ede9fe" },
  { name: "برتقالي فاتح", value: "#fed7aa" },
  { name: "وردي فاتح", value: "#fce7f3" },
];

const QRAdvancedColorController = ({ settings, onSettingsChange }: QRAdvancedColorControllerProps) => {
  const handlePresetColor = (color: string, type: string) => {
    onSettingsChange(type as keyof QRSettings, color);
  };

  const resetColors = () => {
    onSettingsChange('dotsColor', '#000000');
    onSettingsChange('cornerSquareColor', '#000000');
    onSettingsChange('cornerDotColor', '#000000');
    onSettingsChange('backgroundColor', '#ffffff');
  };

  const ColorSection = ({ 
    title, 
    colorKey, 
    currentColor, 
    useLight = false 
  }: { 
    title: string; 
    colorKey: string; 
    currentColor: string;
    useLight?: boolean;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex items-center gap-3">
        <Input
          type="color"
          value={currentColor}
          onChange={(e) => onSettingsChange(colorKey as keyof QRSettings, e.target.value)}
          className="w-16 h-12 cursor-pointer"
        />
        <Input
          type="text"
          value={currentColor}
          onChange={(e) => onSettingsChange(colorKey as keyof QRSettings, e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {(useLight ? lightColors : predefinedColors).map((color) => (
          <button
            key={`${colorKey}-${color.value}`}
            onClick={() => handlePresetColor(color.value, colorKey)}
            className="w-full h-8 rounded border-2 hover:scale-105 transition-transform"
            style={{ 
              backgroundColor: color.value,
              borderColor: currentColor === color.value ? '#ff9178' : (useLight ? '#e5e7eb' : 'transparent')
            }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          تحكم متقدم في الألوان
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dots" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dots">النقاط</TabsTrigger>
            <TabsTrigger value="corners">الزوايا</TabsTrigger>
            <TabsTrigger value="inner">الداخلية</TabsTrigger>
            <TabsTrigger value="background">الخلفية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dots" className="mt-4">
            <ColorSection
              title="لون النقاط الأساسية"
              colorKey="dotsColor"
              currentColor={settings.dotsColor || settings.foregroundColor}
            />
          </TabsContent>
          
          <TabsContent value="corners" className="mt-4">
            <ColorSection
              title="لون الزوايا الخارجية"
              colorKey="cornerSquareColor"
              currentColor={settings.cornerSquareColor || settings.foregroundColor}
            />
          </TabsContent>
          
          <TabsContent value="inner" className="mt-4">
            <ColorSection
              title="لون الزوايا الداخلية"
              colorKey="cornerDotColor"
              currentColor={settings.cornerDotColor || settings.foregroundColor}
            />
          </TabsContent>
          
          <TabsContent value="background" className="mt-4">
            <ColorSection
              title="لون الخلفية"
              colorKey="backgroundColor"
              currentColor={settings.backgroundColor}
              useLight={true}
            />
          </TabsContent>
        </Tabs>
        
        <Button 
          variant="outline" 
          onClick={resetColors}
          className="w-full mt-4"
        >
          <RotateCcw className="w-4 h-4 me-2" />
          إعادة تعيين جميع الألوان
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRAdvancedColorController;