
import { Card } from "@/components/ui/card";
import SocialLinksEditor from "@/components/store/SocialLinksEditor";

interface SocialLinks {
  instagram: string;
  facebook: string;
  telegram: string;
}

interface SocialLinksCardProps {
  socialLinks: SocialLinks;
  handleSocialLinksSubmit: (links: SocialLinks) => Promise<void>;
  isLoading: boolean;
}

const SocialLinksCard: React.FC<SocialLinksCardProps> = ({
  socialLinks,
  handleSocialLinksSubmit,
  isLoading
}) => {
  return (
    <Card className="p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-right">روابط التواصل</h2>
      <SocialLinksEditor 
        initialSocialLinks={socialLinks}
        onSave={handleSocialLinksSubmit}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default SocialLinksCard;
