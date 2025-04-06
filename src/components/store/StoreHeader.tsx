
import { useToast } from "@/hooks/use-toast";

interface StoreHeaderProps {
  storeName: string | null;
  colorTheme: string | null;
  logoUrl?: string | null;
}

const StoreHeader = ({ storeName, colorTheme, logoUrl }: StoreHeaderProps) => {
  const getThemeClasses = (theme: string | null) => {
    switch (theme) {
      case 'coral':
        return 'text-[#ff9178] dark:text-[#ffbcad]';
      case 'purple':
        return 'text-purple-900 dark:text-purple-100';
      case 'blue':
        return 'text-blue-900 dark:text-blue-100';
      case 'green':
        return 'text-green-900 dark:text-green-100';
      case 'pink':
        return 'text-pink-900 dark:text-pink-100';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  return storeName ? (
    <div className="text-center mb-8">
      {logoUrl && (
        <div className="mb-4 flex justify-center">
          <img 
            src={logoUrl} 
            alt={storeName} 
            className="h-20 object-contain"
          />
        </div>
      )}
      <h1 className={`text-3xl font-bold ${getThemeClasses(colorTheme)}`}>
        {storeName}
      </h1>
    </div>
  ) : null;
};

export default StoreHeader;
