import React, { useEffect, useRef, useState } from "react";

const RunningMap = ({ courseId, coords, center, themeColor }) => {
  const mapElement = useRef(null);
  const [scriptError, setScriptError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!coords || coords.length < 2) {
      setIsLoading(false);
      return;
    }

    // 카카오 지도 스크립트 로드 함수
    const loadScript = () => {
      // 이미 로드되어 있다면 바로 초기화
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          initMap();
          setIsLoading(false);
        });
        return;
      }

      // 환경변수에서 카카오 맵 키 가져오기
      const clientId = import.meta.env.VITE_KAKAO_MAP_CLIENT_ID || "";
      if (!clientId) {
        setScriptError(true);
        setIsLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${clientId}&autoload=false`;
      script.defer = true;
      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            initMap();
            setIsLoading(false);
          });
        }
      };
      script.onerror = () => {
        setScriptError(true);
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapElement.current || !window.kakao || !window.kakao.maps) return;

      const { kakao } = window;
      const mapOptions = {
        center: new kakao.maps.LatLng(center[0], center[1]),
        level: 4, 
      };

      const map = new kakao.maps.Map(mapElement.current, mapOptions);
      const zoomControl = new kakao.maps.ZoomControl();
      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

      const path = coords.map((c) => new kakao.maps.LatLng(c[0], c[1]));
      const neonColor = themeColor || "#00e5ff";

      // 1. 네온 효과용 광채 (Glow)
      new kakao.maps.Polyline({
        map: map,
        path: path,
        strokeColor: neonColor,
        strokeWeight: 14,
        strokeOpacity: 0.15,
        strokeStyle: 'solid',
        zIndex: 1,
      });

      // 2. 메인 경로 라인
      new kakao.maps.Polyline({
        map: map,
        path: path,
        strokeColor: neonColor,
        strokeWeight: 5,
        strokeOpacity: 1,
        strokeStyle: 'solid',
        zIndex: 2,
      });

      // 3. 커스텀 오버레이 (마커)
      const startPos = path[0];
      const endPos = path[path.length - 1];
      const isLoop = startPos.equals(endPos);

      if (isLoop) {
        const compositeContent = `
          <div class="marker-pulse" style="padding: 6px 14px; background: #111; border: 2px solid ${neonColor}; border-radius: 20px; font-weight: 800; color: #fff; font-size: 11px; display: flex; align-items: center; gap: 6px;">
            <div style="width: 8px; height: 8px; background: ${neonColor}; border-radius: 50%;"></div>
            START & FINISH
          </div>`;
        new kakao.maps.CustomOverlay({
          map: map,
          position: startPos,
          content: compositeContent,
          yAnchor: 1.6,
          zIndex: 3,
        });
      } else {
        const startContent = `<div style="padding: 5px 10px; background: #fff; border: 2px solid ${neonColor}; border-radius: 12px; font-weight: 900; color: #111; font-size: 11px; box-shadow: 0 0 10px ${neonColor};">START</div>`;
        new kakao.maps.CustomOverlay({
          map: map,
          position: startPos,
          content: startContent,
          yAnchor: 1.5,
          zIndex: 3,
        });

        const finishContent = `<div style="padding: 5px 10px; background: #222; border: 2px solid ${neonColor}; border-radius: 12px; font-weight: 900; color: #fff; font-size: 11px; box-shadow: 0 0 10px ${neonColor};">FINISH</div>`;
        new kakao.maps.CustomOverlay({
          map: map,
          position: endPos,
          content: finishContent,
          yAnchor: 1.5,
          zIndex: 3,
        });
      }
    };

    loadScript();
  }, [coords, center, themeColor]);

  if (!coords || coords.length < 2) {
    return <div style={{ color: "white", padding: "20px" }}>선택하신 코스의 위치 데이터가 없습니다.</div>;
  }

  if (scriptError) {
    return (
      <div style={{ color: "white", padding: "40px 20px", textAlign: "center", lineHeight: "1.6" }}>
        <p style={{ color: "#ff4444", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "10px" }}>⚠️ 카카오 지도 연결 실패</p>
        <p>환경변수 설정 또는 도메인 등록 상태를 확인해 주세요.</p>
        <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#aaa" }}>
          * <a href="https://developers.kakao.com" target="_blank" rel="noreferrer" style={{color: "#00ffcc", textDecoration: "underline"}}>카카오 디벨로퍼스</a> [플랫폼 &gt; Web] 확인 필수
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#0b0b0b" }}>
      {isLoading && (
        <div className="map-loading-wrapper">
          <div className="map-spinner"></div>
          <div>LOADING MAP...</div>
        </div>
      )}
      <div 
        ref={mapElement} 
        id={`kakao-map-${courseId}`} 
        className={isLoading ? "" : "map-fade-in"}
        style={{ width: "100%", height: "100%", zIndex: 1 }} 
      />
    </div>
  );
};

export default RunningMap;
