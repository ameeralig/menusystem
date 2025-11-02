
import { Palette, Moon, Image as ImageIcon, Type, Info, Layout } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CustomizationSection from "./CustomizationSection";
import CollapsibleSubSection from "./CollapsibleSubSection";
import BannerImageUploader from "@/components/store/BannerImageUploader";
import DirectColorPicker from "./color-picker/DirectColorPicker";
import ColorPreviewCard from "./color-picker/ColorPreviewCard";
import FontStyleSelector from "@/components/store/FontStyleSelector";
import TemplateSelector from "./TemplateSelector";
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
  template: string;
  setTemplate: (value: string) => void;
  handleColorThemeSubmit: () => Promise<void>;
  handleBannerSubmit: () => Promise<void>;
  handleFontSettingsSubmit: () => Promise<void>;
  handleDarkModeSubmit: (newValue: boolean) => Promise<void>;
  handleTemplateSubmit: () => Promise<void>;
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
  template,
  setTemplate,
  handleColorThemeSubmit,
  handleBannerSubmit,
  handleFontSettingsSubmit,
  handleDarkModeSubmit,
  handleTemplateSubmit,
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
        {/* قسم القوالب */}
        <CollapsibleSubSection
          title="القوالب والتصاميم"
          icon={<Layout className="h-5 w-5" />}
        >
          <TemplateSelector
            currentTemplate={template}
            setCurrentTemplate={setTemplate}
            handleSubmit={handleTemplateSubmit}
            isLoading={isLoading}
          />
        </CollapsibleSubSection>

        {/* رفع صورة البانر */}
        <CollapsibleSubSection
          title="صورة البانر"
          icon={<ImageIcon className="h-5 w-5" />}
        >
          <BannerImageUploader
            bannerUrl={bannerUrl}
            setBannerUrl={setBannerUrl}
            handleSubmit={handleBannerSubmit}
            isLoading={isLoading}
          />
        </CollapsibleSubSection>

        {/* قسم تخصيص لون الخلفية */}
        <CollapsibleSubSection
          title="تخصيص لون الخلفية"
          icon={<Palette className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              اختر لوناً مخصصاً لخلفية صفحة المعاينة الخاصة بمتجرك
            </p>
            
            {/* معاينة اللون الحالي */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                🎨 اللون المطبق حالياً على خلفية المعاينة
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
            
            {/* ملاحظة توضيحية */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>ملاحظة:</strong> سيتم تطبيق اللون المختار على خلفية صفحة المعاينة فوراً، ويمكنك رؤية التغيير في المعاينة على اليسار.
              </div>
            </div>
          </div>
        </CollapsibleSubSection>

        {/* قسم تخصيص الخطوط */}
        <CollapsibleSubSection
          title="تخصيص الخطوط"
          icon={<Type className="h-5 w-5" />}
        >
          <FontStyleSelector
            fontSettings={fontSettings}
            setFontSettings={setFontSettings}
            handleSubmit={handleFontSettingsSubmit}
            isLoading={isLoading}
          />
        </CollapsibleSubSection>

        {/* قسم الوضع الداكن */}
        <CollapsibleSubSection
          title="الوضع الداكن"
          icon={<Moon className="h-5 w-5" />}
        >
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
        </CollapsibleSubSection>
      </div>
    </CustomizationSection>
  );
};

export default AppearanceSection;
