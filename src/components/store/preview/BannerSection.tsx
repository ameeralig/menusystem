
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

interface BannerSectionProps {
  bannerUrl?: string | null;
  imgSrc: string | null;
  imageLoaded: boolean;
  imageError: boolean;
  onImageError: () => void;
  onImageLoad: () => void;
}

const BannerSection = ({
  bannerUrl,
  imgSrc,
  imageLoaded,
  imageError,
  onImageError,
  onImageLoad
}: BannerSectionProps) => {
  if (!bannerUrl) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <AspectRatio ratio={16 / 5} className="w-full">
        {!imageLoaded && !imageError && (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
        {imgSrc && !imageError ? (
          <img 
            src={imgSrc} 
            alt="صورة الغلاف"
            width="1600"
            height="500"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => {
              console.error("خطأ في عرض البانر:", imgSrc);
              onImageError();
            }}
            onLoad={onImageLoad}
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          imageError && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <p className="text-gray-500 dark:text-gray-400">لا يمكن تحميل صورة الغلاف</p>
            </div>
          )
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </AspectRatio>
    </div>
  );
};

export default BannerSection;
