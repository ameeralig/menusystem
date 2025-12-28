import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X } from "lucide-react";
import 'leaflet/dist/leaflet.css';

// إصلاح أيقونة الـ marker الافتراضية
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerMapProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

// مكون للتعامل مع النقر على الخريطة
const MapClickHandler = ({ onLocationChange }: { onLocationChange: (latlng: LatLng) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng);
    },
  });
  return null;
};

// مكون للتحريك إلى موقع معين
const FlyToLocation = ({ position }: { position: { lat: number; lng: number } | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { duration: 1 });
    }
  }, [position, map]);
  
  return null;
};

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation
}) => {
  // موقع العراق الافتراضي (بغداد)
  const defaultCenter = { lat: 33.3152, lng: 44.3661 };
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleMapClick = (latlng: LatLng) => {
    setSelectedPosition({ lat: latlng.lat, lng: latlng.lng });
  };

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
          <MapContainer
            center={[initialLocation?.lat || defaultCenter.lat, initialLocation?.lng || defaultCenter.lng]}
            zoom={initialLocation ? 16 : 6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationChange={handleMapClick} />
            <FlyToLocation position={selectedPosition} />
            
            {selectedPosition && (
              <Marker 
                position={[selectedPosition.lat, selectedPosition.lng]}
                icon={markerIcon}
              />
            )}
          </MapContainer>

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
