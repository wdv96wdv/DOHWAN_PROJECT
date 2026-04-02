import React, { useEffect, useRef, useState } from "react";

const RunningMap = ({ courseId, coords, center, themeColor }) => {
  const mapElement = useRef(null);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!coords || coords.length < 2) return;

    // 네이버 지도 스크립트 로드 함수
    const loadScript = () => {
      // 이미 로드되어 있다면 바로 초기화
      if (window.naver && window.naver.maps) {
        initMap();
        return;
      }

      // .env.local에 저장된 전용 맵 키
      const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID || "";
      if (!clientId) {
        setScriptError(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      script.async = true;
      script.onload = () => initMap();
      script.onerror = () => setScriptError(true);
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapElement.current || !window.naver) return;

      const { naver } = window;
      const mapOptions = {
        center: new naver.maps.LatLng(center[0], center[1]),
        zoom: 14,
        mapTypeId: naver.maps.MapTypeId.NORMAL,
        zoomControl: true, // 줌 컨트롤 추가
        zoomControlOptions: {
          position: naver.maps.Position.TOP_RIGHT,
        },
      };

      // 지도 생성
      const map = new naver.maps.Map(mapElement.current, mapOptions);

      // 좌표 변환 ( [lat, lng] -> naver.maps.LatLng )
      const path = coords.map((c) => new naver.maps.LatLng(c[0], c[1]));
      const neonColor = themeColor || "#00e5ff";

      // 1. 네온 효과용 바깥쪽 두꺼운 선
      new naver.maps.Polyline({
        map: map,
        path: path,
        strokeColor: neonColor,
        strokeWeight: 10,
        strokeOpacity: 0.3,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
      });

      // 2. 안쪽 얇고 진한 코스 라인
      new naver.maps.Polyline({
        map: map,
        path: path,
        strokeColor: neonColor,
        strokeWeight: 4,
        strokeOpacity: 1,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
      });

      // 3. 마커 (출발/도착)
      // 네이버 지도 기본 마커 활용 (추후 아이콘 커스텀 가능)
      new naver.maps.Marker({
        position: path[0],
        map: map,
        title: "START",
        icon: {
            content: `<div style="padding: 4px 8px; background: #fff; border: 2px solid ${neonColor}; border-radius: 12px; font-weight: bold; color: #333; font-size: 11px;">START</div>`,
            anchor: new naver.maps.Point(20, 10)
        }
      });

      new naver.maps.Marker({
        position: path[path.length - 1],
        map: map,
        title: "FINISH",
        icon: {
            content: `<div style="padding: 4px 8px; background: #333; border: 2px solid ${neonColor}; border-radius: 12px; font-weight: bold; color: #fff; font-size: 11px;">FINISH</div>`,
            anchor: new naver.maps.Point(20, 10)
        }
      });
    };

    loadScript();
  }, [coords, center, themeColor]);

  if (!coords || coords.length < 2) {
    return <div style={{ color: "white", padding: "20px" }}>선택하신 코스의 위치 데이터가 없습니다.</div>;
  }

  // API 키 오류 혹은 스크립트 연결 실패 시
  if (scriptError) {
    return (
      <div style={{ color: "white", padding: "40px 20px", textAlign: "center", lineHeight: "1.6" }}>
        <p style={{ color: "#ff4444", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "10px" }}>⚠️ 네이버 지도 연결 실패</p>
        <p>현재 발급된 <code>VITE_NAVER_CLIENT_ID</code> 키는 NCP(네이버 클라우드 플랫폼)의 Web Dynamic Map 권한이 없는 키(쇼핑/검색/로그인용)일 확률이 높습니다.</p>
        <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#aaa" }}>
          * 정상 렌더링을 위해 <a href="https://www.ncloud.com" target="_blank" rel="noreferrer" style={{color: "#00ffcc", textDecoration: "underline"}}>네이버 클라우드 플랫폼</a>에서 <strong>Web Dynamic Map</strong> 서비스 등록 후 Client ID를 재발급 받아 <code>.env.local</code>에 교체해주세요.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div 
        ref={mapElement} 
        id={`naver-map-${courseId}`} 
        style={{ width: "100%", height: "100%", zIndex: 1, backgroundColor: "#f0f0f0" }} 
      />
    </div>
  );
};

export default RunningMap;
