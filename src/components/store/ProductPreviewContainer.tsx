
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
        <div className="relative w-full h-64 sm:h-80">
          <img 
            src={coverImageUrl} 
            alt="صورة الغلاف" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          
          {/* Store Info Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-10 p-4">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-center">
              {/* عنوان المتجر يظهر هنا من خلال المكون StoreProductsDisplay */}
            </h1>
            <div className="flex flex-col items-center space-y-2 mt-4">
              {/* معلومات اتصال افتراضية للتوضيح */}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="text-sm">العنوان سيظهر هنا</span>
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <span className="text-sm">099 123 4567</span>
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
                </svg>
                <span className="text-sm">WiFi_Password123</span>
              </div>
            </div>
          </div>
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
