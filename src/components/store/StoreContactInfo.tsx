
import { MapPin, Phone, Wifi } from "lucide-react";

type ContactInfo = {
  address?: string;
  phone?: string;
  wifi?: string;
  description?: string;
  cover_image?: string;
};

interface StoreContactInfoProps {
  contactInfo: ContactInfo | null;
}

const StoreContactInfo = ({ contactInfo }: StoreContactInfoProps) => {
  if (!contactInfo) return null;

  // Check if we have any contact info to display
  const hasContactInfo = contactInfo.address || contactInfo.phone || 
                         contactInfo.wifi || contactInfo.description || 
                         contactInfo.cover_image;
  
  if (!hasContactInfo) return null;

  return (
    <div className="w-full space-y-4 mb-6">
      {contactInfo.cover_image && (
        <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-lg">
          <img 
            src={contactInfo.cover_image} 
            alt="غلاف المتجر" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex flex-col space-y-2 px-4">
        {contactInfo.address && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <MapPin className="w-5 h-5 text-red-500 ml-2 flex-shrink-0" />
            <span>{contactInfo.address}</span>
          </div>
        )}
        
        {contactInfo.phone && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Phone className="w-5 h-5 text-green-500 ml-2 flex-shrink-0" />
            <span>{contactInfo.phone}</span>
          </div>
        )}
        
        {contactInfo.wifi && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Wifi className="w-5 h-5 text-blue-500 ml-2 flex-shrink-0" />
            <span>{contactInfo.wifi}</span>
          </div>
        )}
        
        {contactInfo.description && (
          <div className="mt-3 text-gray-600 dark:text-gray-400">
            <p className="whitespace-pre-line">{contactInfo.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreContactInfo;
