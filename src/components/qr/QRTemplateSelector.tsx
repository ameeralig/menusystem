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
    description: "تصميم أسود وأبيض تقليدي",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-white p-1 rounded border">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-black' : 'bg-gray-200'} rounded-sm`} />
      ))}
    </div>,
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
    name: "أزرق عصري",
    description: "دوائر مع ألوان زرقاء حديثة",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-blue-50 p-1 rounded border">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-blue-600' : 'bg-blue-200'} rounded`} />
      ))}
    </div>,
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
    name: "بنفسجي أنيق",
    description: "مربعات مدورة بألوان بنفسجية هادئة",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-purple-50 p-1 rounded border">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-purple-600' : 'bg-purple-200'} rounded-full`} />
      ))}
    </div>,
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
    name: "رمادي أعمال",
    description: "تصميم احترافي بألوان الشركات",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-gray-100 p-1 rounded border border-gray-300">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-gray-700' : 'bg-gray-300'} rounded-sm transform rotate-45 scale-75`} />
      ))}
    </div>,
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
    name: "برتقالي حيوي",
    description: "ألوان برتقالية زاهية ومبهجة",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-orange-50 p-1 rounded border">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-orange-600' : 'bg-orange-200'} rounded-lg`} />
      ))}
    </div>,
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
    name: "أخضر طبيعي",
    description: "ألوان الطبيعة الخضراء الهادئة",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-green-50 p-1 rounded border">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-green-600' : 'bg-green-200'} rounded-lg transform rotate-45 scale-75`} />
      ))}
    </div>,
    settings: {
      dotsType: "classy-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      dotsColor: "#059669",
      cornerSquareColor: "#047857",
      cornerDotColor: "#34D399",
      backgroundColor: "#F0FDF4"
    }
  },
  {
    id: "dark-mode",
    name: "الوضع المظلم",
    description: "تصميم أنيق للوضع المظلم",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-slate-900 p-1 rounded border border-slate-700">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-white' : 'bg-slate-600'} rounded`} />
      ))}
    </div>,
    settings: {
      dotsType: "rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      dotsColor: "#ffffff",
      cornerSquareColor: "#f1f5f9",
      cornerDotColor: "#cbd5e1",
      backgroundColor: "#0f172a"
    }
  },
  {
    id: "neon-pink",
    name: "زهري نيون",
    description: "تصميم عصري بألوان نيون زاهية",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-pink-950 p-1 rounded border border-pink-500">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-pink-400' : 'bg-pink-800'} rounded-full shadow-sm shadow-pink-400`} />
      ))}
    </div>,
    settings: {
      dotsType: "dots",
      cornerSquareType: "dot",
      cornerDotType: "dot",
      dotsColor: "#ec4899",
      cornerSquareColor: "#be185d",
      cornerDotColor: "#db2777",
      backgroundColor: "#500724"
    }
  },
  {
    id: "cyber-blue",
    name: "أزرق سايبر",
    description: "تصميم مستقبلي بأزرق سايبر",
    preview: <div className="w-8 h-8 grid grid-cols-3 gap-px bg-cyan-950 p-1 rounded border border-cyan-400">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={`${[0,1,2,3,5,6,7,8].includes(i) ? 'bg-cyan-400' : 'bg-cyan-800'} transform rotate-45 scale-75 shadow-sm shadow-cyan-400`} />
      ))}
    </div>,
    settings: {
      dotsType: "classy",
      cornerSquareType: "classy",
      cornerDotType: "diamond",
      dotsColor: "#22d3ee",
      cornerSquareColor: "#0891b2",
      cornerDotColor: "#0e7490",
      backgroundColor: "#083344"
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
        <div className="grid grid-cols-2 gap-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              onClick={() => onApplyTemplate(template.settings)}
              className="h-auto p-3 flex items-center gap-3 hover:scale-105 transition-transform justify-start"
            >
              <div className="flex-shrink-0">
                {template.preview}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{template.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {template.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRTemplateSelector;