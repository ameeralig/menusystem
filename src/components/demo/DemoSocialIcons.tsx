
import { Instagram, Facebook, MessageSquare } from "lucide-react";

interface DemoSocialIconsProps {
  socialLinks: {
    instagram: string;
    facebook: string;
    telegram: string;
  };
}

const DemoSocialIcons = ({ socialLinks }: DemoSocialIconsProps) => {
  const getSocialIcon = (platform: string, url: string) => {
    if (!url) return null;

    const iconClasses = "w-5 h-5 transition-colors duration-300";
    const linkClasses = "hover:opacity-75 transition-opacity";

    switch (platform) {
      case 'instagram':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses} key={platform}>
            <Instagram className={`${iconClasses} text-pink-500`} />
          </a>
        );
      case 'facebook':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses} key={platform}>
            <Facebook className={`${iconClasses} text-blue-500`} />
          </a>
        );
      case 'telegram':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClasses} key={platform}>
            <MessageSquare className={`${iconClasses} text-blue-400`} />
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 flex gap-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-full shadow-lg backdrop-blur-sm">
      {Object.entries(socialLinks).map(([platform, url]) => (
        getSocialIcon(platform, url)
      ))}
    </div>
  );
};

export default DemoSocialIcons;
