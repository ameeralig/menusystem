
import { Share2, Instagram, Facebook, MessageSquare } from "lucide-react";
import SocialLinksEditor from "@/components/store/SocialLinksEditor";
import CustomizationSection from "./CustomizationSection";
import CollapsibleSubSection from "./CollapsibleSubSection";

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
    <CustomizationSection 
      title="روابط التواصل" 
      icon={<Share2 />}
    >
      <CollapsibleSubSection
        title="حسابات التواصل الاجتماعي"
        icon={<Share2 className="h-5 w-5" />}
      >
        <SocialLinksEditor
          initialSocialLinks={socialLinks}
          onSave={handleSocialLinksSubmit}
          isLoading={isLoading}
        />
      </CollapsibleSubSection>
    </CustomizationSection>
  );
};

export default SocialLinksSection;
