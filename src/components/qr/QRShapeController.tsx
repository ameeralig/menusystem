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
    name: "مربع مدور", 
    preview: <div className="w-3 h-3 bg-current rounded-sm" />,
    description: "مربعات بزوايا مدورة"
  },
  { 
    id: "extra-rounded", 
    name: "مدور جداً", 
    preview: <div className="w-3 h-3 bg-current rounded-lg" />,
    description: "مربعات بزوايا مدورة جداً"
  },
  { 
    id: "classy", 
    name: "كلاسيكي", 
    preview: <div className="w-3 h-3 bg-current transform rotate-45" />,
    description: "أشكال ماسية كلاسيكية"
  },
  { 
    id: "classy-rounded", 
    name: "كلاسيكي مدور", 
    preview: <div className="w-3 h-3 bg-current rounded-sm transform rotate-45" />,
    description: "أشكال ماسية مدورة"
  },
  { 
    id: "diamond", 
    name: "ماسي حاد", 
    preview: <div className="w-3 h-3 bg-current transform rotate-45 border" />,
    description: "أشكال ماسية حادة"
  },
  { 
    id: "star", 
    name: "نجمي", 
    preview: <div className="w-3 h-3 bg-current" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}/>,
    description: "نقاط على شكل نجوم"
  },
  { 
    id: "heart", 
    name: "قلب", 
    preview: <div className="w-3 h-3 bg-current" style={{clipPath: 'polygon(50% 15%, 70% 0%, 85% 15%, 85% 40%, 50% 100%, 15% 40%, 15% 15%, 30% 0%)'}}/>,
    description: "نقاط على شكل قلب"
  },
  { 
    id: "triangle", 
    name: "مثلث", 
    preview: <div className="w-3 h-3 bg-current" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}/>,
    description: "نقاط مثلثة"
  },
  { 
    id: "hexagon", 
    name: "سداسي", 
    preview: <div className="w-3 h-3 bg-current" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'}}/>,
    description: "نقاط سداسية"
  },
  { 
    id: "cross", 
    name: "صليب", 
    preview: <div className="w-3 h-3 bg-current" style={{clipPath: 'polygon(33% 0%, 67% 0%, 67% 33%, 100% 33%, 100% 67%, 67% 67%, 67% 100%, 33% 100%, 33% 67%, 0% 67%, 0% 33%, 33% 33%)'}}/>,
    description: "نقاط صليبية"
  },
  { 
    id: "oval", 
    name: "بيضاوي", 
    preview: <div className="w-3 h-2 bg-current rounded-full" />,
    description: "نقاط بيضاوية"
  },
  { 
    id: "rhombus", 
    name: "معين", 
    preview: <div className="w-3 h-3 bg-current transform rotate-45 rounded-sm" />,
    description: "نقاط معينية"
  },
  { 
    id: "arrow", 
    name: "سهم", 
    preview: <div className="w-3 h-3 bg-current" style={{clipPath: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)'}}/>,
    description: "نقاط سهمية"
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
    id: "dot", 
    name: "دائري", 
    preview: <div className="w-4 h-4 border-2 border-current rounded-full" />,
    description: "إطار دائري"
  },
  { 
    id: "extra-rounded", 
    name: "مدور", 
    preview: <div className="w-4 h-4 border-2 border-current rounded-lg" />,
    description: "إطار مدور الزوايا"
  },
  { 
    id: "classy", 
    name: "كلاسيكي", 
    preview: <div className="w-4 h-4 border-2 border-current transform rotate-45" />,
    description: "إطار ماسي"
  },
  { 
    id: "rounded", 
    name: "نصف مدور", 
    preview: <div className="w-4 h-4 border-2 border-current rounded-md" />,
    description: "إطار نصف مدور"
  },
  { 
    id: "heavy", 
    name: "سميك", 
    preview: <div className="w-4 h-4 border-4 border-current" />,
    description: "إطار سميك"
  },
  { 
    id: "double", 
    name: "مزدوج", 
    preview: <div className="w-4 h-4 border-2 border-current relative"><div className="absolute inset-1 border border-current" /></div>,
    description: "إطار مزدوج"
  },
  { 
    id: "dashed", 
    name: "متقطع", 
    preview: <div className="w-4 h-4 border-2 border-current border-dashed" />,
    description: "إطار متقطع"
  },
  { 
    id: "star", 
    name: "نجمي", 
    preview: <div className="w-4 h-4 border-2 border-current" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}/>,
    description: "إطار نجمي"
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
  },
  { 
    id: "diamond", 
    name: "ماسي", 
    preview: <div className="w-2 h-2 bg-current transform rotate-45" />,
    description: "نقطة ماسية في المركز"
  },
  { 
    id: "heart", 
    name: "قلب", 
    preview: <div className="w-2 h-2 bg-current" style={{clipPath: 'polygon(50% 15%, 70% 0%, 85% 15%, 85% 40%, 50% 100%, 15% 40%, 15% 15%, 30% 0%)'}}/>,
    description: "نقطة قلبية في المركز"
  },
  { 
    id: "star", 
    name: "نجمة", 
    preview: <div className="w-2 h-2 bg-current" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}/>,
    description: "نقطة نجمية في المركز"
  },
  { 
    id: "cross", 
    name: "صليب", 
    preview: <div className="w-2 h-2 bg-current" style={{clipPath: 'polygon(33% 0%, 67% 0%, 67% 33%, 100% 33%, 100% 67%, 67% 67%, 67% 100%, 33% 100%, 33% 67%, 0% 67%, 0% 33%, 33% 33%)'}}/>,
    description: "نقطة صليبية في المركز"
  },
  { 
    id: "triangle", 
    name: "مثلث", 
    preview: <div className="w-2 h-2 bg-current" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}/>,
    description: "نقطة مثلثية في المركز"
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