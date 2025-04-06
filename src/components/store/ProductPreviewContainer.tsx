
import { ReactNode } from "react";

interface ProductPreviewContainerProps {
  children: ReactNode;
  colorTheme: string | null;
  bannerUrl?: string | null;
}

const ProductPreviewContainer = ({ children, colorTheme, bannerUrl }: ProductPreviewContainerProps) => {
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
      default:
        return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeClasses(colorTheme)} transition-colors duration-300`}>
      {bannerUrl && (
        <div className="w-full h-48 sm:h-64 relative">
          <img 
            src={bannerUrl} 
            alt="صورة الغلاف" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-6xl">
        {children}
      </div>
    </div>
  );
};

export default ProductPreviewContainer;
