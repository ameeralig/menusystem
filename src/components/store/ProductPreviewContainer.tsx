
import { ReactNode } from "react";

interface ProductPreviewContainerProps {
  children: ReactNode;
  colorTheme: string | null;
  coverImageUrl?: string | null;
}

const ProductPreviewContainer = ({ 
  children, 
  colorTheme,
  coverImageUrl
}: ProductPreviewContainerProps) => {
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
    <div className="min-h-screen flex flex-col">
      {coverImageUrl && (
        <div className="relative w-full h-48 sm:h-64">
          <img 
            src={coverImageUrl} 
            alt="صورة الغلاف" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
      )}
      <div className={`flex-1 ${getThemeClasses(colorTheme)} transition-colors duration-300`}>
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewContainer;
