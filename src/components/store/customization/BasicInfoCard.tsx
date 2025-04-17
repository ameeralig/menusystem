
import { Card } from "@/components/ui/card";
import StoreNameEditor from "@/components/store/StoreNameEditor";
import StoreSlugEditor from "@/components/store/StoreSlugEditor";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

interface BasicInfoCardProps {
  storeName: string;
  setStoreName: (value: string) => void;
  storeSlug: string;
  setStoreSlug: (value: string) => void;
  isSlugEditing: boolean;
  setIsSlugEditing: (value: boolean) => void;
  handleNameSubmit: (e: React.FormEvent) => Promise<void>;
  handleSlugSubmit: (e: React.FormEvent) => Promise<void>;
  openQrModal: () => void;
  isLoading: boolean;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  storeName,
  setStoreName,
  storeSlug,
  setStoreSlug,
  isSlugEditing,
  setIsSlugEditing,
  handleNameSubmit,
  handleSlugSubmit,
  openQrModal,
  isLoading
}) => {
  return (
    <Card className="p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-right">المعلومات الأساسية</h2>
      <div className="space-y-6">
        <StoreNameEditor 
          storeName={storeName}
          setStoreName={setStoreName}
          isEditing={false}
          setIsEditing={() => {}}
          handleSubmit={handleNameSubmit}
          isLoading={isLoading}
        />
        
        <div className="space-y-3">
          <StoreSlugEditor
            storeSlug={storeSlug}
            setStoreSlug={setStoreSlug}
            isEditing={isSlugEditing}
            setIsEditing={setIsSlugEditing}
            handleSubmit={handleSlugSubmit}
            isLoading={isLoading}
          />
          
          {storeSlug && (
            <div className="mt-2 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openQrModal}
                className="flex items-center gap-2 text-sm"
              >
                <QrCode className="h-4 w-4" />
                عرض رمز QR للمتجر
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BasicInfoCard;
