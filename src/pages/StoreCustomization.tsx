
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QrCodeModal from "@/components/dashboard/QrCodeModal";
import BasicInfoCard from "@/components/store/customization/BasicInfoCard";
import ContactInfoCard from "@/components/store/customization/ContactInfoCard";
import AppearanceCard from "@/components/store/customization/AppearanceCard";
import SocialLinksCard from "@/components/store/customization/SocialLinksCard";
import { useStoreSettings } from "@/components/store/customization/useStoreSettings";
import { SocialLinks, ContactInfo } from "@/components/store/customization/types";
import { useToast } from "@/hooks/use-toast";

const StoreCustomization = () => {
  const {
    storeName,
    setStoreName,
    storeSlug,
    setStoreSlug,
    colorTheme,
    setColorTheme,
    bannerUrl,
    setBannerUrl,
    fontSettings,
    setFontSettings,
    contactInfo,
    setContactInfo,
    socialLinks,
    setSocialLinks,
    isLoading,
    saveStoreSettings
  } = useStoreSettings();

  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings({ store_name: storeName });
  };

  const handleSlugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رابط صالح للمتجر",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    await saveStoreSettings({ slug: storeSlug });
  };

  const handleColorThemeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await saveStoreSettings({ color_theme: colorTheme });
  };

  const handleBannerSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await saveStoreSettings({ banner_url: bannerUrl });
  };

  const handleFontSettingsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await saveStoreSettings({ font_settings: fontSettings });
  };

  const handleSocialLinksSubmit = async (links: SocialLinks) => {
    await saveStoreSettings({ social_links: links });
  };

  const handleContactInfoSubmit = async (info: ContactInfo) => {
    await saveStoreSettings({ contact_info: info });
  };

  const getStoreUrl = () => {
    return storeSlug ? `menusystem.lovable.app/${storeSlug}` : '';
  };

  const openQrModal = () => {
    if (!storeSlug) {
      toast({
        title: "تنبيه",
        description: "الرجاء تعيين رابط للمتجر أولاً",
        duration: 3000,
      });
      return;
    }
    setIsQrModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-4 sm:p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="ml-2" />
          العودة للوحة التحكم
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <h1 className="text-3xl font-bold mb-6 text-right">تخصيص المتجر</h1>
          
          <div className="grid gap-6">
            <BasicInfoCard 
              storeName={storeName}
              setStoreName={setStoreName}
              storeSlug={storeSlug}
              setStoreSlug={setStoreSlug}
              isSlugEditing={isSlugEditing}
              setIsSlugEditing={setIsSlugEditing}
              handleNameSubmit={handleNameSubmit}
              handleSlugSubmit={handleSlugSubmit}
              openQrModal={openQrModal}
              isLoading={isLoading}
            />
            
            <ContactInfoCard 
              contactInfo={contactInfo}
              handleContactInfoSubmit={handleContactInfoSubmit}
              isLoading={isLoading}
            />
            
            <AppearanceCard 
              bannerUrl={bannerUrl}
              setBannerUrl={setBannerUrl}
              colorTheme={colorTheme}
              setColorTheme={setColorTheme}
              fontSettings={fontSettings}
              setFontSettings={setFontSettings}
              handleBannerSubmit={handleBannerSubmit}
              handleColorThemeSubmit={handleColorThemeSubmit}
              handleFontSettingsSubmit={handleFontSettingsSubmit}
              isLoading={isLoading}
            />
            
            <SocialLinksCard 
              socialLinks={socialLinks}
              handleSocialLinksSubmit={handleSocialLinksSubmit}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      </main>

      <QrCodeModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
        storeUrl={getStoreUrl()}
      />
    </div>
  );
};

export default StoreCustomization;
