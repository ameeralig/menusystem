
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Wifi, Info, Save } from "lucide-react";

type ContactInfo = {
  description: string;
  address: string;
  phone: string;
  wifi: string;
};

interface ContactInfoEditorProps {
  initialContactInfo: ContactInfo;
  onSave: (contactInfo: ContactInfo) => Promise<void>;
  isLoading: boolean;
}

const ContactInfoEditor = ({ 
  initialContactInfo, 
  onSave, 
  isLoading 
}: ContactInfoEditorProps) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    description: initialContactInfo.description || "",
    address: initialContactInfo.address || "",
    phone: initialContactInfo.phone || "",
    wifi: initialContactInfo.wifi || "",
  });

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(contactInfo);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              وصف المتجر
            </label>
            <Info className="w-4 h-4" />
          </div>
          <Textarea
            id="description"
            placeholder="أضف وصفاً موجزاً للمتجر"
            value={contactInfo.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="resize-none h-24 text-right"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="address" className="text-sm font-medium">
              عنوان المتجر
            </label>
            <MapPin className="w-4 h-4" />
          </div>
          <Input
            id="address"
            placeholder="أضف عنوان المتجر (سيظهر كرابط لخرائط Google)"
            value={contactInfo.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="text-right"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="phone" className="text-sm font-medium">
              رقم الهاتف
            </label>
            <Phone className="w-4 h-4" />
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="أضف رقم هاتف المتجر"
            value={contactInfo.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="text-right"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="wifi" className="text-sm font-medium">
              رمز شبكة Wifi
            </label>
            <Wifi className="w-4 h-4" />
          </div>
          <Input
            id="wifi"
            placeholder="أضف رمز شبكة Wifi الخاصة بالمتجر"
            value={contactInfo.wifi}
            onChange={(e) => handleChange("wifi", e.target.value)}
            className="text-right"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-4"
          disabled={isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "حفظ معلومات المتجر"}
          <Save className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default ContactInfoEditor;
