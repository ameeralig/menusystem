
import { useToast } from "@/hooks/use-toast";

interface StoreHeaderProps {
  storeName: string | null;
  colorTheme: string | null;
}

const StoreHeader = ({ storeName, colorTheme }: StoreHeaderProps) => {
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
    <h1 className={`text-3xl font-bold text-center mb-8 ${getThemeClasses(colorTheme)}`}>
      {storeName}
    </h1>
  ) : null;
};

export default StoreHeader;
