
import { Share2 } from "lucide-react";
import SocialLinksEditor from "@/components/store/SocialLinksEditor";
import CustomizationSection from "./CustomizationSection";
import { motion } from "framer-motion";

type SocialLinks = {
  instagram: string;
  facebook: string;
  telegram: string;
};

interface SocialLinksSectionProps {
  socialLinks: SocialLinks;
  handleSocialLinksSubmit: (links: SocialLinks) => Promise<void>;
  isLoading: boolean;
}

const SocialLinksSection = ({
  socialLinks,
  handleSocialLinksSubmit,
  isLoading
}: SocialLinksSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <CustomizationSection 
        title="روابط التواصل" 
        icon={<Share2 className="text-accent" />}
        className="glass-card border-accent/30 mb-6"
      >
        <SocialLinksEditor
          initialSocialLinks={socialLinks}
          onSave={handleSocialLinksSubmit}
          isLoading={isLoading}
        />
      </CustomizationSection>
    </motion.div>
  );
};

export default SocialLinksSection;
