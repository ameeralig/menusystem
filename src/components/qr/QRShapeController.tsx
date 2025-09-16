import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shapes, RotateCcw } from "lucide-react";
import { QRSettings } from "@/pages/QRGenerator";

interface QRShapeControllerProps {
  settings: QRSettings;
  onSettingsChange: (key: keyof QRSettings, value: any) => void;
}

const dotStyles = [
  { id: "square", name: "مربع", preview: "⬛" },
  { id: "dots", name: "دائري", preview: "⚫" },
  { id: "rounded", name: "مربع مدور", preview: "🔲" },
  { id: "extra-rounded", name: "مدور جداً", preview: "🟤" },
  { id: "classy", name: "كلاسيكي", preview: "◆" },
  { id: "classy-rounded", name: "كلاسيكي مدور", preview: "◇" }
];

const cornerSquareStyles = [
  { id: "square", name: "مربع", preview: "⬛" },
  { id: "dot", name: "دائري", preview: "⚫" },
  { id: "extra-rounded", name: "مدور", preview: "🔲" }
];

const cornerDotStyles = [
  { id: "square", name: "مربع", preview: "⬜" },
  { id: "dot", name: "دائري", preview: "⚪" }
];

const QRShapeController = ({ settings, onSettingsChange }: QRShapeControllerProps) => {
  const resetShapes = () => {
    onSettingsChange('dotsType', 'square');
    onSettingsChange('cornerSquareType', 'square');
    onSettingsChange('cornerDotType', 'square');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shapes className="w-5 h-5" />
          أشكال أجزاء QR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* أشكال النقاط الأساسية */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">شكل النقاط الأساسية</Label>
          <div className="grid grid-cols-3 gap-2">
            {dotStyles.map((style) => (
              <Button
                key={style.id}
                variant={settings.dotsType === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSettingsChange('dotsType', style.id)}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <span className="text-lg">{style.preview}</span>
                <span className="text-xs">{style.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* أشكال الزوايا الخارجية */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">شكل الزوايا الخارجية</Label>
          <div className="grid grid-cols-3 gap-2">
            {cornerSquareStyles.map((style) => (
              <Button
                key={style.id}
                variant={settings.cornerSquareType === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSettingsChange('cornerSquareType', style.id)}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <span className="text-lg">{style.preview}</span>
                <span className="text-xs">{style.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* أشكال الزوايا الداخلية */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">شكل الزوايا الداخلية</Label>
          <div className="grid grid-cols-2 gap-2">
            {cornerDotStyles.map((style) => (
              <Button
                key={style.id}
                variant={settings.cornerDotType === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSettingsChange('cornerDotType', style.id)}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <span className="text-lg">{style.preview}</span>
                <span className="text-xs">{style.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* زر إعادة تعيين */}
        <Button 
          variant="outline" 
          onClick={resetShapes}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 me-2" />
          إعادة تعيين الأشكال
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRShapeController;