
import { MapPin, Phone, Wifi, Info } from "lucide-react";
import { useState } from "react";

type ContactInfo = {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifi?: string | null;
};

interface StoreInfoProps {
  contactInfo?: ContactInfo;
  colorTheme: string | null;
}

const StoreInfo = ({ contactInfo, colorTheme }: StoreInfoProps) => {
  const [isWifiCodeVisible, setIsWifiCodeVisible] = useState(false);

  if (!contactInfo || Object.values(contactInfo).every(value => !value)) {
    return null;
  }

  const getThemeClasses = (theme: string | null) => {
    switch (theme) {
      case 'coral':
        return 'text-[#ff9178] dark:text-[#ffbcad]';
      case 'purple':
        return 'text-purple-700 dark:text-purple-300';
      case 'blue':
        return 'text-blue-700 dark:text-blue-300';
      case 'green':
        return 'text-green-700 dark:text-green-300';
      case 'pink':
        return 'text-pink-700 dark:text-pink-300';
      case 'teal':
        return 'text-teal-700 dark:text-teal-300';
      case 'amber':
        return 'text-amber-700 dark:text-amber-300';
      case 'indigo':
        return 'text-indigo-700 dark:text-indigo-300';
      case 'rose':
        return 'text-rose-700 dark:text-rose-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const themeIconClasses = getThemeClasses(colorTheme);

  const handleGoogleMapsClick = () => {
    if (contactInfo.address) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(contactInfo.address)}`, "_blank");
    }
  };

  const toggleWifiCode = () => {
    setIsWifiCodeVisible(!isWifiCodeVisible);
  };

  return (
    <div className="mt-2 mb-6 text-right space-y-3">
      {contactInfo.description && (
        <div className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-300">
          <p className="text-sm">{contactInfo.description}</p>
          <Info className={`w-4 h-4 ${themeIconClasses}`} />
        </div>
      )}

      {contactInfo.address && (
        <div 
          className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-300 cursor-pointer hover:underline" 
          onClick={handleGoogleMapsClick}
        >
          <p className="text-sm">{contactInfo.address}</p>
          <MapPin className={`w-4 h-4 ${themeIconClasses}`} />
        </div>
      )}

      {contactInfo.phone && (
        <div className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-300">
          <a href={`tel:${contactInfo.phone}`} className="text-sm hover:underline">
            {contactInfo.phone}
          </a>
          <Phone className={`w-4 h-4 ${themeIconClasses}`} />
        </div>
      )}

      {contactInfo.wifi && (
        <div className="flex flex-col items-end">
          <div 
            className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={toggleWifiCode}
          >
            <p className="text-sm">رمز شبكة Wifi</p>
            <Wifi className={`w-4 h-4 ${themeIconClasses}`} />
          </div>
          
          {isWifiCodeVisible && (
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
              <p className="font-mono">{contactInfo.wifi}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreInfo;
