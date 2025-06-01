
import { Palette, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CustomizationSection from "./CustomizationSection";
import BannerImageUploader from "@/components/store/BannerImageUploader";
import DirectColorPicker from "./color-picker/DirectColorPicker";
import ColorPreviewCard from "./color-picker/ColorPreviewCard";
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
  handleDarkModeSubmit: (newValue: boolean) => Promise<void>;
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
  
  const handleDarkModeChange = async (checked: boolean) => {
    console.log("تغيير الوضع الداكن إلى:", checked);
    setDarkMode(checked);
    try {
      await handleDarkModeSubmit(checked);
      console.log("تم حفظ الوضع الداكن بنجاح:", checked);
    } catch (error) {
      console.error("خطأ في حفظ الوضع الداكن:", error);
      // إعادة تعيين الحالة في حالة الخطأ
      setDarkMode(!checked);
    }
  };

  return (
    <CustomizationSection 
      title="المظهر والتخصيص" 
      icon={<Palette />}
    >
      <div className="space-y-8">
        {/* رفع صورة البانر */}
        <BannerImageUploader
          bannerUrl={bannerUrl}
          setBannerUrl={setBannerUrl}
          handleSubmit={handleBannerSubmit}
          isLoading={isLoading}
        />

        {/* قسم تخصيص الألوان الجديد */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4">تخصيص ألوان المتجر</h3>
          
          {/* معاينة اللون الحالي */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              اللون الحالي لمتجرك
            </h4>
            <ColorPreviewCard 
              currentColor={colorTheme.startsWith('#') ? colorTheme : '#ff9178'} 
              isActive={true}
            />
          </div>

          {/* منتقي الألوان المباشر */}
          <DirectColorPicker 
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            handleSubmit={handleColorThemeSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* قسم تخصيص الخطوط */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">تخصيص الخطوط</h3>
          <FontStyleSelector
            fontSettings={fontSettings}
            setFontSettings={setFontSettings}
            handleSubmit={handleFontSettingsSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* قسم الوضع الداكن */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Moon className="h-5 w-5" />
            الوضع الداكن
          </h3>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeChange}
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
