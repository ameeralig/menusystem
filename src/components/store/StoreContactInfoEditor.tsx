
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Wifi, FileText } from "lucide-react";
import StoreCoverImageUploader from "./StoreCoverImageUploader";

interface StoreContactInfoEditorProps {
  address: string;
  setAddress: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  wifi: string;
  setWifi: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  coverImage: string;
  setCoverImage: (url: string) => void;
  isEditing: boolean;
  isLoading: boolean;
}

const StoreContactInfoEditor = ({
  address,
  setAddress,
  phone,
  setPhone,
  wifi,
  setWifi,
  description,
  setDescription,
  coverImage,
  setCoverImage,
  isEditing,
  isLoading
}: StoreContactInfoEditorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-red-500" />
          <Input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="عنوان المتجر"
            className="text-right"
            disabled={!isEditing}
          />
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-green-500" />
          <Input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="رقم الهاتف"
            className="text-right"
            disabled={!isEditing}
          />
        </div>
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-blue-500" />
          <Input
            type="text"
            value={wifi}
            onChange={(e) => setWifi(e.target.value)}
            placeholder="كلمة مرور الواي فاي"
            className="text-right"
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 mt-2 text-gray-500" />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف المتجر"
            className="text-right min-h-[100px]"
            disabled={!isEditing}
          />
        </div>
        
        <StoreCoverImageUploader
          coverImage={coverImage}
          setCoverImage={setCoverImage}
          isEditing={isEditing}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default StoreContactInfoEditor;
