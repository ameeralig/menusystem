
import ContactInfoEditor from "@/components/store/ContactInfoEditor";
import { ContactInfo } from "../../../pages/StoreCustomization";

interface ContactInfoSectionProps {
  contactInfo: ContactInfo;
  handleContactInfoSubmit: (info: ContactInfo) => Promise<void>;
  isLoading: boolean;
}

const ContactInfoSection = ({ contactInfo, handleContactInfoSubmit, isLoading }: ContactInfoSectionProps) => (
  <ContactInfoEditor
    initialContactInfo={contactInfo}
    onSave={handleContactInfoSubmit}
    isLoading={isLoading}
  />
);

export default ContactInfoSection;
