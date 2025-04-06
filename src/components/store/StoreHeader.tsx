import { useToast } from "@/hooks/use-toast";

interface StoreHeaderProps {
  storeName: string | null;
  colorTheme: string | null;
  logoUrl?: string | null;
}

const StoreHeader = ({ storeName, colorTheme, logoUrl }: StoreHeaderProps) => {
  const getHeaderStyle = (theme: string | null) => {
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

  return (
    <div className={`${getHeaderStyle(colorTheme)} mb-6 p-4 rounded-xl flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
            <img src={logoUrl} alt={storeName || "Store Logo"} className="w-full h-full object-cover" />
          </div>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight">
          {storeName || "قائمة المنتجات"}
        </h1>
      </div>
    </div>
  );
};

export default StoreHeader;
