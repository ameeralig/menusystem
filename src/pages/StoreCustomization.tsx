
import StoreCustomizationLayout from "@/components/store/StoreCustomizationLayout";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";
import StoreCoverImageUploader from "@/components/store/StoreCoverImageUploader";
import ColorThemeSelector from "@/components/store/ColorThemeSelector";
import StoreSocialLinksEditor from "@/components/store/StoreSocialLinksEditor";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const StoreCustomization = () => {
  const {
    storeName,
    setStoreName,
    storeSlug,
    setStoreSlug,
    isEditing,
    setIsEditing,
    colorTheme,
    setColorTheme,
    coverImageUrl,
    setCoverImageUrl,
    socialLinks,
    userId,
    isLoading,
    handleSubmit,
    handleSocialLinkChange
  } = useStoreSettings();

  return (
    <StoreCustomizationLayout>
      <StoreNameEditor 
        storeName={storeName}
        setStoreName={setStoreName}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <StoreSlugEditor
        storeSlug={storeSlug}
        setStoreSlug={setStoreSlug}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {userId && (
        <StoreCoverImageUploader
          coverImageUrl={coverImageUrl}
          setCoverImageUrl={setCoverImageUrl}
          userId={userId}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}

      <ColorThemeSelector 
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <StoreSocialLinksEditor
        socialLinks={socialLinks}
        handleSocialLinkChange={handleSocialLinkChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </StoreCustomizationLayout>
  );
};

export default StoreCustomization;
