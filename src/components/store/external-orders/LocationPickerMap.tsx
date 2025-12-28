import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";

interface LocationPickerMapProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

// مكون الخريطة الداخلي - يُحمَّل ديناميكياً
const MapContent = React.lazy(() => import('./MapContent'));

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation
}) => {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // تحديث الموقع عند تغيير initialLocation
  useEffect(() => {
    if (initialLocation) {
      setSelectedPosition(initialLocation);
    }
  }, [initialLocation]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setSelectedPosition(newPos);
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect(selectedPosition);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            اختر موقعك على الخريطة
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* الخريطة */}
        <div className="relative h-[350px]">
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">جاري تحميل الخريطة...</span>
              </div>
            </div>
          }>
            <MapContent
              selectedPosition={selectedPosition}
              onPositionChange={setSelectedPosition}
              initialLocation={initialLocation}
            />
          </Suspense>

          {/* زر تحديد الموقع الحالي */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 z-[1000] shadow-lg gap-2"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
          >
            <Navigation className={`h-4 w-4 ${isGettingLocation ? 'animate-pulse' : ''}`} />
            موقعي
          </Button>
        </div>

        {/* معلومات الموقع المحدد */}
        {selectedPosition && (
          <div className="px-4 py-2 bg-muted/50 text-sm text-center">
            <span className="text-muted-foreground">
              الإحداثيات: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
            </span>
          </div>
        )}

        {/* أزرار التحكم */}
        <div className="p-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleConfirm}
            disabled={!selectedPosition}
          >
            <MapPin className="h-4 w-4 ml-2" />
            تأكيد الموقع
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
