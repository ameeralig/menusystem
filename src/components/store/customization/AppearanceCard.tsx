
import { Card } from "@/components/ui/card";
import BannerImageUploader from "@/components/store/BannerImageUploader";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import FontStyleSelector from "@/components/store/FontStyleSelector";

interface FontSettings {
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
}

interface AppearanceCardProps {
  bannerUrl: string | null;
  setBannerUrl: (url: string | null) => void;
  colorTheme: string;
  setColorTheme: (value: string) => void;
  fontSettings: FontSettings;
  setFontSettings: (settings: FontSettings) => void;
  handleBannerSubmit: (e?: React.FormEvent) => Promise<void>;
  handleColorThemeSubmit: (e?: React.FormEvent) => Promise<void>;
  handleFontSettingsSubmit: (e?: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const AppearanceCard: React.FC<AppearanceCardProps> = ({
  bannerUrl,
  setBannerUrl,
  colorTheme,
  setColorTheme,
  fontSettings,
  setFontSettings,
  handleBannerSubmit,
  handleColorThemeSubmit,
  handleFontSettingsSubmit,
  isLoading
}) => {
  return (
    <Card className="p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-right">المظهر والتخصيص</h2>
      <div className="space-y-6">
        <BannerImageUploader 
          bannerUrl={bannerUrl}
          setBannerUrl={setBannerUrl}
          handleSubmit={handleBannerSubmit}
          isLoading={isLoading}
        />
        
        <ColorThemeSelector 
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
          handleSubmit={handleColorThemeSubmit}
          isLoading={isLoading}
        />
        
        <h3 className="text-lg font-medium mt-6 mb-2 text-right">تخصيص الخطوط</h3>
        <FontStyleSelector
          fontSettings={fontSettings}
          setFontSettings={setFontSettings}
          handleSubmit={handleFontSettingsSubmit}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
};

export default AppearanceCard;
