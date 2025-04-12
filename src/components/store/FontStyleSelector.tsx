
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface FontSettings {
  storeName: {
    fontFamily: string;
    customFont?: string | null;
  };
  categories: {
    fontFamily: string;
    customFont?: string | null;
  };
  general: {
    fontFamily: string;
    customFont?: string | null;
  };
}

const defaultFonts = [
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "cursive", label: "Cursive" },
  { value: "fantasy", label: "Fantasy" },
  { value: "system-ui", label: "النظام" },
  { value: "Tajawal", label: "Tajawal" },
  { value: "Cairo", label: "Cairo" },
  { value: "Amiri", label: "Amiri" },
  { value: "Scheherazade", label: "Scheherazade" },
  { value: "custom", label: "خط مخصص" },
];

interface FontStyleSelectorProps {
  initialFontSettings: FontSettings;
  onSave: (fontSettings: FontSettings) => Promise<void>;
  isLoading: boolean;
}

const FontStyleSelector = ({
  initialFontSettings,
  onSave,
  isLoading,
}: FontStyleSelectorProps) => {
  const [activeTab, setActiveTab] = useState<"storeName" | "categories" | "general">("general");
  const [fontSettings, setFontSettings] = useState<FontSettings>(initialFontSettings);
  const [uploadedFonts, setUploadedFonts] = useState<{
    storeName: File | null;
    categories: File | null;
    general: File | null;
  }>({
    storeName: null,
    categories: null,
    general: null,
  });
  
  const { toast } = useToast();

  const handleFontFamilyChange = (
    section: "storeName" | "categories" | "general",
    value: string
  ) => {
    setFontSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        fontFamily: value,
        customFont: value === "custom" ? prev[section].customFont : null,
      },
    }));
  };

  const handleFontUpload = (
    section: "storeName" | "categories" | "general",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    if (!file.name.endsWith('.ttf') && !file.name.endsWith('.woff') && !file.name.endsWith('.woff2')) {
      toast({
        title: "خطأ في تنسيق الملف",
        description: "يجب أن يكون الملف بتنسيق ttf أو woff أو woff2",
        variant: "destructive",
      });
      return;
    }

    // إنشاء URL للملف المحمل ليتم استخدامه مع @font-face
    const fontUrl = URL.createObjectURL(file);
    
    setUploadedFonts(prev => ({
      ...prev,
      [section]: file
    }));
    
    // تطبيق الخط مباشرة
    const fontFace = new FontFace(`custom-${section}`, `url(${fontUrl})`);
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
      
      setFontSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          fontFamily: "custom",
          customFont: `custom-${section}`,
        }
      }));
      
      toast({
        title: "تم تحميل الخط",
        description: `تم تحميل الخط بنجاح لقسم ${
          section === "storeName" ? "اسم المتجر" : 
          section === "categories" ? "التصنيفات" : "الخط العام"
        }`,
      });
    }).catch(err => {
      console.error("خطأ في تحميل الخط:", err);
      toast({
        title: "خطأ في تحميل الخط",
        description: "حدث خطأ أثناء محاولة تحميل الخط، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    });
  };

  const handleSubmit = async () => {
    try {
      await onSave(fontSettings);
    } catch (error) {
      console.error("Error saving font settings:", error);
    }
  };

  const renderFontUploader = (section: "storeName" | "categories" | "general") => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="block text-right">نوع الخط</Label>
          <Select
            value={fontSettings[section].fontFamily}
            onValueChange={(value) => handleFontFamilyChange(section, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر نوع الخط" />
            </SelectTrigger>
            <SelectContent>
              {defaultFonts.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {fontSettings[section].fontFamily === "custom" && (
          <div className="space-y-2">
            <Label className="block text-right">تحميل خط مخصص</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".ttf,.woff,.woff2"
                onChange={(e) => handleFontUpload(section, e)}
                className="text-right flex-grow"
              />
              <Button 
                type="button" 
                size="icon"
                variant="outline"
                onClick={() => document.getElementById(`font-upload-${section}`)?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                id={`font-upload-${section}`}
                type="file"
                accept=".ttf,.woff,.woff2"
                onChange={(e) => handleFontUpload(section, e)}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 text-right">
              يدعم تنسيقات ttf, woff, woff2
            </p>
            {uploadedFonts[section] && (
              <p className="text-sm text-green-500 text-right">
                تم تحميل: {uploadedFonts[section]?.name}
              </p>
            )}
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm text-gray-500 text-right">معاينة الخط:</p>
          <div 
            className="p-3 border rounded mt-2 text-right"
            style={{ 
              fontFamily: fontSettings[section].fontFamily === "custom" && fontSettings[section].customFont 
                ? fontSettings[section].customFont 
                : fontSettings[section].fontFamily 
            }}
          >
            هذا نص تجريبي لمعاينة الخط المختار 1234567890
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-[#ffbcad] dark:border-[#ff9178]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Type className="h-5 w-5 text-[#ff9178]" />
          <span>تخصيص الخطوط</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">الخط العام</TabsTrigger>
            <TabsTrigger value="categories">التصنيفات</TabsTrigger>
            <TabsTrigger value="storeName">اسم المتجر</TabsTrigger>
          </TabsList>
          <div className="mt-4 space-y-4">
            <TabsContent value="storeName">
              {renderFontUploader("storeName")}
            </TabsContent>
            <TabsContent value="categories">
              {renderFontUploader("categories")}
            </TabsContent>
            <TabsContent value="general">
              {renderFontUploader("general")}
            </TabsContent>
          </div>
        </Tabs>

        <Button
          onClick={handleSubmit}
          className="w-full mt-4 bg-[#ff9178] hover:bg-[#ff7d61] text-white"
          disabled={isLoading}
        >
          <Save className="ml-2 h-4 w-4" />
          {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FontStyleSelector;
