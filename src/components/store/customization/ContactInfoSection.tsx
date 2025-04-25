
import ContactInfoEditor from "@/components/store/ContactInfoEditor";
import { Info } from "lucide-react";
import CustomizationSection from "./CustomizationSection";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <CustomizationSection 
        title="معلومات المتجر" 
        icon={<Info className="text-accent" />}
        className="glass-card border-accent/30 mb-6"
      >
        <ContactInfoEditor
          initialContactInfo={contactInfo}
          onSave={handleContactInfoSubmit}
          isLoading={isLoading}
        />
      </CustomizationSection>
    </motion.div>
  );
};

export default ContactInfoSection;
