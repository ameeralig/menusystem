
import { MapPin, Phone, Wifi, Info, Clock } from "lucide-react";
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger, 
} from "@/components/ui/collapsible";

type WorkDay = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type ContactInfo = {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifi?: string | null;
  businessHours?: string | null;
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

  // دالة لتحويل الوقت من نظام 24 ساعة إلى 12 ساعة
  const convertTo12Hour = (time24: string) => {
    if (!time24) return time24;
    
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    
    if (hour24 === 0) {
      return `12:${minutes} ص`;
    } else if (hour24 < 12) {
      return `${hour24}:${minutes} ص`;
    } else if (hour24 === 12) {
      return `12:${minutes} م`;
    } else {
      return `${hour24 - 12}:${minutes} م`;
    }
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
          <div className="text-left mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">المتجر مغلق حالياً</p>
          </div>
        );
      }
      
      return (
        <div className="text-left mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="grid gap-1">
            {workDays.map((day) => {
              const dayLabel = weekDays.find(d => d.id === day.day)?.label || day.day;
              return (
                <div key={day.day} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <span className="font-medium">{dayLabel}</span>
                  </div>
                  <div>
                    {day.isOpen ? (
                      <span className="text-green-600 dark:text-green-400">
                        {convertTo12Hour(day.openTime)} - {convertTo12Hour(day.closeTime)}
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400">مغلق</span>
                    )}
                  </div>
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
    <div className="mt-2 mb-6 text-left space-y-3">
      {contactInfo.description && (
        <div className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300">
          <Info className={`w-4 h-4 ${themeIconClasses}`} />
          <p className="text-sm">{contactInfo.description}</p>
        </div>
      )}

      {contactInfo.businessHours && (
        <Collapsible
          open={isBusinessHoursOpen}
          onOpenChange={setIsBusinessHoursOpen}
          className="border-b border-transparent"
        >
          <CollapsibleTrigger className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-1 transition-colors">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${themeIconClasses}`} />
              <p className="text-sm font-medium">ساعات العمل</p>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1">
            {formatBusinessHours()}
          </CollapsibleContent>
        </Collapsible>
      )}

      {contactInfo.address && (
        <div 
          className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300 cursor-pointer hover:underline" 
          onClick={handleGoogleMapsClick}
        >
          <MapPin className={`w-4 h-4 ${themeIconClasses}`} />
          <p className="text-sm">انقر هنا لمعرفة موقع المتجر</p>
        </div>
      )}

      {contactInfo.phone && (
        <div className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300">
          <Phone className={`w-4 h-4 ${themeIconClasses}`} />
          <a href={`tel:${contactInfo.phone}`} className="text-sm hover:underline">
            {contactInfo.phone}
          </a>
        </div>
      )}

      {contactInfo.wifi && (
        <div className="flex flex-col items-start">
          <div 
            className="flex items-center justify-start gap-2 text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={toggleWifiCode}
          >
            <Wifi className={`w-4 h-4 ${themeIconClasses}`} />
            <p className="text-sm">رمز شبكة Wifi</p>
          </div>
          
          {isWifiCodeVisible && (
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-center w-full">
              <p className="font-mono">{contactInfo.wifi}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreInfo;
