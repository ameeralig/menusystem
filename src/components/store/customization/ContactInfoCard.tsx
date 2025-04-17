
import { Card } from "@/components/ui/card";
import ContactInfoEditor from "@/components/store/ContactInfoEditor";

interface ContactInfo {
  description: string;
  address: string;
  phone: string;
  wifi: string;
  businessHours: string;
}

interface ContactInfoCardProps {
  contactInfo: ContactInfo;
  handleContactInfoSubmit: (info: ContactInfo) => Promise<void>;
  isLoading: boolean;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ 
  contactInfo, 
  handleContactInfoSubmit, 
  isLoading 
}) => {
  return (
    <Card className="p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-right">معلومات المتجر</h2>
      <ContactInfoEditor 
        initialContactInfo={contactInfo}
        onSave={handleContactInfoSubmit}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default ContactInfoCard;
