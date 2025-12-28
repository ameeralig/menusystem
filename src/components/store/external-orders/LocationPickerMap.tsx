import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";
import 'leaflet/dist/leaflet.css';

// إصلاح أيقونة الـ marker الافتراضية
const markerIcon = new L.Icon({
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

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // موقع العراق الافتراضي (بغداد)
  const defaultCenter: [number, number] = [33.3152, 44.3661];

  // تهيئة الخريطة
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || mapRef.current) return;

    const center: [number, number] = initialLocation 
      ? [initialLocation.lat, initialLocation.lng] 
      : defaultCenter;

    // إنشاء الخريطة
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: initialLocation ? 16 : 6,
      zoomControl: true
    });

    // إضافة طبقة الخريطة
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // إضافة marker إذا كان هناك موقع مبدئي
    if (initialLocation) {
      const marker = L.marker([initialLocation.lat, initialLocation.lng], { icon: markerIcon }).addTo(map);
      markerRef.current = marker;
    }

    // التعامل مع النقر على الخريطة
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedPosition({ lat, lng });

      // تحديث أو إنشاء marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        markerRef.current = marker;
      }
    });

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [isOpen]);

  // تحديث الموقع على الخريطة
  useEffect(() => {
    if (!mapRef.current || !selectedPosition) return;

    mapRef.current.flyTo([selectedPosition.lat, selectedPosition.lng], 16, { duration: 1 });

    if (markerRef.current) {
      markerRef.current.setLatLng([selectedPosition.lat, selectedPosition.lng]);
    } else {
      const marker = L.marker([selectedPosition.lat, selectedPosition.lng], { icon: markerIcon }).addTo(mapRef.current);
      markerRef.current = marker;
    }
  }, [selectedPosition]);

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

  const handleClose = () => {
    // تنظيف الخريطة عند الإغلاق
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      setIsMapReady(false);
    }
    onClose();
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
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* الخريطة */}
        <div className="relative h-[350px]">
          <div ref={mapContainerRef} className="h-full w-full" />
          
          {!isMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">جاري تحميل الخريطة...</span>
              </div>
            </div>
          )}

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
          <Button variant="outline" className="flex-1" onClick={handleClose}>
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
