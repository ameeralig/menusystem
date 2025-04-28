
import { useState } from "react";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import { Store } from "lucide-react";
import CustomizationSection from "./CustomizationSection";

interface StoreDetailsSectionProps {
  storeName: string;
  setStoreName: (value: string) => void;
  storeSlug: string;
  setStoreSlug: (value: string) => void;
  handleNameSubmit: () => Promise<void>;
  handleSlugSubmit: () => Promise<void>;
  isLoading: boolean;
}

const StoreDetailsSection = ({
  storeName,
  setStoreName,
  storeSlug,
  setStoreSlug,
  handleNameSubmit,
  handleSlugSubmit,
  isLoading
}: StoreDetailsSectionProps) => {
  const [isEditingName, setIsEditingName] = useState(false);

  // دمج حفظ الاسم والرابط معًا في عملية واحدة
  const handleSubmit = async () => {
    await handleNameSubmit();
    await handleSlugSubmit();
  };

  return (
    <CustomizationSection 
      title="المعلومات الأساسية" 
      icon={<Store />}
      defaultOpen={true}
    >
      <div className="space-y-6">
        <StoreNameEditor
          storeName={storeName}
          setStoreName={setStoreName}
          storeSlug={storeSlug}
          setStoreSlug={setStoreSlug}
          isEditing={isEditingName}
          setIsEditing={setIsEditingName}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </CustomizationSection>
  );
};

export default StoreDetailsSection;
