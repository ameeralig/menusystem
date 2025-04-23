
import StoreNameEditor from "@/components/store/StoreNameEditor";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";

interface BasicInfoSectionProps {
  storeName: string;
  setStoreName: (v: string) => void;
  storeSlug: string;
  setStoreSlug: (v: string) => void;
  isLoading: boolean;
  handleNameSubmit: () => Promise<void>;
  handleSlugSubmit: () => Promise<void>;
}

const BasicInfoSection = ({
  storeName,
  setStoreName,
  storeSlug,
  setStoreSlug,
  isLoading,
  handleNameSubmit,
  handleSlugSubmit,
}: BasicInfoSectionProps) => (
  <div className="space-y-6">
    <StoreNameEditor
      storeName={storeName}
      setStoreName={setStoreName}
      storeSlug={storeSlug}
      setStoreSlug={setStoreSlug}
      isEditing={false}
      setIsEditing={() => {}}
      handleSubmit={handleNameSubmit}
      isLoading={isLoading}
    />
    <StoreSlugEditor
      storeSlug={storeSlug}
      setStoreSlug={setStoreSlug}
      isEditing={false}
      setIsEditing={() => {}}
      handleSubmit={handleSlugSubmit}
      isLoading={isLoading}
    />
  </div>
);

export default BasicInfoSection;
