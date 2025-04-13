
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type FontSettings = {
  storeName: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  categoryText: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  generalText: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
};

interface FontStyleSelectorProps {
  fontSettings: FontSettings;
  setFontSettings: (settings: FontSettings) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const FontStyleSelector = ({
  fontSettings,
  setFontSettings,
  handleSubmit,
  isLoading,
}: FontStyleSelectorProps) => {
  const [storeNameCustomFont, setStoreNameCustomFont] = useState<File | null>(null);
  const [categoryCustomFont, setCategoryCustomFont] = useState<File | null>(null);
  const [generalCustomFont, setGeneralCustomFont] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, fontType: "storeName" | "categoryText" | "generalText") => {
    if (!file) return;

    try {
      // Convert the file to a Base64 string for storage
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const baseString = reader.result as string;
        
        // Update the font settings with the new custom font
        setFontSettings({
          ...fontSettings,
          [fontType]: {
            ...fontSettings[fontType],
            isCustom: true,
            customFontUrl: baseString,
          },
        });
      };
    } catch (error) {
      console.error("Error uploading font:", error);
      toast({
        title: "خطأ في تحميل الخط",
        description: "حدث خطأ أثناء تحميل الخط. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleFontFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fontType: "storeName" | "categoryText" | "generalText",
    setFileState: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if the file is a font file
      const validExtensions = [".ttf", ".otf", ".woff", ".woff2"];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: "ملف غير صالح",
          description: "يرجى تحميل ملف خط بتنسيق TTF، OTF، WOFF، أو WOFF2.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      setFileState(file);
      handleFileUpload(file, fontType);
    }
  };

  const handleFontTypeChange = (
    value: string,
    fontType: "storeName" | "categoryText" | "generalText"
  ) => {
    setFontSettings({
      ...fontSettings,
      [fontType]: {
        ...fontSettings[fontType],
        isCustom: value === "custom",
        family: value === "default" ? "inherit" : fontSettings[fontType].family,
      },
    });
  };

  return (
    <Card className="mt-4 border rounded-lg shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Store Name Font */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Type className="w-5 h-5 ml-2" />
              <h3 className="text-lg font-medium">خط اسم المتجر</h3>
            </div>
            
            <RadioGroup
              value={fontSettings.storeName.isCustom ? "custom" : "default"}
              onValueChange={(value) => handleFontTypeChange(value, "storeName")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="default" id="store-name-default" />
                <Label htmlFor="store-name-default">الخط الافتراضي</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="custom" id="store-name-custom" />
                <Label htmlFor="store-name-custom">خط مخصص</Label>
              </div>
            </RadioGroup>
            
            {fontSettings.storeName.isCustom && (
              <div className="mt-2">
                <Label htmlFor="store-name-font-file">تحميل ملف الخط</Label>
                <Input
                  id="store-name-font-file"
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={(e) => handleFontFileChange(e, "storeName", setStoreNameCustomFont)}
                  className="mt-1"
                />
                {fontSettings.storeName.customFontUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    تم تحميل الخط بنجاح
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Text Font */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center">
              <Type className="w-5 h-5 ml-2" />
              <h3 className="text-lg font-medium">خط التصنيفات</h3>
            </div>
            
            <RadioGroup
              value={fontSettings.categoryText.isCustom ? "custom" : "default"}
              onValueChange={(value) => handleFontTypeChange(value, "categoryText")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="default" id="category-default" />
                <Label htmlFor="category-default">الخط الافتراضي</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="custom" id="category-custom" />
                <Label htmlFor="category-custom">خط مخصص</Label>
              </div>
            </RadioGroup>
            
            {fontSettings.categoryText.isCustom && (
              <div className="mt-2">
                <Label htmlFor="category-font-file">تحميل ملف الخط</Label>
                <Input
                  id="category-font-file"
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={(e) => handleFontFileChange(e, "categoryText", setCategoryCustomFont)}
                  className="mt-1"
                />
                {fontSettings.categoryText.customFontUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    تم تحميل الخط بنجاح
                  </div>
                )}
              </div>
            )}
          </div>

          {/* General Text Font */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center">
              <Type className="w-5 h-5 ml-2" />
              <h3 className="text-lg font-medium">الخط العام</h3>
            </div>
            
            <RadioGroup
              value={fontSettings.generalText.isCustom ? "custom" : "default"}
              onValueChange={(value) => handleFontTypeChange(value, "generalText")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="default" id="general-default" />
                <Label htmlFor="general-default">الخط الافتراضي</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="custom" id="general-custom" />
                <Label htmlFor="general-custom">خط مخصص</Label>
              </div>
            </RadioGroup>
            
            {fontSettings.generalText.isCustom && (
              <div className="mt-2">
                <Label htmlFor="general-font-file">تحميل ملف الخط</Label>
                <Input
                  id="general-font-file"
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={(e) => handleFontFileChange(e, "generalText", setGeneralCustomFont)}
                  className="mt-1"
                />
                {fontSettings.generalText.customFontUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    تم تحميل الخط بنجاح
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="mt-6 w-full"
          disabled={isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "حفظ إعدادات الخطوط"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FontStyleSelector;
