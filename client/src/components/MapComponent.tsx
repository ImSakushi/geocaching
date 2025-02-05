import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction pour définir les icônes par défaut avec TypeScript
const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;
DefaultIcon.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export interface Geocache {
  _id: string;
  gpsCoordinates: { lat: number; lng: number };
  description: string;
}

interface MapProps {
  geocaches: Geocache[];
  onMapClick: (lat: number, lng: number) => void;
}

// Composant qui gère les événements sur la carte
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const MapComponent: React.FC<MapProps> = ({ geocaches, onMapClick }) => {
  // Position par défaut (exemple : centre de Paris)
  const defaultPosition: [number, number] = [48.8566, 2.3522];

  return (
    <MapContainer center={defaultPosition} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        {...{
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }}
      />
      <MapClickHandler onMapClick={onMapClick} />
      {geocaches.map((cache) => (
        <Marker
          key={cache._id}
          position={[cache.gpsCoordinates.lat, cache.gpsCoordinates.lng]}
        >
          <Popup>{cache.description}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;