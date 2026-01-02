import { useState, useEffect, CSSProperties } from "react";
import { Edit2, Check, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";

interface InlineStoreNameEditorProps {
  storeName: string | null;
  colorTheme: string | null;
  fontSettings?: {
    storeName?: {
      family: string;
      isCustom: boolean;
      customFontUrl: string | null;
    };
  };
  storeOwnerId: string;
  onUpdate: () => void;
}

const InlineStoreNameEditor = ({
  storeName,
  colorTheme,
  fontSettings,
  storeOwnerId,
  onUpdate,
}: InlineStoreNameEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(storeName || "");
  const [editedColor, setEditedColor] = useState(colorTheme || "#ff9178");
  const [isSaving, setIsSaving] = useState(false);
  const [fontFaceLoaded, setFontFaceLoaded] = useState(false);
  const [fontId, setFontId] = useState<string>("");

  useEffect(() => {
    setEditedName(storeName || "");
  }, [storeName]);

  useEffect(() => {
    setEditedColor(colorTheme || "#ff9178");
  }, [colorTheme]);

  useEffect(() => {
    if (fontSettings?.storeName?.isCustom && fontSettings?.storeName?.customFontUrl) {
      const uniqueId = `store-name-font-${Math.random().toString(36).substring(2, 9)}`;
      setFontId(uniqueId);
      
      const customFontUrl = fontSettings.storeName.customFontUrl;
      let fontFormat = 'truetype';
      if (customFontUrl.includes('font/woff2')) {
        fontFormat = 'woff2';
      } else if (customFontUrl.includes('font/woff')) {
        fontFormat = 'woff';
      } else if (customFontUrl.includes('font/opentype') || customFontUrl.includes('.otf')) {
        fontFormat = 'opentype';
      }
      
      try {
        const fontFace = new FontFace(
          uniqueId, 
          `url("${customFontUrl}") format("${fontFormat}")`,
          { display: 'swap' }
        );
        
        fontFace.load()
          .then((loadedFontFace) => {
            document.fonts.add(loadedFontFace);
            setFontFaceLoaded(true);
          })
          .catch(() => {
            setFontFaceLoaded(false);
          });
      } catch {
        setFontFaceLoaded(false);
      }
    }
  }, [fontSettings?.storeName?.customFontUrl, fontSettings?.storeName?.isCustom]);

  const handleSave = async () => {
    if (!editedName.trim()) {
      toast.error("اسم المتجر لا يمكن أن يكون فارغاً");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({
          store_name: editedName.trim(),
          color_theme: editedColor,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", storeOwnerId);

      if (error) throw error;

      toast.success("تم حفظ التغييرات");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("خطأ في حفظ التغييرات:", error);
      toast.error("فشل حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = async (newColor: string) => {
    setEditedColor(newColor);
    
    // Auto-save color
    try {
      await supabase
        .from("store_settings")
        .update({
          color_theme: newColor,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", storeOwnerId);

      toast.success("تم تغيير اللون");
      onUpdate();
    } catch (error) {
      console.error("خطأ في تغيير اللون:", error);
      toast.error("فشل تغيير اللون");
    }
  };

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    const validTypes = ['.ttf', '.otf', '.woff', '.woff2'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast.error("يرجى اختيار ملف خط صالح (.ttf, .otf, .woff, .woff2)");
      return;
    }

    // التحقق من حجم الملف (حد أقصى 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً. الحد الأقصى 2MB");
      return;
    }

    try {
      // تحويل الملف إلى Data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fontDataUrl = e.target?.result as string;
        
        // حفظ الخط في قاعدة البيانات
        const updatedFontSettings = {
          ...fontSettings,
          storeName: {
            family: file.name,
            isCustom: true,
            customFontUrl: fontDataUrl,
          },
        };

        const { error } = await supabase
          .from("store_settings")
          .update({
            font_settings: updatedFontSettings,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", storeOwnerId);

        if (error) throw error;

        toast.success("تم تحميل الخط بنجاح");
        onUpdate();
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("خطأ في تحميل الخط:", error);
      toast.error("فشل تحميل الخط");
    }
  };

  const getStoreNameStyle = (): CSSProperties => {
    let style: CSSProperties = {
      minHeight: '3.5rem',
      fontSizeAdjust: '0.5',
    };
    
    if (fontSettings?.storeName?.isCustom && fontId) {
      style.fontFamily = fontFaceLoaded 
        ? `${fontId}, Arial, sans-serif`
        : `Arial, sans-serif`;
    }
    
    if (editedColor && editedColor.startsWith('#')) {
      style.color = editedColor;
    }
    
    return style;
  };

  if (isEditing) {
    return (
      <div className="space-y-4 my-4 p-4 bg-background/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-border">
        <div className="flex items-center gap-2">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="text-xl font-bold text-center bg-background dark:bg-gray-900 text-foreground"
            placeholder="اسم المتجر"
            dir="rtl"
          />
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-background dark:bg-gray-900 text-foreground border-border">
                <Palette className="h-4 w-4 ml-2" />
                تغيير اللون
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-background dark:bg-gray-800 border-border">
              <div className="space-y-2">
                <Label className="text-foreground">لون اسم المتجر</Label>
                <HexColorPicker color={editedColor} onChange={handleColorChange} />
                <Input
                  value={editedColor}
                  onChange={(e) => setEditedColor(e.target.value)}
                  placeholder="#ff9178"
                  className="mt-2 bg-background dark:bg-gray-900 text-foreground"
                />
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" asChild className="bg-background dark:bg-gray-900 text-foreground border-border">
            <label className="cursor-pointer">
              <Type className="h-4 w-4 ml-2" />
              تحميل خط
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFontUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك اسم متجر، عرض المحرر الكامل مباشرة
  if (!storeName) {
    return (
      <div className="text-center mb-4">
        <div className="inline-block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || !editedName.trim()}
              className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 text-white p-0 flex-shrink-0"
            >
              {isSaving ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Check className="h-6 w-6" />
              )}
            </Button>
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="اسم المتجر"
              className="text-xl font-bold text-center h-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-full"
              dir="rtl"
            />
          </div>
          
          <div className="flex justify-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full px-4 h-10 gap-2">
                  <Palette className="h-4 w-4" />
                  <span>تغيير اللون</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 z-[100]" align="center">
                <HexColorPicker color={editedColor} onChange={handleColorChange} />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" className="rounded-full px-4 h-10 gap-2" asChild>
              <label className="cursor-pointer">
                <Type className="h-4 w-4" />
                <span>تحميل خط</span>
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFontUpload}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <h1 
        className="text-6xl md:text-10xl font-bold text-center mb-2 cursor-pointer hover:opacity-80 transition-opacity"
        style={getStoreNameStyle()}
        dir="rtl"
        onClick={() => setIsEditing(true)}
        title="انقر للتعديل"
      >
        {storeName}
      </h1>
    </div>
  );
};

export default InlineStoreNameEditor;
