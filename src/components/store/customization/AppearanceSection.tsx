
import { Palette, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CustomizationSection from "./CustomizationSection";
import BannerImageUploader from "@/components/store/BannerImageUploader";
import ColorPickerAdvanced from "./ColorPickerAdvanced";
import FontStyleSelector from "@/components/store/FontStyleSelector";
import { FontSettings } from "@/types/store";

interface AppearanceSectionProps {
  colorTheme: string;
  setColorTheme: (value: string) => void;
  bannerUrl: string | null;
  setBannerUrl: (url: string | null) => void;
  fontSettings: FontSettings;
  setFontSettings: (value: FontSettings) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  handleColorThemeSubmit: () => Promise<void>;
  handleBannerSubmit: () => Promise<void>;
  handleFontSettingsSubmit: () => Promise<void>;
  handleDarkModeSubmit: () => Promise<void>;
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
  isLoading
}: AppearanceSectionProps) => {
  
  return (
    <CustomizationSection 
      title="المظهر والتخصيص" 
      icon={<Palette />}
    >
      <div className="space-y-6">
        <BannerImageUploader
          bannerUrl={bannerUrl}
          setBannerUrl={setBannerUrl}
          handleSubmit={handleBannerSubmit}
          isLoading={isLoading}
        />

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">تخصيص الألوان</h3>
          <ColorPickerAdvanced 
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            handleSubmit={handleColorThemeSubmit}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">تخصيص الخطوط</h3>
          <FontStyleSelector
            fontSettings={fontSettings}
            setFontSettings={setFontSettings}
            handleSubmit={handleFontSettingsSubmit}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Moon className="h-5 w-5" />
            الوضع الداكن
          </h3>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={async (checked) => {
                  setDarkMode(checked);
                  await handleDarkModeSubmit();
                }}
                disabled={isLoading}
              />
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                {darkMode ? "مفعل" : "غير مفعل"}
              </Label>
            </div>
            <Label htmlFor="dark-mode" className="text-sm text-gray-600 dark:text-gray-400">
              تفعيل الوضع الداكن في صفحة المعاينة
            </Label>
          </div>
        </div>
      </div>
    </CustomizationSection>
  );
};

export default AppearanceSection;
