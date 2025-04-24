
import ContactInfoEditor from "@/components/store/ContactInfoEditor";
import { Info } from "lucide-react";
import CustomizationSection from "./CustomizationSection";

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
      <ContactInfoEditor
        initialContactInfo={contactInfo}
        onSave={handleContactInfoSubmit}
        isLoading={isLoading}
      />
    </CustomizationSection>
  );
};

export default ContactInfoSection;
