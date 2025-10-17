// src/components/RunningMap.jsx
import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RunningMap = ({ coords, color = "blue" }) => {
  if (!coords || coords.length < 2) return <div>지도 정보를 불러오는 중...</div>;
  const center = coords[0];

  return (
    <div style={{ width: "100%", height: "400px", marginTop: "16px" }}>
      <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%", borderRadius: "12px" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
        />
        <Polyline positions={coords} color={color} weight={5} />
        <Marker position={coords[0]} icon={defaultIcon}><Popup>출발점</Popup></Marker>
        <Marker position={coords[coords.length - 1]} icon={defaultIcon}><Popup>도착점</Popup></Marker>
      </MapContainer>
    </div>
  );
};

export default RunningMap;
