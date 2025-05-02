
import { Share2 } from "lucide-react";
import SocialLinksEditor from "@/components/store/SocialLinksEditor";
import CustomizationSection from "./CustomizationSection";
import { SocialLinks } from "@/types/store";

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
    <CustomizationSection 
      title="روابط التواصل" 
      icon={<Share2 />}
    >
      <SocialLinksEditor
        initialSocialLinks={socialLinks}
        onSave={handleSocialLinksSubmit}
        isLoading={isLoading}
      />
    </CustomizationSection>
  );
};

export default SocialLinksSection;
