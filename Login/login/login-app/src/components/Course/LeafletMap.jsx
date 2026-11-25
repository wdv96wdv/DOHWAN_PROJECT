import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Auto-fit bounds component
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 1) {
      try {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [30, 30] });
      } catch (e) {
        console.warn('Map fitBounds error:', e);
      }
    }
  }, [coords, map]);
  return null;
}

const LeafletMap = ({ courseId, coords, center, themeColor }) => {
  if (!coords || coords.length < 2) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>코스 좌표 데이터가 없습니다.</div>;
  }

  const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const finishIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const polylineOptions = {
    color: themeColor || '#00ffcc',
    weight: 5,
    opacity: 0.9,
    lineJoin: 'round',
    lineCap: 'round'
  };

  return (
    <MapContainer
      center={center || coords[0]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={coords} pathOptions={polylineOptions} />
      <Marker position={coords[0]} icon={startIcon}>
        <Popup><b>🚩 출발 지점 (Start)</b></Popup>
      </Marker>
      <Marker position={coords[coords.length - 1]} icon={finishIcon}>
        <Popup><b>🏁 도착 지점 (Finish)</b></Popup>
      </Marker>
      <FitBounds coords={coords} />
    </MapContainer>
  );
};

export default LeafletMap;
