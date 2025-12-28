import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
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

interface MapContentProps {
  selectedPosition: { lat: number; lng: number } | null;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

// مكون للتعامل مع النقر على الخريطة
const MapClickHandler = ({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
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

const MapContent: React.FC<MapContentProps> = ({
  selectedPosition,
  onPositionChange,
  initialLocation
}) => {
  // موقع العراق الافتراضي (بغداد)
  const defaultCenter: [number, number] = [33.3152, 44.3661];
  const center: [number, number] = initialLocation 
    ? [initialLocation.lat, initialLocation.lng] 
    : defaultCenter;

  const handleMapClick = (lat: number, lng: number) => {
    onPositionChange({ lat, lng });
  };

  return (
    <MapContainer
      center={center}
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
  );
};

export default MapContent;
