
import ContactInfoEditor from "@/components/store/ContactInfoEditor";
import { Info, MapPin, Phone, Wifi, Clock } from "lucide-react";
import CustomizationSection from "./CustomizationSection";
import CollapsibleSubSection from "./CollapsibleSubSection";

type ContactInfo = {
  description: string;
  address: string;
  phone: string;
  wifi: string;
  businessHours: string;
};

interface ContactInfoSectionProps {
  contactInfo: ContactInfo;
  handleContactInfoSubmit: (info: ContactInfo) => Promise<void>;
  isLoading: boolean;
}

const ContactInfoSection = ({
  contactInfo,
  handleContactInfoSubmit,
  isLoading
}: ContactInfoSectionProps) => {
  return (
    <CustomizationSection 
      title="معلومات المتجر" 
      icon={<Info />}
    >
      <CollapsibleSubSection
        title="معلومات الاتصال"
        icon={<Phone className="h-5 w-5" />}
      >
        <ContactInfoEditor
          initialContactInfo={contactInfo}
          onSave={handleContactInfoSubmit}
          isLoading={isLoading}
        />
      </CollapsibleSubSection>
    </CustomizationSection>
  );
};

export default ContactInfoSection;
