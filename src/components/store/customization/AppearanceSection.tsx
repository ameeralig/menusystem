
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Palette, Image, Type, Moon } from "lucide-react";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import BannerImageUploader from "@/components/store/BannerImageUploader";
import FontStyleSelector from "@/components/store/FontStyleSelector";
import { FontSettings } from "@/types/store";

interface AppearanceSectionProps {
  colorTheme: string;
  setColorTheme: (theme: string) => void;
  bannerUrl: string | null;
  setBannerUrl: (url: string | null) => void;
  fontSettings: FontSettings;
  setFontSettings: (settings: FontSettings) => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  handleColorThemeSubmit: () => void;
  handleBannerSubmit: () => void;
  handleFontSettingsSubmit: () => void;
  handleDarkModeSubmit: () => void;
  isLoading: boolean;
}

const AppearanceSection = ({
  colorTheme,
  setColorTheme,
  bannerUrl,
  setBannerUrl,
  fontSettings,
  setFontSettings,
  darkMode,
  setDarkMode,
  handleColorThemeSubmit,
  handleBannerSubmit,
  handleFontSettingsSubmit,
  handleDarkModeSubmit,
  isLoading,
}: AppearanceSectionProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2 justify-end">
          <Palette className="h-5 w-5" />
          المظهر والتصميم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-right block mb-2">نمط الألوان</Label>
          <ColorThemeSelector 
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            isLoading={isLoading}
            handleSubmit={async (e) => {
              e.preventDefault();
              handleColorThemeSubmit();
            }}
          />
        </div>

        <div>
          <Label className="text-right block mb-2 flex items-center gap-2 justify-end">
            <Image className="h-4 w-4" />
            صورة الغلاف
          </Label>
          <BannerImageUploader 
            bannerUrl={bannerUrl} 
            setBannerUrl={setBannerUrl}
            handleSubmit={handleBannerSubmit}
            isLoading={isLoading}
          />
        </div>

        <div>
          <Label className="text-right block mb-2 flex items-center gap-2 justify-end">
            <Type className="h-4 w-4" />
            أنماط الخطوط
          </Label>
          <FontStyleSelector 
            fontSettings={fontSettings} 
            setFontSettings={setFontSettings}
            handleSubmit={handleFontSettingsSubmit}
            isLoading={isLoading}
          />
        </div>

        <div>
          <Label className="text-right block mb-2 flex items-center gap-2 justify-end">
            <Moon className="h-4 w-4" />
            الوضع الداكن
          </Label>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              id="dark-mode"
            />
            <Label htmlFor="dark-mode" className="text-sm">
              تفعيل الوضع الداكن في صفحة المعاينة
            </Label>
          </div>
          <Button 
            onClick={handleDarkModeSubmit} 
            className="mt-3 w-full"
            disabled={isLoading}
          >
            {isLoading ? "جارِ الحفظ..." : "حفظ إعداد الوضع الداكن"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSection;
