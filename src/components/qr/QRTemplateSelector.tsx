import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { QRSettings } from "@/pages/QRGenerator";

interface QRTemplateSelectorProps {
  onApplyTemplate: (template: Partial<QRSettings>) => void;
}

const templates = [
  {
    id: "classic",
    name: "كلاسيكي",
    description: "أسود وأبيض تقليدي",
    settings: {
      dotsType: "square",
      cornerSquareType: "square",
      cornerDotType: "square",
      dotsColor: "#000000",
      cornerSquareColor: "#000000",
      cornerDotColor: "#000000",
      backgroundColor: "#ffffff"
    }
  },
  {
    id: "modern",
    name: "عصري",
    description: "دوائر مع ألوان متدرجة",
    settings: {
      dotsType: "dots",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      dotsColor: "#3B82F6",
      cornerSquareColor: "#1E40AF",
      cornerDotColor: "#60A5FA",
      backgroundColor: "#ffffff"
    }
  },
  {
    id: "elegant",
    name: "أنيق",
    description: "مربعات مدورة بألوان هادئة",
    settings: {
      dotsType: "rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      dotsColor: "#8B5CF6",
      cornerSquareColor: "#7C3AED",
      cornerDotColor: "#A78BFA",
      backgroundColor: "#F8FAFC"
    }
  },
  {
    id: "business",
    name: "أعمال",
    description: "احترافي بألوان الشركات",
    settings: {
      dotsType: "classy",
      cornerSquareType: "square",
      cornerDotType: "square",
      dotsColor: "#1F2937",
      cornerSquareColor: "#374151",
      cornerDotColor: "#6B7280",
      backgroundColor: "#F9FAFB"
    }
  },
  {
    id: "vibrant",
    name: "حيوي",
    description: "ألوان زاهية ومبهجة",
    settings: {
      dotsType: "extra-rounded",
      cornerSquareType: "dot",
      cornerDotType: "dot",
      dotsColor: "#EF4444",
      cornerSquareColor: "#F97316",
      cornerDotColor: "#EAB308",
      backgroundColor: "#FFFBEB"
    }
  },
  {
    id: "nature",
    name: "طبيعي",
    description: "ألوان الطبيعة الهادئة",
    settings: {
      dotsType: "classy-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      dotsColor: "#059669",
      cornerSquareColor: "#047857",
      cornerDotColor: "#34D399",
      backgroundColor: "#F0FDF4"
    }
  }
];

const QRTemplateSelector = ({ onApplyTemplate }: QRTemplateSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          قوالب جاهزة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              onClick={() => onApplyTemplate(template.settings)}
              className="flex flex-col items-start gap-2 h-auto p-4 text-start"
            >
              <div className="flex items-center gap-2 w-full">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: template.settings.dotsColor }}
                />
                <span className="font-medium">{template.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {template.description}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRTemplateSelector;