
import SocialLinksEditor from "@/components/store/SocialLinksEditor";
import { SocialLinks } from "../../../pages/StoreCustomization";

interface SocialLinksSectionProps {
  socialLinks: SocialLinks;
  handleSocialLinksSubmit: (socialLinks: SocialLinks) => Promise<void>;
  isLoading: boolean;
}

const SocialLinksSection = ({
  socialLinks,
  handleSocialLinksSubmit,
  isLoading,
}: SocialLinksSectionProps) => (
  <SocialLinksEditor
    initialSocialLinks={socialLinks}
    onSave={handleSocialLinksSubmit}
    isLoading={isLoading}
  />
);

export default SocialLinksSection;
