
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CachedImage } from "../CachedImage";

interface BannerSectionProps {
  bannerUrl?: string | null;
}

const BannerSection = ({ bannerUrl }: BannerSectionProps) => {
  if (!bannerUrl) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <AspectRatio ratio={16 / 5} className="w-full">
        <CachedImage
          src={bannerUrl}
          alt="صورة الغلاف"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </AspectRatio>
    </div>
  );
};

export default BannerSection;
