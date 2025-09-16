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
  { 
    id: "square", 
    name: "مربع", 
    preview: <div className="w-3 h-3 bg-current" />,
    description: "نقاط مربعة تقليدية"
  },
  { 
    id: "dots", 
    name: "دائري", 
    preview: <div className="w-3 h-3 bg-current rounded-full" />,
    description: "نقاط دائرية ناعمة"
  },
  { 
    id: "rounded", 
    name: "مدور الحواف", 
    preview: <div className="w-3 h-3 bg-current rounded-sm" />,
    description: "نقاط مربعة بحواف ناعمة"
  },
  { 
    id: "extra-rounded", 
    name: "مدور جدًا", 
    preview: <div className="w-3 h-3 bg-current rounded-lg" />,
    description: "نقاط مدورة جدًا"
  },
  { 
    id: "classy", 
    name: "كلاسيكي", 
    preview: <div className="w-3 h-3 bg-current transform rotate-45" />,
    description: "نقاط كلاسيكية ماسية"
  },
  { 
    id: "classy-rounded", 
    name: "كلاسيكي مدور", 
    preview: <div className="w-3 h-3 bg-current transform rotate-45 rounded-sm" />,
    description: "نقاط ماسية بحواف ناعمة"
  }
];

const cornerSquareStyles = [
  { 
    id: "square", 
    name: "مربع", 
    preview: <div className="w-4 h-4 border-2 border-current" />,
    description: "إطار مربع تقليدي"
  },
  { 
    id: "extra-rounded", 
    name: "مدور", 
    preview: <div className="w-4 h-4 border-2 border-current rounded-lg" />,
    description: "إطار مدور الزوايا"
  }
];

const cornerDotStyles = [
  { 
    id: "square", 
    name: "مربع", 
    preview: <div className="w-2 h-2 bg-current" />,
    description: "نقطة مربعة في المركز"
  },
  { 
    id: "dot", 
    name: "دائري", 
    preview: <div className="w-2 h-2 bg-current rounded-full" />,
    description: "نقطة دائرية في المركز"
  }
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
                className="flex items-center gap-2 h-auto p-2 justify-start"
                title={style.description}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {style.preview}
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium">{style.name}</div>
                  <div className="text-[10px] text-muted-foreground">{style.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* أشكال الزوايا الخارجية */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">شكل الزوايا الخارجية</Label>
          <div className="grid grid-cols-1 gap-2">
            {cornerSquareStyles.map((style) => (
              <Button
                key={style.id}
                variant={settings.cornerSquareType === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSettingsChange('cornerSquareType', style.id)}
                className="flex items-center gap-2 h-auto p-2 justify-start"
                title={style.description}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {style.preview}
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium">{style.name}</div>
                  <div className="text-[10px] text-muted-foreground">{style.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* أشكال الزوايا الداخلية */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">شكل الزوايا الداخلية</Label>
          <div className="grid grid-cols-1 gap-2">
            {cornerDotStyles.map((style) => (
              <Button
                key={style.id}
                variant={settings.cornerDotType === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSettingsChange('cornerDotType', style.id)}
                className="flex items-center gap-2 h-auto p-2 justify-start"
                title={style.description}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {style.preview}
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium">{style.name}</div>
                  <div className="text-[10px] text-muted-foreground">{style.description}</div>
                </div>
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