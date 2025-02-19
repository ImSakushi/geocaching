// client/src/components/MapComponent.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon2x = require('leaflet/dist/images/marker-icon-2x.png');
const markerIconUrl = require('leaflet/dist/images/marker-icon.png');
const markerShadow = require('leaflet/dist/images/marker-shadow.png');

// icône par défaut
const defaultIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// icône verte pr les caches trouvées
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// interfaces pr commentaires & caches
export interface Comment {
  _id?: string;
  user?: { email: string };
  text: string;
  date: string;
  likes?: string[];
}

export interface Geocache {
  _id: string;
  gpsCoordinates: { lat: number; lng: number };
  description: string;
  likes?: string[];
  creator?: { email: string };
  comments?: Comment[];
  foundBy?: string[];
}

interface MapProps {
  geocaches: Geocache[];
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (cache: Geocache) => void;
  onFound: (cache: Geocache) => void;
}

// gestion des clics sur la carte
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const MapComponent: React.FC<MapProps> = ({ geocaches, onMapClick, onMarkerClick, onFound }) => {
  const defaultPosition: [number, number] = [48.8566, 2.3522];
  return (
    <MapContainer center={defaultPosition} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <MapClickHandler onMapClick={onMapClick} />
      {geocaches.map((cache) => {
        // icône verte si cache trouvée
        const markerIcon = (cache.foundBy && cache.foundBy.length > 0) ? greenIcon : defaultIcon;
        return (
          <Marker key={cache._id} position={[cache.gpsCoordinates.lat, cache.gpsCoordinates.lng]} icon={markerIcon}>
            <Popup>
              <div>
                <p>{cache.description}</p>
                <p>{cache.likes ? cache.likes.length : 0} likes</p>
                <button onClick={() => onMarkerClick(cache)}>
                  Voir les commentaires
                </button>
                <button onClick={() => onFound(cache)} style={{ marginTop: '5px' }}>
                  Trouvé
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;