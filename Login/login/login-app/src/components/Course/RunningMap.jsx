import React from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 기본 마커 아이콘 설정
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RunningMap = ({ courseId }) => {
  let courseCoords = [];
  let center = [37.5098, 127.1002];
  let color = "blue";

  // ✅ 코스별 좌표 설정
  if (courseId === 1) {
    // 석촌호수
    courseCoords = [
      [37.510775, 127.098332],
      [37.509290, 127.102850],
      [37.506967, 127.100734],
      [37.509119, 127.096543],
      [37.510775, 127.098332],
    ];
    center = [37.5098, 127.1002];
    color = "blue";
  } else if (courseId === 2) {
    // 여의도 10km 코스 (예시)
    courseCoords = [
      [37.5285, 126.933],
      [37.5275, 126.920],
      [37.5289, 126.910],
      [37.5295, 126.933],
    ];
    center = [37.5278, 126.922];
    color = "orange";
  } else if (courseId === 3) {
    // 하프 마라톤 코스 (예시)
    courseCoords = [
      [37.5295, 127.065],
      [37.5200, 127.080],
      [37.5170, 127.095],
      [37.5295, 127.065],
    ];
    center = [37.523, 127.075];
    color = "red";
  }

  // ⚠️ courseCoords가 없으면 렌더링하지 않음
  if (!courseCoords || courseCoords.length < 2) {
    return <div>지도 정보를 불러오는 중...</div>;
  }

  return (
    <div style={{ width: "100%", height: "450px", marginTop: "20px" }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
        />

        <Polyline positions={courseCoords} color={color} weight={5} />

        <Marker position={courseCoords[0]} icon={defaultIcon}>
          <Popup>출발점</Popup>
        </Marker>
        <Marker position={courseCoords[courseCoords.length - 1]} icon={defaultIcon}>
          <Popup>도착점</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default RunningMap;
