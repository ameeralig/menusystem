
import BannerImageUploader from "@/components/store/BannerImageUploader";
import ColorPickerSelector from "@/components/store/ColorPickerSelector";
import FontStyleSelector from "@/components/store/FontStyleSelector";
import { FontSettings } from "../../../pages/StoreCustomization";

interface AppearanceSectionProps {
  bannerUrl: string | null;
  setBannerUrl: (v: string | null) => void;
  handleBannerSubmit: () => Promise<void>;
  colorTheme: string;
  setColorTheme: (v: string) => void;
  handleColorThemeSubmit: () => Promise<void>;
  fontSettings: FontSettings;
  setFontSettings: (settings: FontSettings) => void;
  handleFontSettingsSubmit: () => Promise<void>;
  isLoading: boolean;
}

const AppearanceSection = ({
  bannerUrl,
  setBannerUrl,
  handleBannerSubmit,
  colorTheme,
  setColorTheme,
  // handleColorThemeSubmit,
  fontSettings,
  setFontSettings,
  handleFontSettingsSubmit,
  isLoading,
}: AppearanceSectionProps) => (
  <div className="space-y-6">
    <BannerImageUploader
      bannerUrl={bannerUrl}
      setBannerUrl={setBannerUrl}
      handleSubmit={handleBannerSubmit}
      isLoading={isLoading}
    />
    <ColorPickerSelector
      color={colorTheme}
      setColor={setColorTheme}
      disabled={isLoading}
    />
    <h3 className="text-lg font-medium mt-6 mb-2 text-right">تخصيص الخطوط</h3>
    <FontStyleSelector
      fontSettings={fontSettings}
      setFontSettings={setFontSettings}
      handleSubmit={handleFontSettingsSubmit}
      isLoading={isLoading}
    />
  </div>
);

export default AppearanceSection;
