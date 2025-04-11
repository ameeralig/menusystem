
import { ReactNode, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProductPreviewContainerProps {
  children: ReactNode;
  colorTheme: string | null;
  bannerUrl?: string | null;
}

const ProductPreviewContainer = ({ 
  children, 
  colorTheme,
  bannerUrl
}: ProductPreviewContainerProps) => {
  const [imageError, setImageError] = useState(false);
  
  const getThemeClasses = (theme: string | null) => {
    switch (theme) {
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30';
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30';
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30';
      case 'pink':
        return 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/30';
      case 'coral':
        return 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30';
      case 'teal':
        return 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/30';
      case 'amber':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30';
      case 'indigo':
        return 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/30';
      case 'rose':
        return 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/30';
      default:
        return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {bannerUrl && !imageError ? (
        <div className="relative w-full overflow-hidden">
          <AspectRatio ratio={16 / 5} className="w-full">
            <img 
              src={bannerUrl} 
              alt="صورة الغلاف" 
              className="w-full h-full object-cover"
              onError={() => {
                console.error("Error loading image:", bannerUrl);
                setImageError(true);
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </AspectRatio>
        </div>
      ) : null}
      <div className={`flex-1 ${getThemeClasses(colorTheme)} transition-colors duration-300`}>
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewContainer;
