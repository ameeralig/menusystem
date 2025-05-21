
import { Palette } from "lucide-react";
import CustomizationSection from "./CustomizationSection";
import BannerImageUploader from "@/components/store/BannerImageUploader";
import ProfileImageUploader from "@/components/store/ProfileImageUploader";
import ColorPickerAdvanced from "./ColorPickerAdvanced";
import FontStyleSelector from "@/components/store/FontStyleSelector";
import { FontSettings } from "@/types/store";

interface AppearanceSectionProps {
  colorTheme: string;
  setColorTheme: (value: string) => void;
  bannerUrl: string | null;
  setBannerUrl: (url: string | null) => void;
  profileImageUrl: string | null;
  setProfileImageUrl: (url: string | null) => void;
  fontSettings: FontSettings;
  setFontSettings: (value: FontSettings) => void;
  handleColorThemeSubmit: () => Promise<void>;
  handleBannerSubmit: () => Promise<void>;
  handleProfileImageSubmit: () => Promise<void>;
  handleFontSettingsSubmit: () => Promise<void>;
  isLoading: boolean;
}

const AppearanceSection = ({
  colorTheme,
  setColorTheme,
  bannerUrl,
  setBannerUrl,
  profileImageUrl,
  setProfileImageUrl,
  fontSettings,
  setFontSettings,
  handleColorThemeSubmit,
  handleBannerSubmit,
  handleProfileImageSubmit,
  handleFontSettingsSubmit,
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

        <ProfileImageUploader
          profileImageUrl={profileImageUrl}
          setProfileImageUrl={setProfileImageUrl}
          handleSubmit={handleProfileImageSubmit}
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
      </div>
    </CustomizationSection>
  );
};

export default AppearanceSection;
