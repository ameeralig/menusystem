
import { useState, useEffect } from "react";
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

  // جلب الإعدادات عند تحميل الصفحة
  useEffect(() => {
    // هذا سيقوم بجلب البيانات مجددًا عند تحميل الصفحة
    // useStoreSettings يقوم بالفعل بجلب البيانات في useEffect الخاص به
  }, []);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings({ store_name: storeName });
  };

  const handleSlugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال نطاق فرعي صالح للمتجر",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    await saveStoreSettings({ slug: storeSlug });
  };

  const getStoreUrl = () => {
    if (storeSlug) {
      return `${storeSlug}.qrmenuc.com`;
    }
    return '';
  };

  const openQrModal = () => {
    if (!storeSlug) {
      toast({
        title: "تنبيه",
        description: "الرجاء تعيين نطاق فرعي للمتجر أولاً",
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
              handleContactInfoSubmit={async (info) => await saveStoreSettings({ contact_info: info })}
              isLoading={isLoading}
            />
            
            <AppearanceCard 
              bannerUrl={bannerUrl}
              setBannerUrl={setBannerUrl}
              colorTheme={colorTheme}
              setColorTheme={setColorTheme}
              fontSettings={fontSettings}
              setFontSettings={setFontSettings}
              handleBannerSubmit={async () => await saveStoreSettings({ banner_url: bannerUrl })}
              handleColorThemeSubmit={async () => await saveStoreSettings({ color_theme: colorTheme })}
              handleFontSettingsSubmit={async () => await saveStoreSettings({ font_settings: fontSettings })}
              isLoading={isLoading}
            />
            
            <SocialLinksCard 
              socialLinks={socialLinks}
              handleSocialLinksSubmit={async (links) => await saveStoreSettings({ social_links: links })}
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
