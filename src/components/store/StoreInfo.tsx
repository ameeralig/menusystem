import { MapPin, Phone, Wifi, Info, Clock, ChevronDown } from "lucide-react";
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger, 
} from "@/components/ui/collapsible";
import { ContactInfo } from "@/types/store";

type WorkDay = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

interface StoreInfoProps {
  contactInfo?: ContactInfo;
  colorTheme: string | null;
}

const StoreInfo = ({ contactInfo, colorTheme }: StoreInfoProps) => {
  const [isWifiCodeVisible, setIsWifiCodeVisible] = useState(false);
  const [isBusinessHoursOpen, setIsBusinessHoursOpen] = useState(false);

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

  const formatBusinessHours = () => {
    if (!contactInfo.businessHours) return null;
    
    try {
      const workDays = JSON.parse(contactInfo.businessHours) as WorkDay[];
      if (!Array.isArray(workDays) || workDays.length === 0) return null;
      
      const weekDays = [
        { id: "sunday", label: "الأحد" },
        { id: "monday", label: "الإثنين" },
        { id: "tuesday", label: "الثلاثاء" },
        { id: "wednesday", label: "الأربعاء" },
        { id: "thursday", label: "الخميس" },
        { id: "friday", label: "الجمعة" },
        { id: "saturday", label: "السبت" },
      ];
      
      const openDays = workDays.filter(day => day.isOpen);
      
      if (openDays.length === 0) {
        return (
          <div className="text-right mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">المتجر مغلق حالياً</p>
          </div>
        );
      }
      
      return (
        <div className="text-right mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="grid gap-1">
            {workDays.map((day) => {
              const dayLabel = weekDays.find(d => d.id === day.day)?.label || day.day;
              return (
                <div key={day.day} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    {day.isOpen ? (
                      <span className="text-green-600 dark:text-green-400">{day.openTime} - {day.closeTime}</span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400">مغلق</span>
                    )}
                  </div>
                  <span className="font-medium">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    } catch (e) {
      console.error("Error parsing business hours:", e);
      return null;
    }
  };

  return (
    <div className="mt-2 mb-6 text-right space-y-3">
      {contactInfo.description && (
        <div className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-300">
          <p className="text-sm">{contactInfo.description}</p>
          <Info className={`w-4 h-4 ${themeIconClasses}`} />
        </div>
      )}

      {contactInfo.businessHours && (
        <Collapsible
          open={isBusinessHoursOpen}
          onOpenChange={setIsBusinessHoursOpen}
          className="border-b border-transparent"
        >
          <CollapsibleTrigger className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-300 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-1 transition-colors">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">ساعات العمل</p>
              <Clock className={`w-4 h-4 ${themeIconClasses}`} />
            </div>
            <ChevronDown className={`w-4 h-4 ${isBusinessHoursOpen ? "transform rotate-180" : ""} transition-transform duration-200`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1">
            {formatBusinessHours()}
          </CollapsibleContent>
        </Collapsible>
      )}

      {contactInfo.address && (
        <div 
          className="flex items-center justify-end gap-2 text-gray-700 dark:text-gray-300 cursor-pointer hover:underline" 
          onClick={handleGoogleMapsClick}
        >
          <p className="text-sm">انقر هنا لمعرفة موقع المتجر</p>
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
